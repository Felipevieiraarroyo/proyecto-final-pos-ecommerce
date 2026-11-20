import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateAddressDto } from './dto/create-address.dto.js';
import { CreateMyAddressDto } from './dto/create-my-address.dto.js';

@Injectable()
export class AddressesService {
  constructor(private readonly prisma: PrismaService) {}

  async createByUser(userId: number, createAddressDto: CreateMyAddressDto) {
    const customer = await this.prisma.customer.findUnique({
      where: {
        userId,
      },
    });

    if (!customer) {
      throw new NotFoundException('Cliente não encontrado');
    }

    return this.prisma.address.create({
      data: {
        ...createAddressDto,
        customerId: customer.id,
      },
    });
  }

  async findAllByUser(userId: number) {
    const customer = await this.prisma.customer.findUnique({
      where: {
        userId,
      },
      select: {
        id: true,
      },
    });

    if (!customer) {
      throw new NotFoundException('Cliente não encontrado');
    }

    return this.prisma.address.findMany({
      where: {
        customerId: customer.id,
      },
      orderBy: {
        id: 'desc',
      },
    });
  }

  async create(createAddressDto: CreateAddressDto) {
    const customer = await this.prisma.customer.findUnique({
      where: {
        id: createAddressDto.customerId,
      },
    });

    if (!customer) {
      throw new NotFoundException('Cliente não encontrado');
    }

    return this.prisma.address.create({
      data: createAddressDto,
    });
  }

  async findAll() {
    return this.prisma.address.findMany({
      include: {
        customer: true,
      },
    });
  }

  async findOne(id: number) {
    const address = await this.prisma.address.findUnique({
      where: { id },
      include: {
        customer: true,
      },
    });

    if (!address) {
      throw new NotFoundException('Endereço não encontrado');
    }

    return address;
  }
}
