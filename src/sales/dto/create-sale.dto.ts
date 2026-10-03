import {
  IsArray,
  IsEnum,
  IsInt,
  IsNumber,
  IsPositive,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '../../generated/prisma/client.js';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSaleItemDto {
  @ApiProperty({
    example: 1,
    description: 'ID do produto vendido.',
  })
  @IsInt()
  @IsPositive()
  productId: number;

  @ApiProperty({
    example: 2,
    description: 'Quantidade do produto.',
  })
  @IsInt()
  @IsPositive()
  quantity: number;
}
export class CreateSaleDto {
  @ApiProperty({
    example: 2,
    description: 'ID do caixa aberto utilizado para realizar a venda.',
  })
  @IsInt()
  @IsPositive()
  cashRegisterId: number;

  @ApiProperty({
    description: 'Produtos que fazem parte da venda.',
    example: [
      {
        productId: 1,
        quantity: 1,
      },
      {
        productId: 2,
        quantity: 2,
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSaleItemDto)
  items: CreateSaleItemDto[];

  @ApiProperty({
    example: 439.7,
    description: 'Valor pago pelo cliente.',
  })
  @IsNumber()
  @IsPositive()
  paymentAmount: number;

  @ApiProperty({
    example: 'PIX',
    enum: ['DINERO', 'TARJETA', 'PIX', 'QR'],
    description: 'Método utilizado para pagamento.',
  })
  paymentMethod: 'DINERO' | 'TARJETA' | 'PIX' | 'QR';
}