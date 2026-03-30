import { IsString, IsNotEmpty, IsOptional, Min, IsNumber } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsNumber()
  @IsOptional() // O IsNotEmpty si quieres que sea obligatorio al crear
  @Min(0)
  basePrice?: number;
}