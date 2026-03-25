import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto, OrderQueryDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('订单')
@Controller('orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: '创建订单' })
  async createOrder(@Request() req, @Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.createOrder(req.user.id, createOrderDto);
  }

  @Post('from-cart')
  @ApiOperation({ summary: '从购物车创建订单' })
  @HttpCode(HttpStatus.OK)
  async createOrderFromCart(@Request() req) {
    return this.ordersService.createOrderFromCart(req.user.id);
  }

  @Get()
  @ApiOperation({ summary: '获取订单列表' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async findAll(@Request() req, @Query() query: OrderQueryDto) {
    return this.ordersService.findAll(req.user.id, query);
  }

  @Get('my-games')
  @ApiOperation({ summary: '获取我的游戏库' })
  async getMyGames(@Request() req) {
    return this.ordersService.getMyGames(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取订单详情' })
  async findOne(@Request() req, @Param('id') id: string) {
    return this.ordersService.findOne(req.user.id, parseInt(id));
  }

  @Delete(':id/cancel')
  @ApiOperation({ summary: '取消订单' })
  @HttpCode(HttpStatus.OK)
  async cancelOrder(@Request() req, @Param('id') id: string) {
    return this.ordersService.cancelOrder(req.user.id, parseInt(id));
  }
}