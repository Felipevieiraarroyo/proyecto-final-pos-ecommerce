import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  UseGuards,
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

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

@ApiTags('Inventory')
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar estoque',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de estoques.',
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
  })
  @ApiResponse({
    status: 404,
    description: 'Estoque do produto não encontrado.',
  })
  findByProduct(@Param('productId', ParseIntPipe) productId: number) {
    return this.inventoryService.findByProduct(productId);
  }

  @Patch(':productId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Atualizar estoque',
    description:
      'Somente ADMIN pode atualizar manualmente a quantidade disponível.',
  })
  @ApiParam({
    name: 'productId',
    example: 1,
    description: 'ID do produto.',
  })
  @ApiResponse({
    status: 200,
    description: 'Estoque atualizado.',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autenticado.',
  })
  @ApiResponse({
    status: 403,
    description: 'Acesso permitido somente ao ADMIN.',
  })
  @ApiResponse({
    status: 404,
    description: 'Estoque do produto não encontrado.',
  })
  update(
    @Param('productId', ParseIntPipe) productId: number,
    @Body() updateInventoryDto: UpdateInventoryDto,
  ) {
    return this.inventoryService.update(productId, updateInventoryDto);
  }
}
