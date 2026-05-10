import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient();
    const token = client.handshake.auth.token || client.handshake.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return false;
    }

    try {
      // TODO: Implement proper JWT validation
      // For now, we'll accept any token for development
      // In production, validate against the Identity Service
      
      // Placeholder JWT validation
      const payload = this.validateToken(token);
      if (!payload) {
        return false;
      }

      // Attach user info to client
      client.user = payload;
      
      return true;
    } catch (error) {
      return false;
    }
  }

  private validateToken(token: string): any {
    // TODO: Implement proper JWT validation
    // This is a placeholder for development
    
    // For development, accept any non-empty token
    if (token && token.length > 10) {
      return {
        sub: 'user-placeholder',
        email: 'placeholder@example.com',
        role: 'USER',
      };
    }
    
    return null;
  }
}
