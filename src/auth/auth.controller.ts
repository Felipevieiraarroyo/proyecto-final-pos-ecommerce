import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { RolesGuard } from './guards/roles.guard.js';
import { Roles } from './decorators/roles.decorator.js';
import type { AuthenticatedRequest } from './interfaces/authenticated-request.interface.js';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

@Post('login')
@ApiOperation({
  summary: 'Realiza login',
  description: 'Autentica um usuário e retorna um JWT.',
})
@ApiResponse({
  status: 201,
  description: 'Login realizado com sucesso.',
  example: {
    access_token: 'eyJhbGciOiJIUzI1NiIs...',
    user: {
      id: 3,
      email: 'cliente@proyectofinal.com',
      role: 'CLIENTE',
    },
  },
})
@ApiResponse({
  status: 401,
  description: 'Email ou senha inválidos.',
})
login(@Body() loginDto: LoginDto) {
  return this.authService.login(loginDto);
}
 @Get('me')
@ApiBearerAuth('access-token')
@ApiOperation({
  summary: 'Consultar usuário autenticado',
})
@ApiResponse({
  status: 200,
  description: 'Dados do usuário autenticado.',
  example: {
    id: 3,
    email: 'cliente@proyectofinal.com',
    role: 'CLIENTE',
  },
})
@UseGuards(JwtAuthGuard)
me(@Req() request: AuthenticatedRequest) {
  return request.user;
}

@Get('admin-test')
@ApiBearerAuth('access-token')
@ApiOperation({
  summary: 'Teste de acesso ADMIN',
})
@ApiResponse({
  status: 200,
  description: 'Usuário ADMIN autorizado.',
  example: {
    message: 'Acesso autorizado para ADMIN',
    user: {
      id: 1,
      email: 'admin@proyectofinal.com',
      role: 'ADMIN',
    },
  },
})
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
adminTest(@Req() request: AuthenticatedRequest) {
  return {
    message: 'Acesso autorizado para ADMIN',
    user: request.user,
  };
}

@Get('cashier-test')
@ApiBearerAuth('access-token')
@ApiOperation({
  summary: 'Teste de acesso CASHIER',
})
@ApiResponse({
  status: 200,
  description: 'Usuário CAJERO autorizado.',
  example: {
    message: 'Acesso autorizado para CAJERO',
    user: {
      id: 2,
      email: 'cajero@proyectofinal.com',
      role: 'CAJERO',
    },
  },
})
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('CAJERO')
cashiertest(@Req() request: AuthenticatedRequest) {
  return {
    message: 'Acesso autorizado para CAJERO',
    user: request.user,
  };
}

@Get('client-test')
@ApiBearerAuth('access-token')
@ApiOperation({
  summary: 'Teste de acesso CLIENTE',
})
@ApiResponse({
  status: 200,
  description: 'Usuário CLIENTE autorizado.',
  example: {
    message: 'Acesso autorizado para CLIENTE',
    user: {
      id: 3,
      email: 'cliente@proyectofinal.com',
      role: 'CLIENTE',
    },
  },
})
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('CLIENTE')
clientTest(@Req() request: AuthenticatedRequest) {
  return {
    message: 'Acesso autorizado para CLIENTE',
    user: request.user,
  };
}
}