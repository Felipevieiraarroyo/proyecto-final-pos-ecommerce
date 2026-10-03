import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'cliente@proyectofinal.com',
    description: 'Email cadastrado do usuário.',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Cliente123!',
    description: 'Senha do usuário.',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}