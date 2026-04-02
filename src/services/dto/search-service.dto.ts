import { IsOptional, IsString, IsNumber, Min, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchServiceDto {
  @IsOptional()
  @IsString()
  q?: string; // Búsqueda por texto (título/descripción)

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  minRating?: number; // Filtro por estrellas
}