import {
  IsArray,
  IsEnum,
  IsInt,
  IsPositive,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '../../generated/prisma/client.js';

export class CreateSocialOrderItemDto {
  @IsInt()
  @IsPositive()
  productId: number;

  @IsInt()
  @IsPositive()
  quantity: number;
}

export class CreateSocialOrderDto {
  @IsInt()
  @IsPositive()
  customerId: number;

  @IsInt()
  @IsPositive()
  addressId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSocialOrderItemDto)
  items: CreateSocialOrderItemDto[];

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;
}