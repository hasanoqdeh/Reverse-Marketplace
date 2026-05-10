import { RabbitMQService } from './rabbitmq.service';
export declare class RabbitMQModule {
    static forRoot(): {
        module: typeof RabbitMQModule;
        providers: (typeof RabbitMQService)[];
        exports: (typeof RabbitMQService)[];
    };
}
