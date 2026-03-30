import { IsString, IsNotEmpty, IsNumber, IsUUID, Min } from 'class-validator';

export class CreateServiceDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @Min(1)
  pricePerHour: number; // El precio negociado/ofertado

  @IsUUID()
  @IsNotEmpty()
  categoryId: string;
}