import { IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';

export class RegisterDeviceDto {
  @IsNotEmpty()
  @IsString()
  token!: string;

  @IsOptional()
  @IsString()
  platform?: string; // Ej: 'web', 'android', 'ios'
}
