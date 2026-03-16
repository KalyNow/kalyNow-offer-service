import { Offer } from "./offer.entity";

export interface FindOffersParams {
  page: number;
  limit: number;
  search?: string;
  restaurantId?: string;
  /** undefined = all, true = active only, false = inactive/expired */
  activeOnly?: boolean;
}

export abstract class OfferRepository {
  abstract findAll(): Promise<Offer[]>;
  abstract findById(id: string): Promise<Offer | null>;
  abstract findByRestaurantId(restaurantId: string): Promise<Offer[]>;
  abstract findPaginated(params: FindOffersParams): Promise<Offer[]>;
  abstract countFiltered(params: Omit<FindOffersParams, 'page' | 'limit'>): Promise<number>;
  abstract create(offer: Partial<Offer>): Promise<Offer>;
  abstract update(id: string, offer: Partial<Offer>): Promise<Offer | null>;
  abstract delete(id: string): Promise<boolean>;
}
