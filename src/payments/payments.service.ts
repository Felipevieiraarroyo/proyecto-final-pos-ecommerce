import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';

import type {
  CreatePaymentInput,
  CreatePaymentResult,
  PaymentProvider,
} from './providers/payment-provider.interface.js';

import { PAYMENT_PROVIDER } from './providers/payment-provider.token.js';

import {
  MockPayWebhookDto,
  MockPayWebhookEvent,
} from './dto/mockpay-webhook.dto.js';

@Injectable()
export class PaymentsService {
  constructor(
    @Inject(PAYMENT_PROVIDER)
    private readonly paymentProvider: PaymentProvider,

    private readonly prisma: PrismaService,
  ) {}

  async createPayment(
    input: CreatePaymentInput,
  ): Promise<CreatePaymentResult> {
    return this.paymentProvider.createPayment(input);
  }

  async handleWebhook(webhook: MockPayWebhookDto) {
    const transactionId = webhook.id;

    const payment = await this.prisma.payment.findUnique({
      where: {
        transactionId,
      },
      include: {
        order: true,
      },
    });

    if (!payment) {
      throw new NotFoundException(
        'Pagamento não encontrado para esta transação',
      );
    }

    if (webhook.event === MockPayWebhookEvent.PAYMENT_SUCCEEDED) {
      return this.prisma.$transaction(async (tx) => {
        // Evita processar duas vezes o mesmo webhook.
        if (payment.status === 'COMPLETO') {
          return payment;
        }

        const updatedPayment = await tx.payment.update({
          where: {
            id: payment.id,
          },
          data: {
            status: 'COMPLETO',
          },
        });

        if (payment.orderId) {
          await tx.order.update({
            where: {
              id: payment.orderId,
            },
            data: {
              status: 'PAGO',
            },
          });
        }

        return updatedPayment;
      });
    }

    if (webhook.event === MockPayWebhookEvent.PAYMENT_FAILED) {
      return this.prisma.$transaction(async (tx) => {
        // Evita processar duas vezes o mesmo webhook.
        if (payment.status === 'FRACASADO') {
          return payment;
        }

        const updatedPayment = await tx.payment.update({
          where: {
            id: payment.id,
          },
          data: {
            status: 'FRACASADO',
          },
        });

        // Se for um pedido WEB ainda pendente,
        // libera novamente o estoque reservado.
        if (
          payment.orderId &&
          payment.order?.status === 'PENDIENTE'
        ) {
          const orderItems = await tx.orderItem.findMany({
            where: {
              orderId: payment.orderId,
            },
          });

          for (const item of orderItems) {
            await tx.inventory.update({
              where: {
                productId: item.productId,
              },
              data: {
                quantity: {
                  increment: item.quantity,
                },
              },
            });
          }

          await tx.order.update({
            where: {
              id: payment.orderId,
            },
            data: {
              status: 'CANCELADO',
            },
          });
        }

        return updatedPayment;
      });
    }

    throw new BadRequestException(
      'Evento de pagamento não suportado',
    );
  }
}