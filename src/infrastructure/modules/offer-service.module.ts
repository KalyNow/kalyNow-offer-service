import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { MongooseModule } from "@nestjs/mongoose";
import {
  Restaurant,
  RestaurantSchema,
} from "../database/schemas/restaurant.schema";
import { Offer, OfferSchema } from "../database/schemas/offer.schema";
import {
  Reservation,
  ReservationSchema,
} from "../database/schemas/reservation.schema";
import { RestaurantRepository } from "../../domain/restaurant/restaurant.repository";
import { OfferRepository } from "../../domain/offer/offer.repository";
import { ReservationRepository } from "../../domain/reservation/reservation.repository";
import { RestaurantRepositoryImpl } from "../database/repositories/restaurant.repository.impl";
import { OfferRepositoryImpl } from "../database/repositories/offer.repository.impl";
import { ReservationRepositoryImpl } from "../database/repositories/reservation.repository.impl";
import { RestaurantService } from "../../application/restaurant/restaurant.service";
import { OfferService } from "../../application/offer/offer.service";
import { ReservationService } from "../../application/reservation/reservation.service";
import { RestaurantController } from "../../interfaces/restaurant/restaurant.controller";
import { OfferController } from "../../interfaces/offer/offer.controller";
import { ReservationController } from "../../interfaces/reservation/reservation.controller";
import { RolesGuard } from "../../interfaces/common/roles.guard";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Restaurant.name, schema: RestaurantSchema },
      { name: Offer.name, schema: OfferSchema },
      { name: Reservation.name, schema: ReservationSchema },
    ]),
  ],
  controllers: [RestaurantController, OfferController, ReservationController],
  providers: [
    RestaurantService,
    OfferService,
    ReservationService,
    { provide: RestaurantRepository, useClass: RestaurantRepositoryImpl },
    { provide: OfferRepository, useClass: OfferRepositoryImpl },
    { provide: ReservationRepository, useClass: ReservationRepositoryImpl },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class OfferServiceModule { }
