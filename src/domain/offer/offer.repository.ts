import { Offer } from "./offer.entity";

export abstract class OfferRepository {
  abstract findAll(): Promise<Offer[]>;
  abstract findById(id: string): Promise<Offer | null>;
  abstract findByRestaurantId(restaurantId: string): Promise<Offer[]>;
  abstract create(offer: Partial<Offer>): Promise<Offer>;
  abstract update(id: string, offer: Partial<Offer>): Promise<Offer | null>;
  abstract delete(id: string): Promise<boolean>;
}
