import { Injectable } from '@nestjs/common';

export interface ServiceMetrics {
  otpRequests: number;
  otpSuccessRate: number;
  loginSuccessRate: number;
  refreshTokenRate: number;
  activeUsers: number;
  bannedUsers: number;
  merchantApprovals: number;
  merchantRejections: number;
}

@Injectable()
export class MetricsService {
  private metrics: ServiceMetrics = {
    otpRequests: 0,
    otpSuccessRate: 0,
    loginSuccessRate: 0,
    refreshTokenRate: 0,
    activeUsers: 0,
    bannedUsers: 0,
    merchantApprovals: 0,
    merchantRejections: 0,
  };

  incrementOtpRequests(): void {
    this.metrics.otpRequests++;
  }

  incrementOtpSuccess(): void {
    this.metrics.otpSuccessRate++;
  }

  incrementLoginSuccess(): void {
    this.metrics.loginSuccessRate++;
  }

  incrementRefreshToken(): void {
    this.metrics.refreshTokenRate++;
  }

  setActiveUsers(count: number): void {
    this.metrics.activeUsers = count;
  }

  setBannedUsers(count: number): void {
    this.metrics.bannedUsers = count;
  }

  incrementMerchantApprovals(): void {
    this.metrics.merchantApprovals++;
  }

  incrementMerchantRejections(): void {
    this.metrics.merchantRejections++;
  }

  getMetrics(): ServiceMetrics {
    return { ...this.metrics };
  }

  getRates(): any {
    const totalOtps = this.metrics.otpRequests;
    const successfulLogins = this.metrics.loginSuccessRate;
    
    return {
      otpSuccessRate: totalOtps > 0 ? ((this.metrics.otpSuccessRate / totalOtps) * 100).toFixed(2) : '0.00',
      loginSuccessRate: successfulLogins > 0 ? '100.00' : '0.00',
      merchantApprovalRate: (this.metrics.merchantApprovals + this.metrics.merchantRejections) > 0 
        ? ((this.metrics.merchantApprovals / (this.metrics.merchantApprovals + this.metrics.merchantRejections)) * 100).toFixed(2) 
        : '0.00',
    };
  }
}
