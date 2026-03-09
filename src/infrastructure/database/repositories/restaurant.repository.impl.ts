import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Restaurant as RestaurantEntity } from "../../../domain/restaurant/restaurant.entity";
import { RestaurantRepository } from "../../../domain/restaurant/restaurant.repository";
import { Restaurant, RestaurantDocument } from "../schemas/restaurant.schema";

@Injectable()
export class RestaurantRepositoryImpl implements RestaurantRepository {
  constructor(
    @InjectModel(Restaurant.name)
    private readonly restaurantModel: Model<RestaurantDocument>,
  ) {}

  async findAll(): Promise<RestaurantEntity[]> {
    const documents = await this.restaurantModel.find().exec();
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

  private toEntity(doc: RestaurantDocument): RestaurantEntity {
    const entity = new RestaurantEntity();
    entity.id = String(doc._id);
    entity.name = doc.name;
    entity.description = doc.description;
    entity.address = doc.address;
    entity.phone = doc.phone;
    entity.email = doc.email;
    entity.isActive = doc.isActive;
    entity.createdAt = (doc as unknown as { createdAt: Date }).createdAt;
    entity.updatedAt = (doc as unknown as { updatedAt: Date }).updatedAt;
    return entity;
  }
}
