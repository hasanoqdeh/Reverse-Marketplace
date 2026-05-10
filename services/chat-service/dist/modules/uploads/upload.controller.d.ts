import { UploadService } from './upload.service';
export declare class GenerateUploadUrlDto {
    fileName: string;
    contentType: string;
}
export declare class UploadController {
    private readonly uploadService;
    constructor(uploadService: UploadService);
    generateUploadUrl(generateUploadUrlDto: GenerateUploadUrlDto, req: any): Promise<{
        data: import("../../infrastructure/storage/storage.service").UploadUrlResponse;
        message: string;
    }>;
    confirmUpload(fileId: string, req: any): Promise<{
        data: {
            fileUrl: string;
        };
        message: string;
    }>;
    getFileMetadata(fileId: string): Promise<{
        data: any;
    }>;
    scanFile(fileId: string): Promise<{
        data: {
            isClean: boolean;
            threat?: string;
        };
    }>;
    validateContent(fileId: string, body: {
        contentType: string;
    }): Promise<{
        data: {
            isAllowed: boolean;
            reason?: string;
        };
    }>;
    deleteFile(fileId: string, req: any): Promise<{
        message: string;
    }>;
    getSupportedFileTypes(): {
        data: {
            supportedTypes: string[];
            maxSize: number;
            maxSizeMB: number;
        };
    };
}
