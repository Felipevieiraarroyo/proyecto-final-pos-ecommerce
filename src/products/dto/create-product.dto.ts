import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';

import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreateProductDto {
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
    example: 120,
    description: 'Preço de aquisição do produto.',
  })
  @IsNumber()
  @IsPositive()
  acquisitionPrice: number;

  @ApiProperty({
    example: 199.9,
    description: 'Preço de venda do produto.',
  })
  @IsNumber()
  @IsPositive()
  salePrice: number;
}