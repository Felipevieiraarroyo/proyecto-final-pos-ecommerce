import { IsNumber, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';


export class OpenCashRegisterDto {
  @IsNumber()
  @IsPositive()
  @ApiProperty({
    example: 100.0,
    description: 'Valor inicial em dinheiro no caixa no momento da abertura.',
  })
  openingAmount: number;
}