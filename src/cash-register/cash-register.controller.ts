import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { CashRegisterService } from './cash-register.service.js';
import { OpenCashRegisterDto } from './dto/open-cash-register.dto.js';
import { CloseCashRegisterDto } from './dto/close-cash-register.dto.js';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface.js';

@ApiTags('Cash Register')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('CAJERO')
@Controller('cash-register')
export class CashRegisterController {
  constructor(
    private readonly cashRegisterService: CashRegisterService,
  ) {}

  @Post('open')
  @ApiOperation({
    summary: 'Abrir caixa',
    description:
      'Abre um novo caixa para o operador autenticado.',
  })
  @ApiResponse({
    status: 201,
    description: 'Caixa aberto com sucesso.',
    example: {
      id: 2,
      userId: 2,
      openingAmount: 100,
      closingAmount: null,
      status: 'OPEN',
      openedAt: '2026-10-01T20:00:00.000Z',
      closedAt: null,
    },
  })
  @ApiResponse({
    status: 400,
    description: 'O usuário já possui um caixa aberto.',
  })
  open(
    @Req() request: AuthenticatedRequest,
    @Body() openCashRegisterDto: OpenCashRegisterDto,
  ) {
    return this.cashRegisterService.open(
      request.user.id,
      openCashRegisterDto,
    );
  }

  @Get('open')
  @ApiOperation({
    summary: 'Consultar caixa aberto',
    description:
      'Retorna o caixa aberto do operador autenticado.',
  })
  @ApiResponse({
    status: 200,
    description: 'Caixa aberto encontrado.',
    example: {
      id: 2,
      userId: 2,
      openingAmount: 100,
      closingAmount: null,
      status: 'OPEN',
      openedAt: '2026-10-01T20:00:00.000Z',
      closedAt: null,
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Nenhum caixa aberto encontrado.',
  })
  findOpen(@Req() request: AuthenticatedRequest) {
    return this.cashRegisterService.findOpen(
      request.user.id,
    );
  }

  @Patch(':id/close')
  @ApiOperation({
    summary: 'Fechar caixa',
    description:
      'Fecha o caixa e realiza a reconciliação entre o valor esperado e o valor contado.',
  })
  @ApiParam({
    name: 'id',
    example: 2,
    description: 'ID do caixa.',
  })
  @ApiResponse({
    status: 200,
    description: 'Caixa fechado e reconciliado.',
    example: {
      cashRegister: {
        id: 2,
        userId: 2,
        openingAmount: 100,
        closingAmount: 100,
        status: 'CLOSED',
        openedAt: '2026-10-01T20:00:00.000Z',
        closedAt: '2026-10-01T22:00:00.000Z',
      },
      reconciliation: {
        openingAmount: 100,
        salesTotal: 0,
        expectedAmount: 100,
        closingAmount: 100,
        difference: 0,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'O caixa já está fechado.',
  })
  @ApiResponse({
    status: 404,
    description: 'Caixa não encontrado.',
  })
  close(
    @Param('id', ParseIntPipe) id: number,
    @Body() closeCashRegisterDto: CloseCashRegisterDto,
  ) {
    return this.cashRegisterService.close(
      id,
      closeCashRegisterDto,
    );
  }
}