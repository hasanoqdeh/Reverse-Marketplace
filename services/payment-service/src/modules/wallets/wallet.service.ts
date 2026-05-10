import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../../infrastructure/redis/redis.service';
import { RabbitMQService, DomainEvent } from '../../infrastructure/rabbitmq/rabbitmq.service';
import { 
  Wallet, 
  WalletStatus,
  TransactionType,
  TransactionStatus
} from '../../common/entities/wallet.entity';
import { WalletTransaction } from '../../common/entities/wallet-transaction.entity';

export interface CreateWalletDto {
  user_id: string;
  currency?: string;
}

export interface WalletTransactionDto {
  user_id: string;
  type: TransactionType;
  amount: number;
  description?: string;
  reference_id?: string;
  reference_type?: string;
  metadata?: Record<string, any>;
  external_reference?: string;
  gateway?: string;
}

export interface DepositFundsDto {
  user_id: string;
  amount: number;
  payment_intent_id: string;
  description?: string;
}

export interface WithdrawFundsDto {
  user_id: string;
  amount: number;
  description?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
    @InjectRepository(WalletTransaction)
    private readonly transactionRepository: Repository<WalletTransaction>,
    private readonly redisService: RedisService,
    private readonly rabbitMQService: RabbitMQService,
    private readonly configService: ConfigService,
    @Inject('DataSource') private readonly dataSource: DataSource,
  ) {}

  async createWallet(data: CreateWalletDto): Promise<Wallet> {
    // Check if wallet already exists
    const existingWallet = await this.walletRepository.findOne({
      where: { user_id: data.user_id },
    });

    if (existingWallet) {
      return existingWallet;
    }

    const wallet = this.walletRepository.create({
      user_id: data.user_id,
      balance: 0.00,
      currency: data.currency || 'SAR',
      status: WalletStatus.ACTIVE,
    });

    const savedWallet = await this.walletRepository.save(wallet);

    // Cache wallet balance
    await this.redisService.cacheWalletBalance(data.user_id, 0.00);

    // Publish wallet created event
    const walletCreatedEvent = this.rabbitMQService.createDomainEvent(
      'wallet.created',
      savedWallet.id,
      {
        userId: data.user_id,
        currency: savedWallet.currency,
        initialBalance: 0.00,
      }
    );
    await this.rabbitMQService.publishEvent('wallet.created', walletCreatedEvent);

    console.log(`Created wallet for user ${data.user_id}`);
    return savedWallet;
  }

  async getWallet(userId: string): Promise<Wallet> {
    // Try cache first
    const cachedBalance = await this.redisService.getCachedWalletBalance(userId);
    
    let wallet = await this.walletRepository.findOne({
      where: { user_id: userId },
      relations: ['transactions'],
    });

    if (!wallet) {
      throw new NotFoundException(`Wallet not found for user ${userId}`);
    }

    if (cachedBalance !== null && cachedBalance !== wallet.balance) {
      // Cache is stale, update it
      await this.redisService.cacheWalletBalance(userId, wallet.balance);
    }

    return wallet;
  }

  async getWalletBalance(userId: string): Promise<number> {
    // Try cache first
    const cachedBalance = await this.redisService.getCachedWalletBalance(userId);
    if (cachedBalance !== null) {
      return cachedBalance;
    }

    const wallet = await this.walletRepository.findOne({
      where: { user_id: userId },
    });

    if (!wallet) {
      throw new NotFoundException(`Wallet not found for user ${userId}`);
    }

    // Cache the balance
    await this.redisService.cacheWalletBalance(userId, wallet.balance);

    return wallet.balance;
  }

  async createTransaction(data: WalletTransactionDto): Promise<WalletTransaction> {
    const lockKey = `wallet_transaction:${data.user_id}`;
    const lockValue = await this.redisService.acquireLock(lockKey, 30000);

    if (!lockValue) {
      throw new BadRequestException('Wallet operation in progress. Please try again.');
    }

    try {
      return await this.dataSource.transaction(async (manager) => {
        // Get wallet with lock
        const wallet = await manager.findOne(Wallet, {
          where: { user_id: data.user_id },
        });

        if (!wallet) {
          throw new NotFoundException(`Wallet not found for user ${data.user_id}`);
        }

        if (wallet.status !== WalletStatus.ACTIVE) {
          throw new BadRequestException(`Wallet is ${wallet.status.toLowerCase()}`);
        }

        const balanceBefore = wallet.balance;
        let balanceAfter = balanceBefore;

        // Calculate new balance based on transaction type
        switch (data.type) {
          case TransactionType.DEPOSIT:
          case TransactionType.BONUS:
          case TransactionType.REFUND:
            balanceAfter = balanceBefore + data.amount;
            break;
          
          case TransactionType.WITHDRAWAL:
          case TransactionType.BID_FEE:
          case TransactionType.SUBSCRIPTION:
          case TransactionType.PAYOUT:
            balanceAfter = balanceBefore - data.amount;
            if (balanceAfter < 0) {
              throw new BadRequestException('Insufficient wallet balance');
            }
            break;
          
          default:
            throw new BadRequestException(`Invalid transaction type: ${data.type}`);
        }

        // Validate business rules
        await this.validateTransactionRules(data, wallet, balanceAfter);

        // Update wallet balance
        wallet.balance = balanceAfter;
        wallet.last_transaction_at = new Date();
        await manager.save(wallet);

        // Create transaction record
        const transaction = manager.create(WalletTransaction, {
          wallet_id: wallet.id,
          type: data.type,
          amount: data.amount,
          balance_before: balanceBefore,
          balance_after: balanceAfter,
          status: TransactionStatus.COMPLETED,
          reference_id: data.reference_id,
          reference_type: data.reference_type,
          description: data.description,
          metadata: data.metadata,
          external_reference: data.external_reference,
          gateway: data.gateway,
        });

        const savedTransaction = await manager.save(transaction);

        // Update cache
        await this.redisService.cacheWalletBalance(data.user_id, balanceAfter);

        // Publish balance updated event
        const balanceUpdatedEvent = this.rabbitMQService.createDomainEvent(
          'wallet.balance.updated',
          wallet.id,
          {
            userId: data.user_id,
            balanceBefore,
            balanceAfter,
            amount: data.amount,
            type: data.type,
            transactionId: (transaction as any).id,
          }
        );
        await this.rabbitMQService.publishEvent('wallet.balance.updated', balanceUpdatedEvent);

        console.log(`Created ${data.type} transaction for user ${data.user_id}: ${data.amount}`);
        return savedTransaction;
      });
    } finally {
      await this.redisService.releaseLock(lockKey, lockValue);
    }
  }

  async depositFunds(data: DepositFundsDto): Promise<WalletTransaction> {
    return await this.createTransaction({
      user_id: data.user_id,
      type: TransactionType.DEPOSIT,
      amount: data.amount,
      description: data.description || 'Wallet deposit',
      reference_id: data.payment_intent_id,
      reference_type: 'payment_intent',
    });
  }

  async withdrawFunds(data: WithdrawFundsDto): Promise<WalletTransaction> {
    return await this.createTransaction({
      user_id: data.user_id,
      type: TransactionType.WITHDRAWAL,
      amount: data.amount,
      description: data.description || 'Wallet withdrawal',
      metadata: data.metadata,
    });
  }

  async getTransactionHistory(
    userId: string,
    page: number = 1,
    limit: number = 20,
    type?: TransactionType,
    status?: TransactionStatus
  ): Promise<{ transactions: WalletTransaction[]; total: number }> {
    const queryBuilder = this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoin('transaction.wallet', 'wallet')
      .where('wallet.user_id = :userId', { userId });

    if (type) {
      queryBuilder.andWhere('transaction.type = :type', { type });
    }

    if (status) {
      queryBuilder.andWhere('transaction.status = :status', { status });
    }

    const [transactions, total] = await queryBuilder
      .orderBy('transaction.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { transactions, total };
  }

  async validateSufficientBalance(userId: string, amount: number): Promise<boolean> {
    const balance = await this.getWalletBalance(userId);
    return balance >= amount;
  }

  async freezeWallet(userId: string, reason?: string): Promise<void> {
    const wallet = await this.walletRepository.findOne({
      where: { user_id: userId },
    });

    if (!wallet) {
      throw new NotFoundException(`Wallet not found for user ${userId}`);
    }

    wallet.status = WalletStatus.FROZEN;
    await this.walletRepository.save(wallet);

    // Invalidate cache
    await this.redisService.invalidateWalletBalance(userId);

    // Publish wallet frozen event
    const walletFrozenEvent = this.rabbitMQService.createDomainEvent(
      'wallet.frozen',
      wallet.id,
      {
        userId,
        reason,
        timestamp: new Date().toISOString(),
      }
    );
    await this.rabbitMQService.publishEvent('wallet.frozen', walletFrozenEvent);
  }

  async unfreezeWallet(userId: string): Promise<void> {
    const wallet = await this.walletRepository.findOne({
      where: { user_id: userId },
    });

    if (!wallet) {
      throw new NotFoundException(`Wallet not found for user ${userId}`);
    }

    wallet.status = WalletStatus.ACTIVE;
    await this.walletRepository.save(wallet);

    // Publish wallet unfrozen event
    const walletUnfrozenEvent = this.rabbitMQService.createDomainEvent(
      'wallet.unfrozen',
      wallet.id,
      {
        userId,
        timestamp: new Date().toISOString(),
      }
    );
    await this.rabbitMQService.publishEvent('wallet.unfrozen', walletUnfrozenEvent);
  }

  private async validateTransactionRules(
    data: WalletTransactionDto,
    wallet: Wallet,
    newBalance: number
  ): Promise<void> {
    // Business rule: No negative balances
    if (newBalance < 0) {
      throw new BadRequestException('Transaction would result in negative balance');
    }

    // Business rule: Maximum balance limit
    const maxBalance = this.configService.get('wallet.maxBalance', 1000000);
    if (newBalance > maxBalance) {
      throw new BadRequestException(`Maximum balance limit of ${maxBalance} exceeded`);
    }

    // Business rule: Daily transaction limits
    const dailyLimit = this.configService.get('wallet.dailyLimit', 10000);
    const today = new Date().toISOString().split('T')[0];
    
    const todayTransactions = await this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoin('transaction.wallet', 'wallet')
      .where('wallet.user_id = :userId', { userId: data.user_id })
      .andWhere('DATE(transaction.created_at) = :today', { today })
      .andWhere('transaction.status = :status', { status: TransactionStatus.COMPLETED })
      .getMany();

    const todayTotal = todayTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    if (todayTotal + data.amount > dailyLimit) {
      throw new BadRequestException(`Daily transaction limit of ${dailyLimit} exceeded`);
    }

    // Additional validation based on transaction type
    switch (data.type) {
      case TransactionType.BID_FEE:
        if (!data.reference_id || !data.reference_type) {
          throw new BadRequestException('Bid fee transactions require reference_id and reference_type');
        }
        break;
      
      case TransactionType.SUBSCRIPTION:
        if (!data.reference_id || !data.reference_type) {
          throw new BadRequestException('Subscription transactions require reference_id and reference_type');
        }
        break;
    }
  }

  // Financial reconciliation
  async getWalletStats(userId?: string): Promise<any> {
    const queryBuilder = this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoin('transaction.wallet', 'wallet');

    if (userId) {
      queryBuilder.where('wallet.user_id = :userId', { userId });
    }

    const stats = await queryBuilder
      .select('transaction.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(transaction.amount)', 'total')
      .groupBy('transaction.type')
      .getRawMany();

    const totalTransactions = await queryBuilder.getCount();

    return {
      totalTransactions,
      byType: stats.reduce((acc, stat) => {
        acc[stat.type] = {
          count: parseInt(stat.count),
          total: parseFloat(stat.total) || 0,
        };
        return acc;
      }, {}),
    };
  }
}
