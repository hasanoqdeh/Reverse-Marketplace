import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { BidSchema } from './schemas/bid.schema';
import { BidStatusHistorySchema } from './schemas/bid-status-history.schema';
import { BidAnalyticsSchema } from './schemas/bid-analytics.schema';

@Global()
@Module({
  imports: [
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get('mongodb.uri'),
        connectionFactory: (connection) => {
          const autopopulate = require('mongoose-autopopulate');
          const leanDefaults = require('mongoose-lean-defaults');
          const leanVirtuals = require('mongoose-lean-virtuals');
          
          connection.plugin(autopopulate.default || autopopulate);
          connection.plugin(leanDefaults.default || leanDefaults);
          connection.plugin(leanVirtuals.default || leanVirtuals);
          
          connection.on('connected', () => {
            console.log('MongoDB connected successfully');
          });
          
          connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
          });
          
          connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
          });
          
          return connection;
        },
        retryWrites: true,
        w: 'majority',
        readPreference: 'primary',
        maxPoolSize: configService.get('mongodb.connectionPoolSize') || 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        bufferCommands: false,
      }),
    }),
    MongooseModule.forFeature([
      { name: 'Bid', schema: BidSchema },
      { name: 'BidStatusHistory', schema: BidStatusHistorySchema },
      { name: 'BidAnalytics', schema: BidAnalyticsSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class MongodbModule {}
