import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Headers,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { PaymentsService } from "./payments.service";
import { CreatePaymentDto } from "./dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@ApiTags("支付")
@Controller("payments")
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post("orders/:orderId")
  @ApiOperation({ summary: "创建支付" })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async createPayment(
    @Request() req,
    @Param("orderId") orderId: string,
    @Body() createPaymentDto: CreatePaymentDto,
  ) {
    return this.paymentsService.createPayment(
      req.user.id,
      parseInt(orderId),
      createPaymentDto,
    );
  }

  @Get(":id")
  @ApiOperation({ summary: "查询支付状态" })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async queryPayment(@Request() req, @Param("id") id: string) {
    return this.paymentsService.queryPayment(req.user.id, parseInt(id));
  }

  @Post("callback/:transactionId")
  @ApiOperation({ summary: "支付回调" })
  @HttpCode(HttpStatus.OK)
  async handleCallback(
    @Param("transactionId") transactionId: string,
    @Body() callbackData: any,
    @Headers("x-signature") signature: string,
  ) {
    return this.paymentsService.handleCallback(
      transactionId,
      callbackData,
      signature,
    );
  }

  @Post(":id/refund")
  @ApiOperation({ summary: "申请退款" })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  async refundPayment(@Request() req, @Param("id") id: string) {
    return this.paymentsService.refundPayment(req.user.id, parseInt(id));
  }

  @Post(":id/simulate-success")
  @ApiOperation({ summary: "模拟支付成功(测试用)" })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  async simulatePaymentSuccess(
    @Request() req,
    @Param("id") id: string,
    @Body("adminKey") adminKey: string,
  ) {
    return this.paymentsService.simulatePaymentSuccess(
      req.user.id,
      parseInt(id),
      adminKey || "dev-only-simulation-key",
    );
  }
}
