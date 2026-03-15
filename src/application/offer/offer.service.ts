import { ForbiddenException, Injectable, NotFoundException, UnprocessableEntityException } from "@nestjs/common";
import { Offer, OfferStatus } from "../../domain/offer/offer.entity";
import { OfferRepository, FindOffersParams } from "../../domain/offer/offer.repository";
import { RestaurantRepository } from "../../domain/restaurant/restaurant.repository";
import { CreateOfferDto } from "./dto/create-offer.dto";
import { UpdateOfferDto } from "./dto/update-offer.dto";
import { PaginatedResultDto } from "../common/pagination.dto";
import { OfferQueryDto } from "../common/paginated-result.dto";

/** Serialise une Offer en plain object avec le champ calculé 'status' */
function withStatus(offer: Offer): Offer & { status: OfferStatus } {
  return {
    id: offer.id,
    restaurantId: offer.restaurantId,
    title: offer.title,
    description: offer.description,
    price: offer.price,
    discountedPrice: offer.discountedPrice,
    availableFrom: offer.availableFrom,
    availableTo: offer.availableTo,
    imageUrls: offer.imageUrls,
    isActive: offer.isActive,
    quantity: offer.quantity,
    createdAt: offer.createdAt,
    updatedAt: offer.updatedAt,
    status: offer.status, // getter évalué ici, stocké comme valeur dans le plain object
  };
}

@Injectable()
export class OfferService {
  constructor(
    private readonly offerRepository: OfferRepository,
    private readonly restaurantRepository: RestaurantRepository,
  ) { }

  findAll(): Promise<Offer[]> {
    return this.offerRepository.findAll();
  }

  async findPaginated(query: OfferQueryDto): Promise<PaginatedResultDto<Offer & { status: OfferStatus }>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const params: FindOffersParams = {
      page,
      limit,
      search: query.search,
      restaurantId: query.restaurantId,
      activeOnly: query.activeOnly,
    };
    const [data, total] = await Promise.all([
      this.offerRepository.findPaginated(params),
      this.offerRepository.countFiltered(params),
    ]);
    return new PaginatedResultDto(data.map(withStatus), total, page, limit);
  }

  async findOne(id: string): Promise<Offer & { status: OfferStatus }> {
    const offer = await this.offerRepository.findById(id);
    if (!offer) {
      throw new NotFoundException(`Offer #${id} not found`);
    }
    return withStatus(offer);
  }

  findByRestaurant(restaurantId: string): Promise<Offer[]> {
    return this.offerRepository.findByRestaurantId(restaurantId);
  }

  async create(createOfferDto: CreateOfferDto, requesterId: string): Promise<Offer & { status: OfferStatus }> {
    await this.assertRestaurantOwnership(createOfferDto.restaurantId, requesterId);
    const offer = await this.offerRepository.create({
      ...createOfferDto,
      availableFrom: createOfferDto.availableFrom
        ? new Date(createOfferDto.availableFrom)
        : undefined,
      availableTo: createOfferDto.availableTo
        ? new Date(createOfferDto.availableTo)
        : undefined,
    });
    return withStatus(offer);
  }

  async update(id: string, updateOfferDto: UpdateOfferDto, requesterId: string): Promise<Offer & { status: OfferStatus }> {
    const existing = await this.findOne(id);
    await this.assertRestaurantOwnership(existing.restaurantId, requesterId);
    if (existing.status === OfferStatus.EXPIRED) {
      throw new UnprocessableEntityException('Cannot update an expired offer');
    }
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
    return withStatus(offer);
  }

  async remove(id: string, requesterId: string): Promise<void> {
    const existing = await this.findOne(id);
    await this.assertRestaurantOwnership(existing.restaurantId, requesterId);
    const deleted = await this.offerRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException(`Offer #${id} not found`);
    }
  }

  async deactivate(id: string, requesterId: string): Promise<Offer & { status: OfferStatus }> {
    const existing = await this.findOne(id);
    await this.assertRestaurantOwnership(existing.restaurantId, requesterId);
    if (existing.status === OfferStatus.EXPIRED) {
      throw new UnprocessableEntityException('Cannot deactivate an expired offer');
    }
    const offer = await this.offerRepository.update(id, { isActive: false });
    if (!offer) {
      throw new NotFoundException(`Offer #${id} not found`);
    }
    return withStatus(offer);
  }

  async activate(id: string, requesterId: string): Promise<Offer & { status: OfferStatus }> {
    const existing = await this.findOne(id);
    await this.assertRestaurantOwnership(existing.restaurantId, requesterId);
    if (existing.status === OfferStatus.EXPIRED) {
      throw new UnprocessableEntityException('Cannot activate an expired offer');
    }
    const offer = await this.offerRepository.update(id, { isActive: true });
    if (!offer) {
      throw new NotFoundException(`Offer #${id} not found`);
    }
    return withStatus(offer);
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
