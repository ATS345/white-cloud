import {
  IsInt,
  IsPositive,
  IsString,
  IsOptional,
  IsEnum,
  Min,
  Max,
} from "class-validator";

export enum ReviewSort {
  LATEST = "latest",
  OLDEST = "oldest",
  HIGHEST_RATING = "highest_rating",
  LOWEST_RATING = "lowest_rating",
  MOST_LIKED = "most_liked",
}

export class CreateReviewDto {
  @IsInt()
  @IsPositive()
  gameId: number;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  content: string;
}

export class UpdateReviewDto {
  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  rating?: number;

  @IsString()
  @IsOptional()
  content?: string;
}

export class ReviewQueryDto {
  @IsOptional()
  @IsInt()
  gameId?: number;

  @IsOptional()
  @IsInt()
  userId?: number;

  @IsOptional()
  @IsEnum(ReviewSort)
  sort?: ReviewSort;

  @IsOptional()
  @IsInt()
  minRating?: number;

  @IsOptional()
  @IsInt()
  maxRating?: number;

  @IsOptional()
  @IsInt()
  page?: number;

  @IsOptional()
  @IsInt()
  limit?: number;
}
