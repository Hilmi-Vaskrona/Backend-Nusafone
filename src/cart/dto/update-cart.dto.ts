import { IsInt, Min, IsOptional } from 'class-validator';

export class UpdateCartDto {
  @IsInt()
  @Min(1)
  @IsOptional()
  quantity?: number;
}
