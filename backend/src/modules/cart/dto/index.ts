import { IsInt, IsPositive, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class AddToCartDto {
  @IsInt()
  @IsPositive()
  gameId: number;

  @IsInt()
  @IsPositive()
  @IsOptional()
  quantity?: number;
}

export class UpdateCartItemDto {
  @IsInt()
  @IsPositive()
  quantity: number;
}

export class RemoveFromCartDto {
  @IsInt()
  @IsPositive()
  gameId: number;
}