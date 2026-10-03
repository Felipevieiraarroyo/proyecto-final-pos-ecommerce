import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { AddCartItemDto } from './dto/add-cart-item.dto.js';

@Injectable()
export class CartsService {
  constructor(private readonly prisma: PrismaService) {}

  async addItemByUser(
  userId: number,
  addCartItemDto: AddCartItemDto,
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

  return this.addItem(
    customer.id,
    addCartItemDto,
  );
}
  async findByUser(userId: number) {
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

  return this.findByCustomer(customer.id);
}
  async findByCustomer(customerId: number) {
    const cart = await this.prisma.cart.findUnique({
      where: {
        customerId,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        customer: true,
      },
    });

    if (!cart) {
      throw new NotFoundException(
        'Carrinho não encontrado',
      );
    }

    return cart;
  }

  async addItem(
    customerId: number,
    addCartItemDto: AddCartItemDto,
  ) {
    const cart = await this.prisma.cart.findUnique({
      where: {
        customerId,
      },
    });

    if (!cart) {
      throw new NotFoundException(
        'Carrinho não encontrado',
      );
    }

    const product = await this.prisma.product.findUnique({
      where: {
        id: addCartItemDto.productId,
      },
      include: {
        inventory: true,
      },
    });

    if (!product) {
      throw new NotFoundException(
        'Produto não encontrado',
      );
    }

    if (!product.inventory) {
      throw new BadRequestException(
        'Produto não possui estoque',
      );
    }

    if (
      product.inventory.quantity <
      addCartItemDto.quantity
    ) {
      throw new BadRequestException(
        `Estoque insuficiente para ${product.name}`,
      );
    }

    const existingItem =
      await this.prisma.cartItem.findUnique({
        where: {
          cartId_productId: {
            cartId: cart.id,
            productId: addCartItemDto.productId,
          },
        },
      });

    if (existingItem) {
      const newQuantity =
        existingItem.quantity +
        addCartItemDto.quantity;

      if (
        product.inventory.quantity <
        newQuantity
      ) {
        throw new BadRequestException(
          `Estoque insuficiente para ${product.name}`,
        );
      }

      return this.prisma.cartItem.update({
        where: {
          id: existingItem.id,
        },
        data: {
          quantity: newQuantity,
        },
        include: {
          product: true,
        },
      });
    }

    return this.prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: addCartItemDto.productId,
        quantity: addCartItemDto.quantity,
      },
      include: {
        product: true,
      },
    });
  }
}