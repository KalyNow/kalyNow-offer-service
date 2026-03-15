import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { FilterQuery, Model } from "mongoose";
import { Restaurant as RestaurantEntity } from "../../../domain/restaurant/restaurant.entity";
import { RestaurantRepository, FindRestaurantsParams } from "../../../domain/restaurant/restaurant.repository";
import { Restaurant, RestaurantDocument } from "../schemas/restaurant.schema";

@Injectable()
export class RestaurantRepositoryImpl implements RestaurantRepository {
  constructor(
    @InjectModel(Restaurant.name)
    private readonly restaurantModel: Model<RestaurantDocument>,
  ) { }

  async findAll(): Promise<RestaurantEntity[]> {
    const documents = await this.restaurantModel.find().exec();
    return documents.map((doc) => this.toEntity(doc));
  }

  async findByOwner(ownerId: string): Promise<RestaurantEntity[]> {
    const documents = await this.restaurantModel.find({ ownerId }).exec();
    return documents.map((doc) => this.toEntity(doc));
  }

  async findById(id: string): Promise<RestaurantEntity | null> {
    const document = await this.restaurantModel.findById(id).exec();
    return document ? this.toEntity(document) : null;
  }

  async create(
    restaurant: Partial<RestaurantEntity>,
  ): Promise<RestaurantEntity> {
    const created = new this.restaurantModel(restaurant);
    const saved = await created.save();
    return this.toEntity(saved);
  }

  async update(
    id: string,
    restaurant: Partial<RestaurantEntity>,
  ): Promise<RestaurantEntity | null> {
    const updated = await this.restaurantModel
      .findByIdAndUpdate(id, restaurant, { new: true })
      .exec();
    return updated ? this.toEntity(updated) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.restaurantModel.findByIdAndDelete(id).exec();
    return result !== null;
  }

  private buildFilter(params: Omit<FindRestaurantsParams, 'page' | 'limit'>): FilterQuery<RestaurantDocument> {
    const filter: FilterQuery<RestaurantDocument> = {};
    if (params.ownerId) filter.ownerId = params.ownerId;
    if (params.search) filter.name = { $regex: params.search, $options: 'i' };
    return filter;
  }

  async findPaginated(params: FindRestaurantsParams): Promise<RestaurantEntity[]> {
    const skip = (params.page - 1) * params.limit;
    const documents = await this.restaurantModel
      .find(this.buildFilter(params))
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(params.limit)
      .exec();
    return documents.map((doc) => this.toEntity(doc));
  }

  async countFiltered(params: Omit<FindRestaurantsParams, 'page' | 'limit'>): Promise<number> {
    return this.restaurantModel.countDocuments(this.buildFilter(params)).exec();
  }

  private toEntity(doc: RestaurantDocument): RestaurantEntity {
    const entity = new RestaurantEntity();
    entity.id = String(doc._id);
    entity.ownerId = doc.ownerId;
    entity.name = doc.name;
    entity.description = doc.description;
    entity.address = doc.address;
    entity.phone = doc.phone;
    entity.email = doc.email;
    entity.logoUrl = doc.logoUrl ?? null;
    entity.latitude = (doc as unknown as { latitude: number | null }).latitude ?? null;
    entity.longitude = (doc as unknown as { longitude: number | null }).longitude ?? null;
    entity.isActive = doc.isActive;
    entity.createdAt = (doc as unknown as { createdAt: Date }).createdAt;
    entity.updatedAt = (doc as unknown as { updatedAt: Date }).updatedAt;
    return entity;
  }
}
