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

import { CartsService } from './carts.service.js';
import { AddCartItemDto } from './dto/add-cart-item.dto.js';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface.js';

@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('CLIENTE')
@ApiTags('carts')
@Controller('carts')
export class CartsController {
  constructor(
    private readonly cartsService: CartsService,
  ) {}

  @Get('me')
  @ApiOperation({
    summary: 'Consultar meu carrinho',
    description:
      'Retorna o carrinho do cliente autenticado com seus produtos.',
  })
  @ApiResponse({
    status: 200,
    description: 'Carrinho encontrado.',
    example: {
      id: 1,
      customerId: 1,
      items: [
        {
          id: 1,
          cartId: 1,
          productId: 1,
          quantity: 1,
          product: {
            id: 1,
            name: 'Teclado Mecânico',
            salePrice: 199.9,
          },
        },
        {
          id: 2,
          cartId: 1,
          productId: 4,
          quantity: 2,
          product: {
            id: 4,
            name: 'Mousepad',
            salePrice: 49.9,
          },
        },
      ],
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Token JWT ausente ou inválido.',
  })
  @ApiResponse({
    status: 403,
    description: 'Apenas clientes podem acessar o carrinho.',
  })
  findMyCart(@Req() request: AuthenticatedRequest) {
    return this.cartsService.findByUser(request.user.id);
  }

  @Post('me/items')
  @ApiOperation({
    summary: 'Adicionar item ao carrinho',
    description:
      'Adiciona um item ao carrinho do cliente autenticado.',
  })
  @ApiResponse({
    status: 201,
    description: 'Item adicionado ao carrinho.',
    example: {
      id: 3,
      cartId: 1,
      productId: 2,
      quantity: 1,
      product: {
        id: 2,
        name: 'Mouse Gamer',
        salePrice: 119.9,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Estoque insuficiente.',
  })
  @ApiResponse({
    status: 401,
    description: 'Token JWT ausente ou inválido.',
  })
  @ApiResponse({
    status: 403,
    description: 'Apenas clientes podem acessar o carrinho.',
  })
  addItem(
    @Req() request: AuthenticatedRequest,
    @Body() addCartItemDto: AddCartItemDto,
  ) {
    return this.cartsService.addItemByUser(
      request.user.id,
      addCartItemDto,
    );
  }
}