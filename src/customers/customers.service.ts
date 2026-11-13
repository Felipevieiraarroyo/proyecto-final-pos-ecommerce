import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateCustomerDto } from './dto/create-customer.dto.js';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCustomerDto: CreateCustomerDto) {
    const { name, email, phone, document } = createCustomerDto;

    // 1. Verificar se o email já está cadastrado
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Este email já está cadastrado');
    }

    // 2. Verificar se o documento já está cadastrado
    const existingCustomer = await this.prisma.customer.findFirst({
      where: { document },
    });

    if (existingCustomer) {
      throw new ConflictException('Este documento já está cadastrado');
    }

    // 3. Gerar senha temporária criptograficamente segura
    const temporaryPassword = randomBytes(12).toString('hex');

    // 4. Criptografar a senha temporária
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    try {
      // 5. Criar usuário, cliente e carrinho em uma transação
      const result = await this.prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            name,
            email,
            password: hashedPassword,
            role: 'CLIENTE',
            mustChangePassword: true,
          },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        });

        const customer = await tx.customer.create({
          data: {
            userId: user.id,
            phone,
            document,
          },
        });

        await tx.cart.create({
          data: {
            customerId: customer.id,
          },
        });

        return { user, customer };
      });

      // 6. Retornar a senha temporária uma única vez
      return {
        message:
          'Cliente cadastrado com sucesso. Entregue a senha temporária ao cliente.',
        temporaryPassword,
        user: result.user,
        customer: {
          id: result.customer.id,
          phone: result.customer.phone,
          document: result.customer.document,
        },
      };
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Email ou documento já cadastrado');
      }

      throw error;
    }
  }

  async findAll() {
    return this.prisma.customer.findMany({
      select: {
        id: true,
        userId: true,
        phone: true,
        document: true,
        createdAt: true,
        updatedAt: true,

        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },

        addresses: true,
        cart: true,
      },
    });
  }

  async findOne(id: number) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        phone: true,
        document: true,
        createdAt: true,
        updatedAt: true,

        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },

        addresses: true,
        cart: true,
      },
    });

    if (!customer) {
      throw new NotFoundException('Cliente não encontrado');
    }

    return customer;
  }
}
