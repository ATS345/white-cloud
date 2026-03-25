import { IsInt, IsPositive, IsString, IsOptional, IsEnum } from 'class-validator';

export enum DownloadStatus {
  PENDING = 'pending',
  DOWNLOADING = 'downloading',
  COMPLETED = 'completed',
  FAILED = 'failed',
  PAUSED = 'paused',
}

export class CreateDownloadDto {
  @IsInt()
  @IsPositive()
  gameId: number;

  @IsString()
  @IsOptional()
  platform?: string;
}

export class UpdateDownloadDto {
  @IsEnum(DownloadStatus)
  status: DownloadStatus;

  @IsInt()
  @IsOptional()
  progress?: number;

  @IsString()
  @IsOptional()
  downloadPath?: string;
}

export class DownloadQueryDto {
  @IsOptional()
  @IsInt()
  gameId?: number;

  @IsOptional()
  @IsEnum(DownloadStatus)
  status?: DownloadStatus;

  @IsOptional()
  @IsInt()
  page?: number;

  @IsOptional()
  @IsInt()
  limit?: number;
}