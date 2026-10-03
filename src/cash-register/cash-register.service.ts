import {
  BadRequestException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { OpenCashRegisterDto } from './dto/open-cash-register.dto.js';
import { CloseCashRegisterDto } from './dto/close-cash-register.dto.js';

@Injectable()
export class CashRegisterService {
  constructor(private readonly prisma: PrismaService) {}

async close(
  id: number,
  closeCashRegisterDto: CloseCashRegisterDto,
) {
  return this.prisma.$transaction(async (tx) => {
    const cashRegister =
      await tx.cashRegister.findUnique({
        where: {
          id,
        },
        include: {
          sales: true,
        },
      });

    if (!cashRegister) {
      throw new NotFoundException(
        'Caixa não encontrado',
      );
    }

    if (cashRegister.status !== 'OPEN') {
      throw new BadRequestException(
        'O caixa já está fechado',
      );
    }

    const salesTotal = cashRegister.sales.reduce(
      (total, sale) =>
        total + Number(sale.total),
      0,
    );

    const expectedAmount =
      Math.round(
        (
          Number(cashRegister.openingAmount) +
          salesTotal
        ) * 100,
      ) / 100;

    const closingAmount =
      Math.round(
        closeCashRegisterDto.closingAmount * 100,
      ) / 100;

    const difference =
      Math.round(
        (closingAmount - expectedAmount) * 100,
      ) / 100;

    const closedCashRegister =
      await tx.cashRegister.update({
        where: {
          id,
        },
        data: {
          closingAmount,
          closedAt: new Date(),
          status: 'CLOSED',
        },
      });

    return {
      cashRegister: closedCashRegister,
      reconciliation: {
        openingAmount:
          Number(cashRegister.openingAmount),
        salesTotal,
        expectedAmount,
        closingAmount,
        difference,
      },
    };
  });
}
  async open(
    userId: number,
    openCashRegisterDto: OpenCashRegisterDto,
  ) {
    const existing = await this.prisma.cashRegister.findFirst({
      where: {
        userId,
        status: 'OPEN',
      },
    });

    if (existing) {
      throw new BadRequestException(
        'O usuário já possui um caixa aberto',
      );
    }

    return this.prisma.cashRegister.create({
  data: {
    userId,
    openingAmount: openCashRegisterDto.openingAmount,
    openedAt: new Date(),
    status: 'OPEN',
  },
});
  }

  async findOpen(userId: number) {
    return this.prisma.cashRegister.findFirst({
      where: {
        userId,
        status: 'OPEN',
      },
    });
  }
}