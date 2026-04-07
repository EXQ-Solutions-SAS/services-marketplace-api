import { IsNotEmpty, IsUUID, IsDateString, IsInt, Min } from 'class-validator';

export class CreateBookingDto {
  @IsUUID()
  serviceId: string;

  @IsDateString()
  scheduledAt: string;

  @IsInt()
  @Min(1)
  hours: number; // Nuevo campo
}
