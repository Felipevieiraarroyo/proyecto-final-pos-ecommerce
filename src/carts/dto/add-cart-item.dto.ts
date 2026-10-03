import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive } from 'class-validator';

export class AddCartItemDto {
  @ApiProperty({
    example: 1,
    description: 'ID do produto que será adicionado ao carrinho.',
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