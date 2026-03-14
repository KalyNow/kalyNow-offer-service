import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsBoolean,
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

  @ApiPropertyOptional({ example: true, description: "Whether the restaurant is accepting orders", default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
