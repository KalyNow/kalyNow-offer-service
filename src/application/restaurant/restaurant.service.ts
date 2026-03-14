import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { Restaurant } from "../../domain/restaurant/restaurant.entity";
import { RestaurantRepository } from "../../domain/restaurant/restaurant.repository";
import { CreateRestaurantDto } from "./dto/create-restaurant.dto";
import { UpdateRestaurantDto } from "./dto/update-restaurant.dto";

@Injectable()
export class RestaurantService {
  constructor(private readonly restaurantRepository: RestaurantRepository) { }

  findAll(): Promise<Restaurant[]> {
    return this.restaurantRepository.findAll();
  }

  findByOwner(ownerId: string): Promise<Restaurant[]> {
    return this.restaurantRepository.findByOwner(ownerId);
  }

  async findOne(id: string): Promise<Restaurant> {
    const restaurant = await this.restaurantRepository.findById(id);
    if (!restaurant) {
      throw new NotFoundException(`Restaurant #${id} not found`);
    }
    return restaurant;
  }

  create(createRestaurantDto: CreateRestaurantDto, ownerId: string): Promise<Restaurant> {
    return this.restaurantRepository.create({ ...createRestaurantDto, ownerId });
  }

  async update(
    id: string,
    updateRestaurantDto: UpdateRestaurantDto,
    requesterId: string,
  ): Promise<Restaurant> {
    const existing = await this.findOne(id);
    if (existing.ownerId !== requesterId) {
      throw new ForbiddenException('You can only update your own restaurant');
    }
    const restaurant = await this.restaurantRepository.update(id, updateRestaurantDto);
    if (!restaurant) {
      throw new NotFoundException(`Restaurant #${id} not found`);
    }
    return restaurant;
  }

  async remove(id: string, requesterId: string): Promise<void> {
    const existing = await this.findOne(id);
    if (existing.ownerId !== requesterId) {
      throw new ForbiddenException('You can only delete your own restaurant');
    }
    const deleted = await this.restaurantRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException(`Restaurant #${id} not found`);
    }
  }
}
