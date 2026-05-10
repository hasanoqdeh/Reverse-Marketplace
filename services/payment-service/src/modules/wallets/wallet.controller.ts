import {
  Controller,
  Get,
  Post,
  Patch,
  Query,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { WalletService, CreateWalletDto, DepositFundsDto, WithdrawFundsDto } from './wallet.service';
import { TransactionType, TransactionStatus } from '../../common/entities/wallet.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

export class DepositFundsEndpointDto {
  amount: number;
  payment_intent_id: string;
  description?: string;
}

export class WithdrawFundsEndpointDto {
  amount: number;
  description?: string;
  metadata?: Record<string, any>;
}

@ApiTags('wallets')
@Controller('wallet')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  @ApiOperation({ summary: 'Get user wallet' })
  @ApiResponse({ status: 200, description: 'Wallet retrieved successfully' })
  async getWallet(@Request() req: any) {
    const userId = req.user?.sub || 'user-placeholder';
    
    const wallet = await this.walletService.getWallet(userId);

    return {
      data: {
        id: wallet.id,
        balance: wallet.balance,
        currency: wallet.currency,
        status: wallet.status,
        last_transaction_at: wallet.last_transaction_at,
        created_at: wallet.created_at,
      },
    };
  }

  @Get('balance')
  @ApiOperation({ summary: 'Get wallet balance' })
  @ApiResponse({ status: 200, description: 'Balance retrieved successfully' })
  async getBalance(@Request() req: any) {
    const userId = req.user?.sub || 'user-placeholder';
    
    const balance = await this.walletService.getWalletBalance(userId);

    return {
      data: { balance, currency: 'SAR' },
    };
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Get wallet transaction history' })
  @ApiResponse({ status: 200, description: 'Transaction history retrieved successfully' })
  async getTransactionHistory(
    @Request() req: any,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('type') type?: TransactionType,
    @Query('status') status?: TransactionStatus,
  ) {
    const userId = req.user?.sub || 'user-placeholder';
    
    const result = await this.walletService.getTransactionHistory(
      userId,
      page,
      limit,
      type,
      status
    );

    return {
      data: result.transactions,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    };
  }

  @Post('deposit')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Deposit funds to wallet' })
  @ApiResponse({ status: 201, description: 'Funds deposited successfully' })
  @ApiResponse({ status: 400, description: 'Invalid deposit request' })
  async depositFunds(
    @Body(ValidationPipe) depositDto: DepositFundsEndpointDto,
    @Request() req: any,
  ) {
    const userId = req.user?.sub || 'user-placeholder';
    
    const transaction = await this.walletService.depositFunds({
      user_id: userId,
      amount: depositDto.amount,
      payment_intent_id: depositDto.payment_intent_id,
      description: depositDto.description,
    });

    return {
      data: transaction,
      message: 'Funds deposited successfully',
    };
  }

  @Post('withdraw')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Withdraw funds from wallet' })
  @ApiResponse({ status: 201, description: 'Funds withdrawn successfully' })
  @ApiResponse({ status: 400, description: 'Insufficient balance or invalid request' })
  async withdrawFunds(
    @Body(ValidationPipe) withdrawDto: WithdrawFundsEndpointDto,
    @Request() req: any,
  ) {
    const userId = req.user?.sub || 'user-placeholder';
    
    const transaction = await this.walletService.withdrawFunds({
      user_id: userId,
      amount: withdrawDto.amount,
      description: withdrawDto.description,
      metadata: withdrawDto.metadata,
    });

    return {
      data: transaction,
      message: 'Funds withdrawn successfully',
    };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get wallet statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getWalletStats(@Request() req: any) {
    const userId = req.user?.sub || 'user-placeholder';
    
    const stats = await this.walletService.getWalletStats(userId);

    return {
      data: stats,
    };
  }
}

// Admin endpoints for wallet management
@ApiTags('admin-wallets')
@Controller('admin/wallets')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AdminWalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get(':userId')
  @ApiOperation({ summary: 'Get user wallet (Admin)' })
  @ApiResponse({ status: 200, description: 'Wallet retrieved successfully' })
  async getUserWallet(@Param('userId') userId: string) {
    const wallet = await this.walletService.getWallet(userId);

    return {
      data: wallet,
    };
  }

  @Get(':userId/balance')
  @ApiOperation({ summary: 'Get user wallet balance (Admin)' })
  @ApiResponse({ status: 200, description: 'Balance retrieved successfully' })
  async getUserBalance(@Param('userId') userId: string) {
    const balance = await this.walletService.getWalletBalance(userId);

    return {
      data: { balance, currency: 'SAR' },
    };
  }

  @Post(':userId/freeze')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Freeze user wallet (Admin)' })
  @ApiResponse({ status: 200, description: 'Wallet frozen successfully' })
  async freezeWallet(
    @Param('userId') userId: string,
    @Body() body: { reason?: string },
  ) {
    await this.walletService.freezeWallet(userId, body.reason);

    return {
      message: 'Wallet frozen successfully',
    };
  }

  @Post(':userId/unfreeze')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unfreeze user wallet (Admin)' })
  @ApiResponse({ status: 200, description: 'Wallet unfrozen successfully' })
  async unfreezeWallet(@Param('userId') userId: string) {
    await this.walletService.unfreezeWallet(userId);

    return {
      message: 'Wallet unfrozen successfully',
    };
  }

  @Get('stats/all')
  @ApiOperation({ summary: 'Get system-wide wallet statistics (Admin)' })
  @ApiResponse({ status: 200, description: 'System statistics retrieved successfully' })
  async getSystemWalletStats() {
    const stats = await this.walletService.getWalletStats();

    return {
      data: stats,
    };
  }
}
