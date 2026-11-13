import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { SalesService } from './sales.service.js';
import { CreateSaleDto } from './dto/create-sale.dto.js';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

interface AuthenticatedRequest {
  user: {
    id: number;
    role: string;
  };
}

@ApiTags('Sales')
@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'CAJERO')
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Registrar venda no POS',
    description:
      'Cria uma venda, valida o caixa, verifica o estoque, registra os itens, baixa o estoque e registra o pagamento.',
  })
  @ApiResponse({
    status: 201,
    description: 'Venda realizada com sucesso.',
  })
  @ApiResponse({
    status: 400,
    description:
      'Caixa fechado, estoque insuficiente ou valor do pagamento diferente do total.',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autenticado.',
  })
  @ApiResponse({
    status: 403,
    description: 'Acesso não permitido ao caixa informado.',
  })
  @ApiResponse({
    status: 404,
    description: 'Caixa ou produto não encontrado.',
  })
  create(
    @Body() createSaleDto: CreateSaleDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.salesService.create(createSaleDto, {
      sub: req.user.id,
      role: req.user.role,
    });
  }
}
