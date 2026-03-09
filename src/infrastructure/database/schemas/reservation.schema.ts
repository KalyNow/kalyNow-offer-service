import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { ReservationStatus } from "../../../domain/reservation/reservation.entity";

export type ReservationDocument = Reservation & Document;

@Schema({ timestamps: true })
export class Reservation {
  @Prop({ type: Types.ObjectId, ref: "Restaurant", required: true })
  restaurantId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "Offer" })
  offerId: Types.ObjectId;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true, min: 1 })
  partySize: number;

  @Prop({
    type: String,
    enum: ReservationStatus,
    default: ReservationStatus.PENDING,
  })
  status: ReservationStatus;

  @Prop({ required: true })
  reservationDate: Date;
}

export const ReservationSchema = SchemaFactory.createForClass(Reservation);
