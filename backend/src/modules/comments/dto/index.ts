import {
  IsInt,
  IsPositive,
  IsString,
  IsOptional,
  IsEnum,
} from "class-validator";

export enum CommentSort {
  LATEST = "latest",
  OLDEST = "oldest",
  MOST_LIKED = "most_liked",
}

export class CreateCommentDto {
  @IsInt()
  @IsPositive()
  gameId: number;

  @IsString()
  content: string;
}

export class UpdateCommentDto {
  @IsString()
  content: string;
}

export class CommentQueryDto {
  @IsOptional()
  @IsInt()
  gameId?: number;

  @IsOptional()
  @IsInt()
  userId?: number;

  @IsOptional()
  @IsEnum(CommentSort)
  sort?: CommentSort;

  @IsOptional()
  @IsInt()
  page?: number;

  @IsOptional()
  @IsInt()
  limit?: number;
}
