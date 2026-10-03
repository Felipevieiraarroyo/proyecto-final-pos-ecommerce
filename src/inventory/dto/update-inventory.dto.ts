import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class UpdateInventoryDto {
  @ApiProperty({
    example: 25,
    description: 'Nova quantidade disponível em estoque.',
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  quantity: number;
}