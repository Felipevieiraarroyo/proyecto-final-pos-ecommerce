import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'Cliente Demo',
    description: 'Nome completo do cliente.',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'cliente@exemplo.com',
    description: 'Email do cliente.',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'SenhaSegura123',
    description: 'Senha com no mínimo 8 caracteres.',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({
    example: '11999999999',
    description: 'Telefone do cliente.',
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
