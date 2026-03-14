import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsDateString,
  IsArray,
  IsUrl,
  Min,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateOfferDto {
  @ApiProperty({ example: "64f1a2b3c4d5e6f7a8b9c0d1", description: "ID of the restaurant this offer belongs to" })
  @IsString()
  @IsNotEmpty()
  restaurantId: string;

  @ApiProperty({ example: "Menu déjeuner — 3 plats", description: "Offer title" })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ example: "Entrée + plat + dessert au choix", description: "Detailed description of the offer" })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 18.5, description: "Regular price (EUR)" })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ example: 14.9, description: "Discounted price if a promotion applies (EUR)" })
  @IsNumber()
  @Min(0)
  @IsOptional()
  discountedPrice?: number;

  @ApiPropertyOptional({ example: "2026-03-14T11:00:00.000Z", description: "ISO 8601 datetime from which the offer is available" })
  @IsDateString()
  @IsOptional()
  availableFrom?: string;

  @ApiPropertyOptional({ example: "2026-03-14T14:30:00.000Z", description: "ISO 8601 datetime until which the offer is available" })
  @IsDateString()
  @IsOptional()
  availableTo?: string;

  @ApiPropertyOptional({
    example: ["https://cdn.example.com/offer1.jpg", "https://cdn.example.com/offer2.jpg"],
    description: "URLs of the offer images",
    type: [String],
  })
  @IsArray()
  @IsUrl({}, { each: true })
  @IsOptional()
  imageUrls?: string[];

  @ApiPropertyOptional({ example: true, description: "Whether the offer is currently active", default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
