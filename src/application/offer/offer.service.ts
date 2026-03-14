import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { Offer } from "../../domain/offer/offer.entity";
import { OfferRepository } from "../../domain/offer/offer.repository";
import { RestaurantRepository } from "../../domain/restaurant/restaurant.repository";
import { CreateOfferDto } from "./dto/create-offer.dto";
import { UpdateOfferDto } from "./dto/update-offer.dto";

@Injectable()
export class OfferService {
  constructor(
    private readonly offerRepository: OfferRepository,
    private readonly restaurantRepository: RestaurantRepository,
  ) { }

  findAll(): Promise<Offer[]> {
    return this.offerRepository.findAll();
  }

  async findOne(id: string): Promise<Offer> {
    const offer = await this.offerRepository.findById(id);
    if (!offer) {
      throw new NotFoundException(`Offer #${id} not found`);
    }
    return offer;
  }

  findByRestaurant(restaurantId: string): Promise<Offer[]> {
    return this.offerRepository.findByRestaurantId(restaurantId);
  }

  async create(createOfferDto: CreateOfferDto, requesterId: string): Promise<Offer> {
    await this.assertRestaurantOwnership(createOfferDto.restaurantId, requesterId);
    return this.offerRepository.create({
      ...createOfferDto,
      availableFrom: createOfferDto.availableFrom
        ? new Date(createOfferDto.availableFrom)
        : undefined,
      availableTo: createOfferDto.availableTo
        ? new Date(createOfferDto.availableTo)
        : undefined,
    });
  }

  async update(id: string, updateOfferDto: UpdateOfferDto, requesterId: string): Promise<Offer> {
    const existing = await this.findOne(id);
    await this.assertRestaurantOwnership(existing.restaurantId, requesterId);
    const offer = await this.offerRepository.update(id, {
      ...updateOfferDto,
      availableFrom: updateOfferDto.availableFrom
        ? new Date(updateOfferDto.availableFrom)
        : undefined,
      availableTo: updateOfferDto.availableTo
        ? new Date(updateOfferDto.availableTo)
        : undefined,
    });
    if (!offer) {
      throw new NotFoundException(`Offer #${id} not found`);
    }
    return offer;
  }

  async remove(id: string, requesterId: string): Promise<void> {
    const existing = await this.findOne(id);
    await this.assertRestaurantOwnership(existing.restaurantId, requesterId);
    const deleted = await this.offerRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException(`Offer #${id} not found`);
    }
  }

  private async assertRestaurantOwnership(restaurantId: string, requesterId: string): Promise<void> {
    const restaurant = await this.restaurantRepository.findById(restaurantId);
    if (!restaurant) {
      throw new NotFoundException(`Restaurant #${restaurantId} not found`);
    }
    if (restaurant.ownerId !== requesterId) {
      throw new ForbiddenException('You can only manage offers for your own restaurant');
    }
  }
}
