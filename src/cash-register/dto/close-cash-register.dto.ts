import {
  IsNumber,
  IsPositive,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CloseCashRegisterDto {
  @ApiProperty({
  example: 539.7,
  description: 'Valor contado fisicamente no caixa no momento do fechamento.',
})
  @IsNumber()
  @IsPositive()
  closingAmount: number;
}