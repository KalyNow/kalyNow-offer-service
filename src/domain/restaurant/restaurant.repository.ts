import { Restaurant } from "./restaurant.entity";

export abstract class RestaurantRepository {
  abstract findAll(): Promise<Restaurant[]>;
  abstract findById(id: string): Promise<Restaurant | null>;
  abstract create(restaurant: Partial<Restaurant>): Promise<Restaurant>;
  abstract update(
    id: string,
    restaurant: Partial<Restaurant>,
  ): Promise<Restaurant | null>;
  abstract delete(id: string): Promise<boolean>;
}
