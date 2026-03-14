import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type RestaurantDocument = Restaurant & Document;

@Schema({ timestamps: true })
export class Restaurant {
  @Prop({ required: true, index: true })
  ownerId: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  address: string;

  @Prop()
  phone: string;

  @Prop()
  email: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const RestaurantSchema = SchemaFactory.createForClass(Restaurant);
