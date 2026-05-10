import { StorageService, UploadUrlResponse } from '../../infrastructure/storage/storage.service';
import { RedisService } from '../../infrastructure/redis/redis.service';
export interface GenerateUploadUrlDto {
    fileName: string;
    contentType: string;
}
export declare class UploadService {
    private readonly storageService;
    private readonly redisService;
    constructor(storageService: StorageService, redisService: RedisService);
    generateUploadUrl(data: GenerateUploadUrlDto, userId: string): Promise<UploadUrlResponse>;
    validateUpload(fileId: string, userId: string): Promise<boolean>;
    confirmUpload(fileId: string, userId: string): Promise<string>;
    processMediaFile(fileUrl: string, contentType: string): Promise<{
        url: string;
        thumbnailUrl?: string;
        metadata?: any;
    }>;
    deleteFile(fileId: string, userId: string): Promise<boolean>;
    getFileMetadata(fileKey: string): Promise<any>;
    scanForMalware(fileKey: string): Promise<{
        isClean: boolean;
        threat?: string;
    }>;
    enforceContentPolicy(fileKey: string, contentType: string): Promise<{
        isAllowed: boolean;
        reason?: string;
    }>;
    getSupportedFileTypes(): string[];
    getMaxFileSize(): number;
    cleanupExpiredUploads(): Promise<void>;
}
