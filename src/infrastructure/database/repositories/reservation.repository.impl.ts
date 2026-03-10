import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Reservation as ReservationEntity } from "../../../domain/reservation/reservation.entity";
import { ReservationRepository } from "../../../domain/reservation/reservation.repository";
import {
  Reservation,
  ReservationDocument,
} from "../schemas/reservation.schema";

@Injectable()
export class ReservationRepositoryImpl implements ReservationRepository {
  constructor(
    @InjectModel(Reservation.name)
    private readonly reservationModel: Model<ReservationDocument>,
  ) {}

  async findAll(): Promise<ReservationEntity[]> {
    const documents = await this.reservationModel.find().exec();
    return documents.map((doc) => this.toEntity(doc));
  }

  async findById(id: string): Promise<ReservationEntity | null> {
    const document = await this.reservationModel.findById(id).exec();
    return document ? this.toEntity(document) : null;
  }

  async findByUserId(userId: string): Promise<ReservationEntity[]> {
    const documents = await this.reservationModel.find({ userId }).exec();
    return documents.map((doc) => this.toEntity(doc));
  }

  async findByRestaurantId(restaurantId: string): Promise<ReservationEntity[]> {
    const documents = await this.reservationModel.find({ restaurantId }).exec();
    return documents.map((doc) => this.toEntity(doc));
  }

  async create(
    reservation: Partial<ReservationEntity>,
  ): Promise<ReservationEntity> {
    const created = new this.reservationModel(reservation);
    const saved = await created.save();
    return this.toEntity(saved);
  }

  async update(
    id: string,
    reservation: Partial<ReservationEntity>,
  ): Promise<ReservationEntity | null> {
    const updated = await this.reservationModel
      .findByIdAndUpdate(id, reservation, { new: true })
      .exec();
    return updated ? this.toEntity(updated) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.reservationModel.findByIdAndDelete(id).exec();
    return result !== null;
  }

  private toEntity(doc: ReservationDocument): ReservationEntity {
    const entity = new ReservationEntity();
    entity.id = String(doc._id);
    entity.restaurantId = doc.restaurantId.toString();
    entity.offerId = doc.offerId?.toString();
    entity.userId = doc.userId;
    entity.partySize = doc.partySize;
    entity.status = doc.status;
    entity.reservationDate = doc.reservationDate;
    entity.createdAt = (doc as unknown as { createdAt: Date }).createdAt;
    entity.updatedAt = (doc as unknown as { updatedAt: Date }).updatedAt;
    return entity;
  }
}
