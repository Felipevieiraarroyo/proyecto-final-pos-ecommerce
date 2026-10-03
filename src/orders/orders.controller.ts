import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
} from '@nestjs/swagger';
import { OrdersService } from './orders.service.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto.js';
import { CreateSocialOrderDto } from './dto/create-social-order.dto.js';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles, ROLES_KEY } from '../auth/decorators/roles.decorator.js';

import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface.js';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
//==== ORDER ====
  constructor(
    private readonly ordersService: OrdersService,
  ) {}

  @Get()
@ApiBearerAuth('access-token')
@ApiOperation({
  summary: 'Listar pedidos',
  description:
    'Retorna os pedidos com cliente, itens e pagamentos.',
})
@ApiResponse({
  status: 200,
  description: 'Lista de pedidos.',
})
findAll() {
  return this.ordersService.findAll();
}

 @Get(':id')
@ApiBearerAuth('access-token')
@ApiOperation({
  summary: 'Buscar pedido por ID',
})
@ApiResponse({
  status: 200,
  description: 'Pedido encontrado.',
})
@ApiResponse({
  status: 404,
  description: 'Pedido não encontrado.',
})
findOne(@Param('id', ParseIntPipe) id: number) {
  return this.ordersService.findOne(id);
}

 @Post('checkout')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('CLIENTE')
@ApiOperation({
  summary: 'Finalizar carrinho como pedido',
  description:
    'Cria um pedido WEB a partir do carrinho do cliente, copia o endereço como snapshot, registra o pagamento pendente e reserva o estoque.',
})
@ApiResponse({
  status: 201,
  description: 'Pedido criado com sucesso.',
})
@ApiResponse({
  status: 400,
  description: 'Carrinho vazio ou estoque insuficiente.',
})
@ApiResponse({
  status: 401,
  description: 'Token JWT ausente ou inválido.',
})
@ApiResponse({
  status: 403,
  description: 'Apenas clientes podem finalizar pedidos.',
})
@ApiResponse({
  status: 404,
  description: 'Cliente ou endereço não encontrado.',
})
checkout(
  @Req() request: AuthenticatedRequest,
  @Body() createOrderDto: CreateOrderDto,
) {
  return this.ordersService.checkoutByUser(
    request.user.id,
    createOrderDto,
  );
}
  @Patch(':id/status')
@Patch(':id/status')
@ApiOperation({
  summary: 'Atualizar status do pedido',
  description:
    'Atualiza o status logístico do pedido. Ao cancelar, o estoque reservado é restaurado e o pagamento é cancelado.',
})
@ApiParam({
  name: 'id',
  example: 1,
  description: 'ID do pedido.',
})
@ApiResponse({
  status: 200,
  description: 'Status atualizado com sucesso.',
  example: {
    id: 1,
    customerId: 1,
    source: 'WEB',
    status: 'EN_CAMINO',
    total: 299.7,
    items: [
      {
        id: 1,
        productId: 1,
        quantity: 1,
        unitPrice: 199.9,
        subtotal: 199.9,
      },
    ],
    payments: [
      {
        id: 1,
        orderId: 1,
        amount: 299.7,
        method: 'PIX',
        status: 'COMPLETO',
      },
    ],
  },
})
@ApiResponse({
  status: 400,
  description:
    'Não é possível alterar pedido cancelado ou entregue.',
})
@ApiResponse({
  status: 404,
  description: 'Pedido não encontrado.',
})
updateStatus(
  @Param('id', ParseIntPipe) id: number,
  @Body() updateOrderStatusDto: UpdateOrderStatusDto,
) {
  return this.ordersService.updateStatus(
    id,
    updateOrderStatusDto.status,
  );
}
// ==== SOCIAL ====
@Post('social')
@Post('social')
@ApiOperation({
  summary: 'Criar pedido de rede social',
  description:
    'Registra manualmente um pedido recebido por redes sociais. O pedido utiliza a mesma estrutura de Order do e-commerce.',
})
@ApiResponse({
  status: 201,
  description: 'Pedido social criado com sucesso.',
  example: {
    id: 7,
    customerId: 1,
    source: 'SOCIAL',
    status: 'PAGO',
    total: 159.9,
    shippingStreet: 'Rua das Flores',
    shippingNumber: '123',
    shippingCity: 'Santo André',
    items: [
      {
        id: 12,
        productId: 3,
        quantity: 1,
        unitPrice: 159.9,
        subtotal: 159.9,
      },
    ],
    payments: [
      {
        id: 9,
        orderId: 7,
        amount: 159.9,
        method: 'PIX',
        status: 'COMPLETO',
      },
    ],
  },
})
@ApiResponse({
  status: 400,
  description: 'Estoque insuficiente ou pedido inválido.',
})
@ApiResponse({
  status: 404,
  description: 'Cliente, endereço ou produto não encontrado.',
})
createSocialOrder(
  @Body() createSocialOrderDto: CreateSocialOrderDto,
) {
  return this.ordersService.createSocialOrder(
    createSocialOrderDto,
  );
}
}