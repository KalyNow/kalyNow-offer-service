import { Reservation } from "./reservation.entity";

export abstract class ReservationRepository {
  abstract findAll(): Promise<Reservation[]>;
  abstract findById(id: string): Promise<Reservation | null>;
  abstract findByUserId(userId: string): Promise<Reservation[]>;
  abstract findByRestaurantId(restaurantId: string): Promise<Reservation[]>;
  abstract create(reservation: Partial<Reservation>): Promise<Reservation>;
  abstract update(
    id: string,
    reservation: Partial<Reservation>,
  ): Promise<Reservation | null>;
  abstract delete(id: string): Promise<boolean>;
}
