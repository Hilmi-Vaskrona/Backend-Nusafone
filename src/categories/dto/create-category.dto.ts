import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Laptop' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'https://example.com/laptop.png' })
  @IsString()
  @IsOptional()
  image?: string;
}
