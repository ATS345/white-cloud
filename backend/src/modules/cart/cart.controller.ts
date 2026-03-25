import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { CartService } from "./cart.service";
import { AddToCartDto, UpdateCartItemDto } from "./dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@ApiTags("购物车")
@Controller("cart")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: "获取购物车" })
  async getCart(@Request() req) {
    return this.cartService.getCart(req.user.id);
  }

  @Get("count")
  @ApiOperation({ summary: "获取购物车商品数量" })
  async getCartItemCount(@Request() req) {
    return this.cartService.getCartItemCount(req.user.id);
  }

  @Post("add")
  @ApiOperation({ summary: "添加商品到购物车" })
  @HttpCode(HttpStatus.OK)
  async addToCart(@Request() req, @Body() addToCartDto: AddToCartDto) {
    return this.cartService.addToCart(req.user.id, addToCartDto);
  }

  @Put("items/:id")
  @ApiOperation({ summary: "更新购物车商品数量" })
  async updateCartItem(
    @Request() req,
    @Param("id") id: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ) {
    return this.cartService.updateCartItem(
      req.user.id,
      parseInt(id),
      updateCartItemDto,
    );
  }

  @Delete("items/:id")
  @ApiOperation({ summary: "从购物车移除商品" })
  async removeFromCart(@Request() req, @Param("id") id: string) {
    return this.cartService.removeFromCart(req.user.id, parseInt(id));
  }

  @Delete("clear")
  @ApiOperation({ summary: "清空购物车" })
  async clearCart(@Request() req) {
    return this.cartService.clearCart(req.user.id);
  }
}
