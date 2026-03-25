import {
  IsInt,
  IsPositive,
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  Min,
} from "class-validator";

export enum GameStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
  ARCHIVED = "archived",
}

export class AdminCreateGameDto {
  @IsString()
  title: string;

  @IsString()
  slug: string;

  @IsString()
  description: string;

  @IsString()
  @IsOptional()
  shortDescription?: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsString()
  developer: string;

  @IsString()
  publisher: string;

  @IsString()
  releaseDate: string;

  @IsString()
  coverImage: string;

  @IsString()
  @IsOptional()
  headerImage?: string;

  @IsEnum(GameStatus)
  @IsOptional()
  status?: GameStatus;

  @IsInt({ each: true })
  @IsPositive({ each: true })
  @IsOptional()
  genreIds?: number[];

  @IsInt({ each: true })
  @IsPositive({ each: true })
  @IsOptional()
  platformIds?: number[];

  @IsInt({ each: true })
  @IsPositive({ each: true })
  @IsOptional()
  tagIds?: number[];
}

export class AdminUpdateGameDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  shortDescription?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsString()
  @IsOptional()
  developer?: string;

  @IsString()
  @IsOptional()
  publisher?: string;

  @IsString()
  @IsOptional()
  releaseDate?: string;

  @IsString()
  @IsOptional()
  coverImage?: string;

  @IsString()
  @IsOptional()
  headerImage?: string;

  @IsEnum(GameStatus)
  @IsOptional()
  status?: GameStatus;

  @IsInt({ each: true })
  @IsPositive({ each: true })
  @IsOptional()
  genreIds?: number[];

  @IsInt({ each: true })
  @IsPositive({ each: true })
  @IsOptional()
  platformIds?: number[];

  @IsInt({ each: true })
  @IsPositive({ each: true })
  @IsOptional()
  tagIds?: number[];
}

export class AdminGameQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(GameStatus)
  status?: GameStatus;

  @IsOptional()
  @IsInt()
  genreId?: number;

  @IsOptional()
  @IsInt()
  platformId?: number;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsString()
  sortOrder?: "asc" | "desc";

  @IsOptional()
  @IsInt()
  page?: number;

  @IsOptional()
  @IsInt()
  limit?: number;
}
