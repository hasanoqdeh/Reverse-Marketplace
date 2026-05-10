import { ConfigService } from '@nestjs/config';
export interface UploadUrlResponse {
    uploadUrl: string;
    fileUrl: string;
    fileId: string;
    expiresAt: Date;
}
export interface FileValidation {
    isValid: boolean;
    error?: string;
}
export declare class StorageService {
    private readonly s3Client;
    private readonly configService;
    constructor(s3Client: any, configService: ConfigService);
    generateUploadUrl(fileName: string, contentType: string, userId: string): Promise<UploadUrlResponse>;
    generateAccessUrl(fileKey: string, expiresIn?: number): Promise<string>;
    deleteFile(fileKey: string): Promise<void>;
    getFileMetadata(fileKey: string): Promise<any>;
    validateFile(contentType: string): FileValidation;
    validateFileSize(fileKey: string): Promise<FileValidation>;
    private getFileUrl;
    private generateFileId;
    getFileType(contentType: string): 'image' | 'video' | 'audio' | 'document';
    generateThumbnail(fileKey: string, outputFormat?: 'jpeg' | 'webp'): Promise<string>;
    generateVideoPreview(fileKey: string): Promise<string>;
    generateAudioWaveform(fileKey: string): Promise<string>;
    deleteMultipleFiles(fileKeys: string[]): Promise<void>;
    listFiles(prefix: string, maxKeys?: number): Promise<any[]>;
    scanForMalware(fileKey: string): Promise<{
        isClean: boolean;
        threat?: string;
    }>;
    enforceContentPolicy(fileKey: string, contentType: string): Promise<{
        isAllowed: boolean;
        reason?: string;
    }>;
    healthCheck(): Promise<{
        status: string;
        bucket: string;
    }>;
}
