import {
  Body,
  Controller,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SalesService } from './sales.service.js';
import { CreateSaleDto } from './dto/create-sale.dto.js';

@ApiTags('Sales')
@Controller('sales')
export class SalesController {
  constructor(
    private readonly salesService: SalesService,
  ) {}

 @Post()
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
  status: 404,
  description: 'Caixa ou produto não encontrado.',
})
create(@Body() createSaleDto: CreateSaleDto) {
  return this.salesService.create(createSaleDto);
}
}