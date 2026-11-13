import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class ChangeTemporaryPasswordDto {
  @ApiProperty({ example: 'cliente@email.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'a1b2c3d4e5f6' })
  @IsString()
  temporaryPassword: string;

  @ApiProperty({
    example: 'MinhaNovaSenha123',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  newPassword: string;
}
