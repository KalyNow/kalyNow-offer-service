import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { OfferServiceModule } from "./infrastructure/modules/offer-service.module";

@Module({
  imports: [
    MongooseModule.forRoot(
      process.env.MONGODB_URI ??
        "mongodb://localhost:27017/kalynow-offer-service",
    ),
    OfferServiceModule,
  ],
})
export class AppModule {}
