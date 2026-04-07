import { IsString, IsNotEmpty, IsUUID, IsNumber } from 'class-validator';

export class CreatePaymentDto {
  @IsUUID()
  @IsNotEmpty()
  bookingId!: string;

  @IsNumber()
  @IsNotEmpty()
  amount!: number;

  @IsString()
  @IsNotEmpty()
  paymentMethod!: string; // Ejemplo: "CARD", "CASH"
}
