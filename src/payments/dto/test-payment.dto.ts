import { IsInt, IsNumber, IsPositive } from 'class-validator';

export class TestPaymentDto {
  @IsNumber()
  @IsPositive()
  amount: number;

  @IsInt()
  @IsPositive()
  orderId: number;
}