import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { UpdateInventoryDto } from './dto/update-inventory.dto.js';

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.inventory.findMany({
      include: {
        product: true,
      },
    });
  }

  async findByProduct(productId: number) {
    const inventory = await this.prisma.inventory.findUnique({
      where: {
        productId,
      },
      include: {
        product: true,
      },
    });

    if (!inventory) {
      throw new NotFoundException(
        'Estoque do produto não encontrado',
      );
    }

    return inventory;
  }

  async update(
    productId: number,
    updateInventoryDto: UpdateInventoryDto,
  ) {
    await this.findByProduct(productId);

    return this.prisma.inventory.update({
      where: {
        productId,
      },
      data: updateInventoryDto,
    });
  }
}