import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMyAddressDto {
  @ApiProperty({
    example: 'Rua das Flores',
    description: 'Nome da rua.',
  })
  @IsString()
  @IsNotEmpty()
  street: string;

  @ApiProperty({
    example: '123',
    description: 'Número do endereço.',
  })
  @IsString()
  @IsNotEmpty()
  number: string;

  @ApiPropertyOptional({
    example: 'Apartamento 42',
    description: 'Complemento do endereço.',
  })
  @IsOptional()
  @IsString()
  complement?: string;

  @ApiProperty({
    example: 'Santo André',
    description: 'Cidade do endereço.',
  })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiPropertyOptional({
    example: 'Próximo ao centro',
    description: 'Ponto de referência para entrega.',
  })
  @IsOptional()
  @IsString()
  reference?: string;
}
