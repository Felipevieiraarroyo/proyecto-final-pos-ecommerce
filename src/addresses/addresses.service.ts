import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateAddressDto } from './dto/create-address.dto.js';

@Injectable()
export class AddressesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createAddressDto: CreateAddressDto) {
    const customer = await this.prisma.customer.findUnique({
      where: {
        id: createAddressDto.customerId,
      },
    });

    if (!customer) {
      throw new NotFoundException(
        'Cliente não encontrado',
      );
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
      throw new NotFoundException(
        'Endereço não encontrado',
      );
    }

    return address;
  }
}