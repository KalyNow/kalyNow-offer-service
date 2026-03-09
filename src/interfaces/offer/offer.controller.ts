import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { OfferService } from "../../application/offer/offer.service";
import { CreateOfferDto } from "../../application/offer/dto/create-offer.dto";
import { UpdateOfferDto } from "../../application/offer/dto/update-offer.dto";

@Controller("offers")
export class OfferController {
  constructor(private readonly offerService: OfferService) {}

  @Get()
  findAll(@Query("restaurantId") restaurantId?: string) {
    if (restaurantId) {
      return this.offerService.findByRestaurant(restaurantId);
    }
    return this.offerService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.offerService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createOfferDto: CreateOfferDto) {
    return this.offerService.create(createOfferDto);
  }

  @Put(":id")
  update(@Param("id") id: string, @Body() updateOfferDto: UpdateOfferDto) {
    return this.offerService.update(id, updateOfferDto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param("id") id: string) {
    return this.offerService.remove(id);
  }
}
