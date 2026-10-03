import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { CustomersService } from './customers.service.js';
import { CreateCustomerDto } from './dto/create-customer.dto.js';
import {
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('customers')
@Controller('customers')
export class CustomersController {
  constructor(
    private readonly customersService: CustomersService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Criar cliente',
  })
  @ApiResponse({
    status: 201,
    description: 'Cliente criado.',
    example: {
      id: 1,
      userId: 3,
      email: 'cliente@proyectofinal.com',
      name: 'Cliente Demo',
      phone: '11999999999',
      document: '12345678900',
    },
  })
  create(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customersService.create(
      createCustomerDto,
    );
  }

  @Get()
  @ApiOperation({
    summary: 'Listar clientes',
    description: 'Retorna todos os clientes cadastrados.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de clientes.',
    example: [
      {
        id: 1,
        userId: 3,
        email: 'cliente@proyectofinal.com',
        name: 'Cliente Demo',
        phone: '11999999999',
        document: '12345678900',
      },
    ],
  })
  findAll() {
    return this.customersService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar clientes por ID',
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
    example: {
      id: 1,
      userId: 3,
      email: 'cliente@proyectofinal.com',
      name: 'Cliente Demo',
      phone: '11999999999',
      document: '12345678900',
    },
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.customersService.findOne(id);
  }
}