import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @ApiPropertyOptional({
    example: 10,
    description: 'Quantidade inicial em estoque.',
    minimum: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  initialQuantity?: number;

  @ApiProperty({
    example: 1,
    description: 'ID da categoria.',
  })
  @IsInt()
  @IsPositive()
  categoryId: number;

  @ApiProperty({
    example: 'Teclado Mecânico',
    description: 'Nome do produto.',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    example: 'Teclado mecânico RGB com switches azuis.',
    description: 'Descrição do produto.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 120.5,
    description:
      'Preço de aquisição do produto (máximo de duas casas decimais).',
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  acquisitionPrice: number;

  @ApiProperty({
    example: 199.9,
    description: 'Preço de venda do produto (máximo de duas casas decimais).',
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  salePrice: number;
}
