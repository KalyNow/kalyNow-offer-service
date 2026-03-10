import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsDateString,
  IsEnum,
  Min,
} from "class-validator";
import { ReservationStatus } from "../../../domain/reservation/reservation.entity";

export class CreateReservationDto {
  @IsString()
  @IsNotEmpty()
  restaurantId: string;

  @IsString()
  @IsOptional()
  offerId?: string;

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsNumber()
  @Min(1)
  partySize: number;

  @IsDateString()
  reservationDate: string;

  @IsEnum(ReservationStatus)
  @IsOptional()
  status?: ReservationStatus;
}
