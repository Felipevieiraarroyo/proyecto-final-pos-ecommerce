import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto) {
    const category = await this.prisma.category.findUnique({
      where: {
        id: createProductDto.categoryId,
      },
    });

    if (!category) {
      throw new NotFoundException('Categoria não encontrada');
    }

    const { initialQuantity = 0, ...productData } = createProductDto;

    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: productData,
      });

      await tx.inventory.create({
        data: {
          productId: product.id,
          quantity: initialQuantity,
        },
      });

      return tx.product.findUnique({
        where: { id: product.id },
        include: {
          category: true,
          inventory: true,
        },
      });
    });
  }

  async findAll() {
    return this.prisma.product.findMany({
      include: {
        category: true,
        inventory: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        inventory: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }

    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    await this.findOne(id);

    if (updateProductDto.categoryId !== undefined) {
      const category = await this.prisma.category.findUnique({
        where: {
          id: updateProductDto.categoryId,
        },
      });

      if (!category) {
        throw new NotFoundException('Categoria não encontrada');
      }
    }

    return this.prisma.product.update({
      where: { id },
      data: updateProductDto,
      include: {
        category: true,
        inventory: true,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    const [vendas, pedidos, carrinhos] = await Promise.all([
      this.prisma.saleItem.count({
        where: { productId: id },
      }),
      this.prisma.orderItem.count({
        where: { productId: id },
      }),
      this.prisma.cartItem.count({
        where: { productId: id },
      }),
    ]);

    if (vendas > 0 || pedidos > 0 || carrinhos > 0) {
      throw new ConflictException(
        'Não é possível excluir este produto porque ele possui vendas, pedidos ou carrinhos vinculados.',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.inventory.deleteMany({
        where: { productId: id },
      });

      return tx.product.delete({
        where: { id },
      });
    });
  }
}
