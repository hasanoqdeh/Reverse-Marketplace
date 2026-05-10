import { IsString, IsNotEmpty, IsOptional, IsUUID, IsNumber, IsDecimal, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRequestDto {
  @IsUUID()
  @IsNotEmpty()
  categoryId: string;

  @IsString()
  @IsNotEmpty()
  @Min(3)
  @Max(100)
  title: string;

  @IsString()
  @IsNotEmpty()
  @Min(10)
  @Max(2000)
  description: string;

  @IsOptional()
  @IsUUID()
  locationId?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(-90)
  @Max(90)
  latitude?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(-180)
  @Max(180)
  longitude?: number;
}

export class UpdateRequestDto {
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsString()
  @Min(3)
  @Max(100)
  title?: string;

  @IsOptional()
  @IsString()
  @Min(10)
  @Max(2000)
  description?: string;

  @IsOptional()
  @IsUUID()
  locationId?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(-90)
  @Max(90)
  latitude?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(-180)
  @Max(180)
  longitude?: number;
}

export class PublishRequestDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @Max(168) // Max 1 week
  expiryHours?: number;
}

export class UpdateRequestStatusDto {
  @IsString()
  @IsNotEmpty()
  status: string;

  @IsOptional()
  @IsString()
  reason?: string;
}
