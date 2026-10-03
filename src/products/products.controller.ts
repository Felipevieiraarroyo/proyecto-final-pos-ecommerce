import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
} from '@nestjs/swagger';
import { ProductsService } from './products.service.js';
import { CreateProductDto } from './dto/create-product.dto.js';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
  ) {}

 @Post()
@ApiBearerAuth('access-token')
@ApiOperation({
  summary: 'Cadastrar produto',
  description: 'Cria um novo produto vinculado a uma categoria.',
})
@ApiResponse({
  status: 201,
  description: 'Produto criado com sucesso.',
  example: {
    id: 6,
    categoryId: 1,
    name: 'Monitor Gamer',
    description: 'Monitor 24 polegadas 144Hz.',
    acquisitionPrice: 700,
    salePrice: 999.9,
  },
})
@ApiResponse({
  status: 404,
  description: 'Categoria não encontrada.',
})
create(@Body() createProductDto: CreateProductDto) {
  return this.productsService.create(createProductDto);
}

  @Get()
@ApiOperation({
  summary: 'Listar produtos',
  description: 'Retorna todos os produtos com categoria e estoque.',
})
@ApiResponse({
  status: 200,
  description: 'Lista de produtos com categoria e estoque.',
  example: [
    {
      id: 1,
      categoryId: 1,
      name: 'Teclado Mecânico',
      description: 'Teclado mecânico RGB.',
      acquisitionPrice: 120,
      salePrice: 199.9,
      category: {
        id: 1,
        name: 'Eletrônicos',
      },
      inventory: {
        id: 1,
        productId: 1,
        quantity: 14,
      },
    },
  ],
})
findAll() {
  return this.productsService.findAll();
}

 @Get(':id')
@ApiOperation({
  summary: 'Buscar produto por ID',
})
@ApiParam({
  name: 'id',
  example: 1,
  description: 'ID do produto.',
})
@ApiResponse({
  status: 200,
  description: 'Produto encontrado.',
  example: {
    id: 1,
    categoryId: 1,
    name: 'Teclado Mecânico',
    acquisitionPrice: 120,
    salePrice: 199.9,
    inventory: {
      id: 1,
      productId: 1,
      quantity: 14,
    },
  },
})
@ApiResponse({
  status: 404,
  description: 'Produto não encontrado.',
})
findOne(@Param('id', ParseIntPipe) id: number) {
  return this.productsService.findOne(id);
}
}