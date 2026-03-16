import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { OfferServiceModule } from "./infrastructure/modules/offer-service.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.getOrThrow<string>("MONGODB_URI"),
        // Auto-create collections and sync indexes on startup
        autoCreate: true,
        autoIndex: true,
      }),
    }),
    OfferServiceModule,
  ],
})
export class AppModule { }
