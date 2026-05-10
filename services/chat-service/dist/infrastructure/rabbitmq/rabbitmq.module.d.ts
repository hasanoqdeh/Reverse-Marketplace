import { ConfigService } from '@nestjs/config';
import { RabbitMQService } from './rabbitmq.service';
export declare class RabbitMQModule {
    static forRoot(): {
        module: typeof RabbitMQModule;
        providers: (typeof RabbitMQService | {
            provide: string;
            useFactory: (configService: ConfigService) => Promise<any>;
            inject: (typeof ConfigService)[];
        })[];
        exports: (string | typeof RabbitMQService)[];
    };
}
