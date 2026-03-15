import { Restaurant } from "./restaurant.entity";

export interface FindRestaurantsParams {
  page: number;
  limit: number;
  search?: string;
  ownerId?: string;
}

export abstract class RestaurantRepository {
  abstract findAll(): Promise<Restaurant[]>;
  abstract findById(id: string): Promise<Restaurant | null>;
  abstract findByOwner(ownerId: string): Promise<Restaurant[]>;
  abstract findPaginated(params: FindRestaurantsParams): Promise<Restaurant[]>;
  abstract countFiltered(params: Omit<FindRestaurantsParams, 'page' | 'limit'>): Promise<number>;
  abstract create(restaurant: Partial<Restaurant>): Promise<Restaurant>;
  abstract update(
    id: string,
    restaurant: Partial<Restaurant>,
  ): Promise<Restaurant | null>;
  abstract delete(id: string): Promise<boolean>;
}
