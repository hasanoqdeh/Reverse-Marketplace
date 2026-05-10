import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Controller('health')
export class HealthController {
  constructor(private readonly configService: ConfigService) {}

  @Get()
  check() {
    return {
      status: 'ok',
      service: 'matching-engine',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      performance: {
        matchTimeout: this.configService.get('matching.timeoutMs'),
        maxMerchants: this.configService.get('matching.maxMerchantsPerRequest'),
      },
    };
  }
}
