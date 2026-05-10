import { ConfigService } from '@nestjs/config';
import { StorageService } from './storage.service';
export declare class StorageModule {
    static forRoot(): {
        module: typeof StorageModule;
        providers: (typeof StorageService | {
            provide: string;
            useFactory: (configService: ConfigService) => any;
            inject: (typeof ConfigService)[];
        })[];
        exports: (string | typeof StorageService)[];
    };
}
