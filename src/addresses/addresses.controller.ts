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
import {
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('addresses')
@Controller('addresses')
export class AddressesController {
  constructor(
    private readonly addressesService: AddressesService,
  ) {}

  @Post()
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
    return this.addressesService.create(
      createAddressDto,
    );
  }

  @Get()
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