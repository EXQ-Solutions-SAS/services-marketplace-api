import {
  IsString,
  IsNotEmpty,
  IsInt,
  Min,
  Max,
  IsUUID,
  IsOptional,
} from 'class-validator';

export class CreateReviewDto {
  @IsUUID()
  @IsNotEmpty()
  bookingId!: string;

  @IsInt()
  @Min(1)
  @Max(5)
  @IsNotEmpty()
  rating!: number;

  @IsString()
  @IsOptional()
  comment?: string;
}
