import {
  IsString,
  IsNumber,
  IsOptional,
  IsInt,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  price!: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  stock?: number;

  @IsString()
  @IsOptional()
  image?: string;

  @IsString()
  categoryId!: string;
}
