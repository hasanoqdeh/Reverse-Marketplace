import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Wallet } from '../../common/entities/wallet.entity';
import { WalletTransaction } from '../../common/entities/wallet-transaction.entity';
import { Subscription } from '../../common/entities/subscription.entity';
import { SubscriptionPlan } from '../../common/entities/subscription-plan.entity';
import { PaymentIntent } from '../../common/entities/payment-intent.entity';
import { Invoice } from '../../common/entities/invoice.entity';
import { Refund } from '../../common/entities/refund.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.name'),
        entities: [
          Wallet,
          WalletTransaction,
          Subscription,
          SubscriptionPlan,
          PaymentIntent,
          Invoice,
          Refund,
        ],
        synchronize: configService.get('database.synchronize', false),
        logging: configService.get('database.logging', false),
        ssl: configService.get('database.ssl', false),
        extra: {
          max: configService.get('database.maxConnections', 20),
          connectionTimeoutMillis: configService.get('database.connectionTimeout', 10000),
          idleTimeoutMillis: configService.get('database.idleTimeout', 30000),
        },
        migrationsRun: configService.get('database.migrationsRun', false),
        migrations: ['dist/migrations/*.js'],
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([
      Wallet,
      WalletTransaction,
      Subscription,
      SubscriptionPlan,
      PaymentIntent,
      Invoice,
      Refund,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class PostgresModule {}
