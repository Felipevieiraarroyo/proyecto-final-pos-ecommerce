import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { CustomersService } from './customers.service.js';
import { CreateCustomerDto } from './dto/create-customer.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

@ApiTags('Customers')
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Cadastrar cliente presencialmente',
    description:
      'Permite que um CAJERO cadastre um cliente e receba uma senha temporária.',
  })
  @ApiResponse({
    status: 201,
    description: 'Cliente cadastrado com sucesso.',
    example: {
      message:
        'Cliente cadastrado com sucesso. Entregue a senha temporária ao cliente.',
      temporaryPassword: 'a1b2c3d4e5f6789012345678',
      user: {
        id: 4,
        name: 'Cliente Demo',
        email: 'cliente@proyectofinal.com',
        role: 'CLIENTE',
      },
      customer: {
        id: 2,
        phone: '11999999999',
        document: '12345678900',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Token ausente ou inválido.',
  })
  @ApiResponse({
    status: 403,
    description: 'Apenas CAJERO pode cadastrar clientes presencialmente.',
  })
  @ApiResponse({
    status: 409,
    description: 'Email ou documento já cadastrado.',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CAJERO')
  create(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customersService.create(createCustomerDto);
  }

  @Get()
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Listar clientes',
    description: 'Retorna todos os clientes cadastrados.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de clientes.',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'CAJERO')
  findAll() {
    return this.customersService.findAll();
  }

  @Get(':id')
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Buscar cliente por ID',
    description: 'Retorna um cliente específico pelo seu ID.',
  })
  @ApiParam({
    name: 'id',
    example: 1,
    description: 'ID do cliente.',
  })
  @ApiResponse({
    status: 200,
    description: 'Cliente encontrado.',
  })
  @ApiResponse({
    status: 404,
    description: 'Cliente não encontrado.',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'CAJERO')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.customersService.findOne(id);
  }
}
