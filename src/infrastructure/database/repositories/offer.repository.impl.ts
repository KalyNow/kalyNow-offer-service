import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { FilterQuery, Model } from "mongoose";
import { Offer as OfferEntity } from "../../../domain/offer/offer.entity";
import { OfferRepository, FindOffersParams } from "../../../domain/offer/offer.repository";
import { Offer, OfferDocument } from "../schemas/offer.schema";

@Injectable()
export class OfferRepositoryImpl implements OfferRepository {
  constructor(
    @InjectModel(Offer.name)
    private readonly offerModel: Model<OfferDocument>,
  ) { }

  async findAll(): Promise<OfferEntity[]> {
    const documents = await this.offerModel.find().exec();
    return documents.map((doc) => this.toEntity(doc));
  }

  async findById(id: string): Promise<OfferEntity | null> {
    const document = await this.offerModel.findById(id).exec();
    return document ? this.toEntity(document) : null;
  }

  async findByRestaurantId(restaurantId: string): Promise<OfferEntity[]> {
    const documents = await this.offerModel.find({ restaurantId }).exec();
    return documents.map((doc) => this.toEntity(doc));
  }

  async create(offer: Partial<OfferEntity>): Promise<OfferEntity> {
    const created = new this.offerModel(offer);
    const saved = await created.save();
    return this.toEntity(saved);
  }

  async update(
    id: string,
    offer: Partial<OfferEntity>,
  ): Promise<OfferEntity | null> {
    const updated = await this.offerModel
      .findByIdAndUpdate(id, offer, { new: true })
      .exec();
    return updated ? this.toEntity(updated) : null;
  }

  private buildFilter(params: Omit<FindOffersParams, 'page' | 'limit'>): FilterQuery<OfferDocument> {
    const filter: FilterQuery<OfferDocument> = {};
    if (params.restaurantId) filter.restaurantId = params.restaurantId;
    if (params.search) filter.title = { $regex: params.search, $options: 'i' };
    if (params.activeOnly === true) {
      filter.isActive = true;
      filter.$or = [{ availableTo: null }, { availableTo: { $gte: new Date() } }];
    } else if (params.activeOnly === false) {
      filter.$or = [{ isActive: false }, { availableTo: { $lt: new Date() } }];
    }
    return filter;
  }

  async findPaginated(params: FindOffersParams): Promise<OfferEntity[]> {
    const skip = (params.page - 1) * params.limit;
    const filter = this.buildFilter(params);
    const documents = await this.offerModel
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(params.limit)
      .exec();
    return documents.map((doc) => this.toEntity(doc));
  }

  async countFiltered(params: Omit<FindOffersParams, 'page' | 'limit'>): Promise<number> {
    const filter = this.buildFilter(params);
    return this.offerModel.countDocuments(filter).exec();
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.offerModel.findByIdAndDelete(id).exec();
    return result !== null;
  }

  private toEntity(doc: OfferDocument): OfferEntity {
    const entity = new OfferEntity();
    entity.id = String(doc._id);
    entity.restaurantId = doc.restaurantId.toString();
    entity.title = doc.title;
    entity.description = doc.description;
    entity.price = doc.price;
    entity.discountedPrice = doc.discountedPrice;
    entity.availableFrom = doc.availableFrom;
    entity.availableTo = doc.availableTo;
    entity.imageUrls = doc.imageUrls ?? [];
    entity.isActive = doc.isActive;
    entity.quantity = doc.quantity ?? null;
    entity.createdAt = (doc as unknown as { createdAt: Date }).createdAt;
    entity.updatedAt = (doc as unknown as { updatedAt: Date }).updatedAt;
    return entity;
  }
}
