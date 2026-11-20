import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { AddressesService } from './addresses.service.js';
import { CreateAddressDto } from './dto/create-address.dto.js';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface.js';
import { CreateMyAddressDto } from './dto/create-my-address.dto.js';

@ApiTags('addresses')
@Controller('addresses')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Post('me')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CLIENTE')
  @ApiOperation({
    summary: 'Cadastrar meu endereço',
    description: 'Cadastra um endereço para o cliente autenticado.',
  })
  createMyAddress(
    @Req() request: AuthenticatedRequest,
    @Body() createAddressDto: CreateMyAddressDto,
  ) {
    return this.addressesService.createByUser(
      request.user.id,
      createAddressDto,
    );
  }

  @Get('me')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CLIENTE')
  @ApiOperation({
    summary: 'Listar meus endereços',
    description: 'Retorna somente os endereços do cliente autenticado.',
  })
  findMyAddresses(@Req() request: AuthenticatedRequest) {
    return this.addressesService.findAllByUser(request.user.id);
  }

  @Post()
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'CAJERO')
  @ApiOperation({
    summary: 'Criar endereço',
  })
  @ApiResponse({
    status: 201,
    description: 'Endereço criado.',
    example: {
      id: 1,
      customerId: 1,
      street: 'Rua das Flores',
      number: '123',
      complement: 'Apartamento 42',
      city: 'Santo André',
      reference: 'Próximo ao centro',
    },
  })
  create(@Body() createAddressDto: CreateAddressDto) {
    return this.addressesService.create(createAddressDto);
  }

  @Get()
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'CAJERO')
  @ApiOperation({
    summary: 'Listar endereços',
    description: 'Retorna todos os endereços cadastrados.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de endereços.',
    example: [
      {
        id: 1,
        customerId: 1,
        street: 'Rua das Flores',
        number: '123',
        complement: 'Apartamento 42',
        city: 'Santo André',
        reference: 'Próximo ao centro',
      },
    ],
  })
  @ApiOperation({
    summary: 'Obter endereço por ID',
    description: 'Retorna um endereço específico com base no ID fornecido.',
  })
  @ApiResponse({
    status: 200,
    description: 'Endereço encontrado.',
    example: {
      id: 1,
      customerId: 1,
      street: 'Rua das Flores',
      number: '123',
      complement: 'Apartamento 42',
      city: 'Santo André',
      reference: 'Próximo ao centro',
    },
  })
  findAll() {
    return this.addressesService.findAll();
  }

  @Get(':id')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'CAJERO')
  @ApiOperation({
    summary: 'Buscar endereço por ID',
    description: 'Retorna um endereço específico pelo seu ID.',
  })
  @ApiParam({
    name: 'id',
    example: 1,
    description: 'ID do endereço.',
  })
  @ApiResponse({
    status: 200,
    description: 'Endereço encontrado.',
    example: {
      id: 1,
      customerId: 1,
      street: 'Rua das Flores',
      number: '123',
      complement: 'Apartamento 42',
      city: 'Santo André',
      reference: 'Próximo ao centro',
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Endereço não encontrado.',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.addressesService.findOne(id);
  }
}
