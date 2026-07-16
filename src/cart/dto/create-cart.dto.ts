import { IsNumber, IsInt, Min } from 'class-validator';

export class CreateCartDto {
  @IsNumber()
  productId: number;

  @IsInt()
  @Min(1)
  quantity: number;
}
