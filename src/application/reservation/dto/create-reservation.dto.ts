import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsDateString,
  IsEnum,
  Min,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { ReservationStatus } from "../../../domain/reservation/reservation.entity";

export class CreateReservationDto {
  @ApiProperty({ example: "64f1a2b3c4d5e6f7a8b9c0d1", description: "ID of the restaurant" })
  @IsString()
  @IsNotEmpty()
  restaurantId: string;

  @ApiPropertyOptional({ example: "64f1a2b3c4d5e6f7a8b9c0d2", description: "Optional offer ID to link this reservation to a specific deal" })
  @IsString()
  @IsOptional()
  offerId?: string;

  @ApiProperty({ example: "64f1a2b3c4d5e6f7a8b9c0d3", description: "ID of the user making the reservation (auto-filled from auth headers)" })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ example: 2, description: "Number of people in the party (min 1)", minimum: 1 })
  @IsNumber()
  @Min(1)
  partySize: number;

  @ApiProperty({ example: "2026-03-14T19:30:00.000Z", description: "ISO 8601 datetime for the reservation" })
  @IsDateString()
  reservationDate: string;

  @ApiPropertyOptional({ enum: ReservationStatus, example: ReservationStatus.PENDING, description: "Reservation status (defaults to PENDING)" })
  @IsEnum(ReservationStatus)
  @IsOptional()
  status?: ReservationStatus;
}
