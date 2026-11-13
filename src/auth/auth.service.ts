import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { ChangeTemporaryPasswordDto } from './dto/change-temporary-password.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: loginDto.email,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Email ou senha inválidos');
    }

    const passwordMatches = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException('Email ou senha inválidos');
    }
    if (user.mustChangePassword) {
      throw new ForbiddenException(
        'Você precisa alterar sua senha temporária antes de acessar sua conta',
      );
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      access_token: accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }

  async changeTemporaryPassword(dto: ChangeTemporaryPasswordDto) {
    const { email, temporaryPassword, newPassword } = dto;

    // 1. Localizar o usuário
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    // 2. Verificar se é um cliente que precisa trocar a senha
    if (!user || user.role !== 'CLIENTE' || !user.mustChangePassword) {
      throw new UnauthorizedException(
        'Credenciais inválidas ou senha temporária já utilizada',
      );
    }

    // 3. Conferir a senha temporária
    const passwordMatches = await bcrypt.compare(
      temporaryPassword,
      user.password,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException(
        'Credenciais inválidas ou senha temporária já utilizada',
      );
    }

    // 4. Criptografar a nova senha
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 5. Atualizar somente se a senha ainda estiver pendente de troca
    const result = await this.prisma.user.updateMany({
      where: {
        id: user.id,
        mustChangePassword: true,
      },
      data: {
        password: hashedPassword,
        mustChangePassword: false,
      },
    });

    // 6. Impedir reutilização da senha temporária
    if (result.count !== 1) {
      throw new UnauthorizedException(
        'Credenciais inválidas ou senha temporária já utilizada',
      );
    }

    return {
      message: 'Senha alterada com sucesso. Faça login com sua nova senha.',
    };
  }

  async register(registerDto: RegisterDto) {
    const { name, email, password, phone, document } = registerDto;

    // 1. Verificar se o email já existe
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Este email já está cadastrado');
    }

    // 2. Criptografar a senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Criar usuário, cliente e carrinho em uma transação
    let result;

    try {
      result = await this.prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            name,
            email,
            password: hashedPassword,
            role: 'CLIENTE',
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
    } catch (error) {
      // Trata também uma possível duplicidade simultânea
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

    // 4. Gerar JWT para o cliente
    const payload = {
      sub: result.user.id,
      email: result.user.email,
      role: result.user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    // 5. Retornar dados públicos
    return {
      access_token: accessToken,
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role,
      },
      customer: {
        id: result.customer.id,
        phone: result.customer.phone,
        document: result.customer.document,
      },
    };
  }
}
