import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
} from '@nestjs/swagger';
import { InventoryService } from './inventory.service.js';
import { UpdateInventoryDto } from './dto/update-inventory.dto.js';

@ApiTags('Inventory')
@Controller('inventory')
export class InventoryController {
  constructor(
    private readonly inventoryService: InventoryService,
  ) {}

  @Get()
@ApiOperation({
  summary: 'Listar estoque',
})
@ApiResponse({
  status: 200,
  description: 'Lista de estoques.',
  example: [
    {
      id: 1,
      productId: 1,
      quantity: 14,
      product: {
        id: 1,
        name: 'Teclado Mecânico',
        salePrice: 199.9,
      },
    },
    {
      id: 2,
      productId: 2,
      quantity: 18,
      product: {
        id: 2,
        name: 'Mouse Gamer',
        salePrice: 119.9,
      },
    },
  ],
})
findAll() {
  return this.inventoryService.findAll();
}

 @Get(':productId')
@ApiOperation({
  summary: 'Consultar estoque de um produto',
})
@ApiParam({
  name: 'productId',
  example: 1,
  description: 'ID do produto.',
})
@ApiResponse({
  status: 200,
  description: 'Estoque encontrado.',
  example: {
    id: 1,
    productId: 1,
    quantity: 14,
    product: {
      id: 1,
      name: 'Teclado Mecânico',
      salePrice: 199.9,
    },
  },
})
@ApiResponse({
  status: 404,
  description: 'Estoque do produto não encontrado.',
})
findByProduct(
  @Param('productId', ParseIntPipe) productId: number,
) {
  return this.inventoryService.findByProduct(productId);
}

 @Patch(':productId')
@ApiBearerAuth('access-token')
@ApiOperation({
  summary: 'Atualizar estoque',
  description: 'Atualiza a quantidade disponível de um produto.',
})
@ApiParam({
  name: 'productId',
  example: 1,
  description: 'ID do produto.',
})
@ApiResponse({
  status: 200,
  description: 'Estoque atualizado.',
  example: {
    id: 1,
    productId: 1,
    quantity: 25,
  },
})
@ApiResponse({
  status: 404,
  description: 'Estoque do produto não encontrado.',
})
update(
  @Param('productId', ParseIntPipe) productId: number,
  @Body() updateInventoryDto: UpdateInventoryDto,
) {
  return this.inventoryService.update(
    productId,
    updateInventoryDto,
  );
}
}