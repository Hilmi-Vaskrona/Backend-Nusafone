import {
  IsString,
  IsNumber,
  IsOptional,
  IsInt,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'MacBook Pro 14' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Apple M3 Pro chip' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 24999000 })
  @IsNumber()
  price: number;

  @ApiPropertyOptional({ example: 50 })
  @IsInt()
  @Min(0)
  @IsOptional()
  stock?: number;

  @ApiPropertyOptional({ example: 'https://example.com/macbook.png' })
  @IsString()
  @IsOptional()
  image?: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  categoryId: number;
}
