import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthController {
  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      service: 'identity-service',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    };
  }
}
