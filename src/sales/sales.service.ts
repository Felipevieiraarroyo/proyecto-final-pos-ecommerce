import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateSaleDto } from './dto/create-sale.dto.js';

@Injectable()
export class SalesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createSaleDto: CreateSaleDto) {
    return this.prisma.$transaction(async (tx) => {
      const cashRegister = await tx.cashRegister.findUnique({
        where: {
          id: createSaleDto.cashRegisterId,
        },
      });

      if (!cashRegister) {
        throw new NotFoundException('Caixa não encontrado');
      }

      if (cashRegister.status !== 'OPEN') {
        throw new BadRequestException(
          'O caixa precisa estar aberto para realizar uma venda',
        );
      }

      let total = 0;

      const saleItems = [];

      for (const item of createSaleDto.items) {
        const product = await tx.product.findUnique({
          where: {
            id: item.productId,
          },
          include: {
            inventory: true,
          },
        });

        if (!product) {
          throw new NotFoundException(
            `Produto ${item.productId} não encontrado`,
          );
        }

        if (!product.inventory) {
          throw new BadRequestException(
            `Produto ${product.name} não possui estoque`,
          );
        }

        if (product.inventory.quantity < item.quantity) {
          throw new BadRequestException(
            `Estoque insuficiente para ${product.name}`,
          );
        }

       const unitPrice = Number(product.salePrice);
       const subtotal = Math.round(unitPrice * item.quantity * 100) / 100;

        total = Math.round((total + subtotal) * 100) / 100;

        saleItems.push({
          productId: product.id,
          quantity: item.quantity,
          unitPrice,
          subtotal,
        });
      }

      const paymentAmount =
        Math.round(createSaleDto.paymentAmount * 100) / 100;

        if (paymentAmount !== total) {
        throw new BadRequestException(
          `O pagamento deve ser igual ao total da venda: ${total}`,
        );
      }

      const sale = await tx.sale.create({
  data: {
    cashRegisterId: cashRegister.id,
    total,
    items: {
      create: saleItems,
    },
  },
  include: {
    items: true,
  },
});

      for (const item of createSaleDto.items) {
        await tx.inventory.update({
          where: {
            productId: item.productId,
          },
          data: {
            quantity: {
              decrement: item.quantity,
            },
          },
        });
      }

      await tx.payment.create({
        data: {
          amount: total,
          method: createSaleDto.paymentMethod,
          status: 'COMPLETO',
          saleId: sale.id,
        },
      });

      return sale;
    });
  }
}