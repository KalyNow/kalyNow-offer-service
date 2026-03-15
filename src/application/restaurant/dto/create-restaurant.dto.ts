import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsBoolean,
  IsUrl,
  IsNumber,
  Min,
  Max,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateRestaurantDto {
  @ApiProperty({ example: "Le Petit Bistro", description: "Restaurant name" })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: "A cozy French bistro in the heart of the city", description: "Short description" })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: "12 Rue de la Paix, Paris 75001", description: "Full address" })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiPropertyOptional({ example: "+33 1 23 45 67 89", description: "Contact phone number" })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: "contact@lepetitbistro.fr", description: "Contact email" })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: "https://cdn.example.com/logo.png", description: "URL of the restaurant logo" })
  @IsUrl()
  @IsOptional()
  logoUrl?: string;

  @ApiPropertyOptional({ example: -21.4545, description: "GPS latitude (-90 to 90)" })
  @IsNumber()
  @Min(-90)
  @Max(90)
  @IsOptional()
  latitude?: number;

  @ApiPropertyOptional({ example: 47.0833, description: "GPS longitude (-180 to 180)" })
  @IsNumber()
  @Min(-180)
  @Max(180)
  @IsOptional()
  longitude?: number;

  @ApiPropertyOptional({ example: true, description: "Whether the restaurant is accepting orders", default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
