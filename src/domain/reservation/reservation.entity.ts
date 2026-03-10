export enum ReservationStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  CANCELLED = "cancelled",
}

export class Reservation {
  id: string;
  restaurantId: string;
  offerId: string;
  userId: string;
  partySize: number;
  status: ReservationStatus;
  reservationDate: Date;
  createdAt: Date;
  updatedAt: Date;
}
