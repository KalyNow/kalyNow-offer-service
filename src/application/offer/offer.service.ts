import { Injectable, NotFoundException } from "@nestjs/common";
import { Offer } from "../../domain/offer/offer.entity";
import { OfferRepository } from "../../domain/offer/offer.repository";
import { CreateOfferDto } from "./dto/create-offer.dto";
import { UpdateOfferDto } from "./dto/update-offer.dto";

@Injectable()
export class OfferService {
  constructor(private readonly offerRepository: OfferRepository) {}

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

  create(createOfferDto: CreateOfferDto): Promise<Offer> {
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

  async update(id: string, updateOfferDto: UpdateOfferDto): Promise<Offer> {
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

  async remove(id: string): Promise<void> {
    const deleted = await this.offerRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException(`Offer #${id} not found`);
    }
  }
}
