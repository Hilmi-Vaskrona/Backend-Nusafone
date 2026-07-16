import { IsString, IsOptional } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  address: string;

  @IsString()
  @IsOptional()
  note?: string;
}
