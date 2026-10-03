import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  CreateOrderDto,
  OrderPaymentMethod,
} from './dto/create-order.dto.js';
import { CreateSocialOrderDto } from './dto/create-social-order.dto.js';
import { PaymentsService } from '../payments/payments.service.js';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentsService: PaymentsService,
  ) {}

  async checkoutByUser(
  userId: number,
  createOrderDto: CreateOrderDto,
) {
  const customer = await this.prisma.customer.findUnique({
    where: {
      userId,
    },
  });

  if (!customer) {
    throw new NotFoundException(
      'Cliente não encontrado para este usuário',
    );
  }

  return this.checkout(
    customer.id,
    createOrderDto,
  );
}
async createSocialOrder(
  createSocialOrderDto: CreateSocialOrderDto,
) {
  return this.prisma.$transaction(async (tx) => {
    const {
      customerId,
      addressId,
      items,
      paymentMethod,
    } = createSocialOrderDto;

    const customer = await tx.customer.findUnique({
      where: {
        id: customerId,
      },
    });

    if (!customer) {
      throw new NotFoundException(
        'Cliente não encontrado',
      );
    }

    const address = await tx.address.findFirst({
      where: {
        id: addressId,
        customerId,
      },
    });

    if (!address) {
      throw new NotFoundException(
        'Endereço não encontrado para este cliente',
      );
    }

    if (items.length === 0) {
      throw new BadRequestException(
        'O pedido precisa ter pelo menos um produto',
      );
    }

    let total = 0;
    const orderItems = [];

    for (const item of items) {
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

      if (
        product.inventory.quantity < item.quantity
      ) {
        throw new BadRequestException(
          `Estoque insuficiente para ${product.name}`,
        );
      }

      const unitPrice = Number(product.salePrice);

      const subtotal =
        Math.round(
          unitPrice * item.quantity * 100,
        ) / 100;

      total =
        Math.round(
          (total + subtotal) * 100,
        ) / 100;

      orderItems.push({
        productId: product.id,
        quantity: item.quantity,
        unitPrice,
        subtotal,
      });
    }

    const order = await tx.order.create({
      data: {
        customerId,
        source: 'SOCIAL',
        status: 'PAGO',
        total,

        shippingStreet: address.street,
        shippingNumber: address.number,
        shippingComplement: address.complement,
        shippingCity: address.city,
        shippingReference: address.reference,

        items: {
          create: orderItems,
        },
      },
      include: {
        items: true,
      },
    });

    await tx.payment.create({
      data: {
        orderId: order.id,
        amount: total,
        method: paymentMethod,
        status: 'COMPLETO',
      },
    });

    for (const item of items) {
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

    return tx.order.findUnique({
      where: {
        id: order.id,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        payments: true,
      },
    });
  });
}
  // ==== ORDER ====
  async updateStatus(
  id: number,
  newStatus: OrderStatus,
) {
  return this.prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: {
        id,
      },
      include: {
        items: true,
      },
    });

    if (!order) {
      throw new NotFoundException(
        'Pedido não encontrado',
      );
    }

    if (order.status === 'CANCELADO') {
      throw new BadRequestException(
        'Não é possível alterar um pedido cancelado',
      );
    }

    if (order.status === 'ENTREGADO') {
      throw new BadRequestException(
        'Não é possível alterar um pedido já entregue',
      );
    }

    if (newStatus === 'PAGO') {
  await tx.payment.updateMany({
    where: {
      orderId: order.id,
      status: 'PENDIENTE',
    },
    data: {
      status: 'COMPLETO',
    },
  });
}

if (newStatus === 'CANCELADO') {
  for (const item of order.items) {
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

  await tx.payment.updateMany({
    where: {
      orderId: order.id,
      status: {
        not: 'CANCELADO',
      },
    },
    data: {
      status: 'CANCELADO',
    },
  });
}

    return tx.order.update({
      where: {
        id,
      },
      data: {
        status: newStatus,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        payments: true,
      },
    });
  });
}
  async findAll() {
    return this.prisma.order.findMany({
      include: {
        customer: {
          include: {
            user: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
        payments: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: number) {
    const order = await this.prisma.order.findUnique({
      where: {
        id,
      },
      include: {
        customer: {
          include: {
            user: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
        payments: true,
      },
    });

    if (!order) {
      throw new NotFoundException(
        'Pedido não encontrado',
      );
    }

    return order;
  }
  
  async checkout(
  customerId: number,
  createOrderDto: CreateOrderDto,
) {
  const checkoutData = await this.prisma.$transaction(async (tx) => {
    const customer = await tx.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundException('Cliente não encontrado');
    }

    const address = await tx.address.findFirst({
      where: {
        id: createOrderDto.addressId,
        customerId,
      },
    });

    if (!address) {
      throw new NotFoundException(
        'Endereço não encontrado para este cliente',
      );
    }

    const cart = await tx.cart.findUnique({
      where: { customerId },
      include: {
        items: {
          include: {
            product: {
              include: {
                inventory: true,
              },
            },
          },
        },
      },
    });

    if (!cart) {
      throw new NotFoundException('Carrinho não encontrado');
    }

    if (cart.items.length === 0) {
      throw new BadRequestException(
        'O carrinho está vazio',
      );
    }

    let total = 0;

    const orderItems = [];

    for (const item of cart.items) {
      if (!item.product.inventory) {
        throw new BadRequestException(
          `Produto ${item.product.name} não possui estoque`,
        );
      }

      if (
        item.product.inventory.quantity <
        item.quantity
      ) {
        throw new BadRequestException(
          `Estoque insuficiente para ${item.product.name}`,
        );
      }

      const unitPrice = Number(
        item.product.salePrice,
      );

      const subtotal =
        Math.round(
          unitPrice * item.quantity * 100,
        ) / 100;

      total =
        Math.round(
          (total + subtotal) * 100,
        ) / 100;

      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice,
        subtotal,
      });
    }

    const order = await tx.order.create({
      data: {
        customerId,
        source: 'WEB',
        status: 'PENDIENTE',
        total,

        shippingStreet: address.street,
        shippingNumber: address.number,
        shippingComplement: address.complement,
        shippingCity: address.city,
        shippingReference: address.reference,

        items: {
          create: orderItems,
        },
      },
      include: {
        items: true,
      },
    });

    const payment = await tx.payment.create({
      data: {
        orderId: order.id,
        amount: total,
        method: createOrderDto.paymentMethod,
        status: 'PENDIENTE',
      },
    });

    for (const item of cart.items) {
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

    await tx.cartItem.deleteMany({
      where: {
        cartId: cart.id,
      },
    });

    return {
      order,
      payment,
    };
  });

  const mockPayment =
    await this.paymentsService.createPayment({
      amount: Number(checkoutData.payment.amount),
      currency: 'USD',
      metadata: {
        order_id: String(checkoutData.order.id),
      },
    });

  const updatedPayment =
    await this.prisma.payment.update({
      where: {
        id: checkoutData.payment.id,
      },
      data: {
        transactionId:
          mockPayment.transactionId,
      },
    });

  return {
    order: checkoutData.order,
    payment: updatedPayment,
    checkoutUrl: mockPayment.checkoutUrl,
  };
}
}