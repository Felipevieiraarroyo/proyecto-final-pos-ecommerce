import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';

import {
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({
    example: 'Eletrônicos',
    description: 'Nome da categoria.',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    example: 'Produtos eletrônicos e acessórios tecnológicos.',
    description: 'Descrição da categoria.',
  })
  @IsOptional()
  @IsString()
  description?: string;
}