import {
  IsEnum,
  IsInt,
  IsPositive,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum OrderPaymentMethod {
  DINERO = 'DINERO',
  TARJETA = 'TARJETA',
  PIX = 'PIX',
  QR = 'QR',
}

export class CreateOrderDto {
@ApiProperty({
  example: 1,
  description: 'ID do endereço de entrega do cliente.',
})
@IsInt()
@IsPositive()
addressId: number;

@ApiProperty({
  example: 'PIX',
  enum: ['DINERO', 'TARJETA', 'PIX', 'QR'],
})
@IsEnum(OrderPaymentMethod)
paymentMethod: OrderPaymentMethod;
  
}