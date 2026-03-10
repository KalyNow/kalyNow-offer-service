import { Injectable, NotFoundException } from "@nestjs/common";
import { Restaurant } from "../../domain/restaurant/restaurant.entity";
import { RestaurantRepository } from "../../domain/restaurant/restaurant.repository";
import { CreateRestaurantDto } from "./dto/create-restaurant.dto";
import { UpdateRestaurantDto } from "./dto/update-restaurant.dto";

@Injectable()
export class RestaurantService {
  constructor(private readonly restaurantRepository: RestaurantRepository) {}

  findAll(): Promise<Restaurant[]> {
    return this.restaurantRepository.findAll();
  }

  async findOne(id: string): Promise<Restaurant> {
    const restaurant = await this.restaurantRepository.findById(id);
    if (!restaurant) {
      throw new NotFoundException(`Restaurant #${id} not found`);
    }
    return restaurant;
  }

  create(createRestaurantDto: CreateRestaurantDto): Promise<Restaurant> {
    return this.restaurantRepository.create(createRestaurantDto);
  }

  async update(
    id: string,
    updateRestaurantDto: UpdateRestaurantDto,
  ): Promise<Restaurant> {
    const restaurant = await this.restaurantRepository.update(
      id,
      updateRestaurantDto,
    );
    if (!restaurant) {
      throw new NotFoundException(`Restaurant #${id} not found`);
    }
    return restaurant;
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.restaurantRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException(`Restaurant #${id} not found`);
    }
  }
}
