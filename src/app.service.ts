import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service.js';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  async getHello(): Promise<string> {
    const productCount = await this.prisma.product.count();

    return `API funcionando. Produtos cadastrados: ${productCount}`;
  }
}