import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreateCustomerDto {
  @ApiProperty({
    example: 3,
    description: 'ID do usuário associado ao cliente.',
  })
  @IsInt()
  @IsPositive()
  userId: number;

  @ApiProperty({
    example: 'cliente@proyectofinal.com',
    description: 'Email de contato do cliente.',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Cliente Demo',
    description: 'Nome completo do cliente.',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: '11999999999',
    description: 'Telefone de contato.',
  })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({
    example: '12345678900',
    description: 'Documento de identificação do cliente.',
  })
  @IsString()
  @IsNotEmpty()
  document: string;
}