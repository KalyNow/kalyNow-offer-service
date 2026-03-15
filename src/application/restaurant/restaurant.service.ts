import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { Restaurant } from "../../domain/restaurant/restaurant.entity";
import { RestaurantRepository } from "../../domain/restaurant/restaurant.repository";
import { CreateRestaurantDto } from "./dto/create-restaurant.dto";
import { UpdateRestaurantDto } from "./dto/update-restaurant.dto";
import { PaginatedResultDto } from "../common/pagination.dto";
import { RestaurantQueryDto } from "./dto/restaurant-query.dto";

@Injectable()
export class RestaurantService {
  constructor(private readonly restaurantRepository: RestaurantRepository) { }

  findAll(): Promise<Restaurant[]> {
    return this.restaurantRepository.findAll();
  }

  async findPaginated(query: RestaurantQueryDto): Promise<PaginatedResultDto<Restaurant>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const [data, total] = await Promise.all([
      this.restaurantRepository.findPaginated({ page, limit, search: query.search }),
      this.restaurantRepository.countFiltered({ search: query.search }),
    ]);
    return new PaginatedResultDto(data, total, page, limit);
  }

  async findByOwnerPaginated(ownerId: string, query: RestaurantQueryDto): Promise<PaginatedResultDto<Restaurant>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const [data, total] = await Promise.all([
      this.restaurantRepository.findPaginated({ page, limit, search: query.search, ownerId }),
      this.restaurantRepository.countFiltered({ search: query.search, ownerId }),
    ]);
    return new PaginatedResultDto(data, total, page, limit);
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
