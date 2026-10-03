import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PaymentsService } from './payments.service.js';
import { TestPaymentDto } from './dto/test-payment.dto.js';
import { MockPayWebhookDto } from './dto/mockpay-webhook.dto.js';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
  ) {}

  @Post('test')
  @ApiOperation({
    summary: 'Testar criação de pagamento no MockPay',
    description:
      'Cria uma intenção de pagamento no MockPay Sandbox para validar a integração.',
  })
  @ApiBody({
    type: TestPaymentDto,
    examples: {
      exemplo: {
        summary: 'Pagamento de teste',
        value: {
          amount: 120.5,
          orderId: 999,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Pagamento criado no MockPay.',
  })
  createTestPayment(@Body() body: TestPaymentDto) {
    return this.paymentsService.createPayment({
      amount: body.amount,
      currency: 'USD',
      metadata: {
        order_id: String(body.orderId),
      },
    });
  }
   @Post('webhook')
   @HttpCode(200)
  @ApiOperation({
    summary: 'Receber webhook do MockPay',
    description:
      'Endpoint usado pelo MockPay para informar o resultado de uma transação.',
  })
  @ApiBody({
    type: MockPayWebhookDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Webhook processado com sucesso.',
  })
  async handleWebhook(
    @Body() webhook: MockPayWebhookDto,
  ) {
    return this.paymentsService.handleWebhook(webhook);
  }
}