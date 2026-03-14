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
import { ApiTags } from "@nestjs/swagger";
import { ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiSecurity } from "@nestjs/swagger";
import { CurrentUser } from "../common/current-user.decorator";
import type { AuthenticatedUser } from "../common/current-user.decorator";
import { Roles, UserRole } from "../common/roles.decorator";

@ApiTags("offers")
@ApiSecurity("X-User-Id")
@ApiSecurity("X-User-Role")
@Controller("offers")
export class OfferController {
  constructor(private readonly offerService: OfferService) { }

  @Get()
  @ApiOperation({ summary: "List all offers, optionally filtered by restaurant" })
  @ApiQuery({ name: "restaurantId", required: false, description: "Filter offers by restaurant ID" })
  @ApiResponse({ status: 200, description: "Array of offers" })
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query("restaurantId") restaurantId?: string,
  ) {
    if (restaurantId) {
      return this.offerService.findByRestaurant(restaurantId);
    }
    return this.offerService.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get an offer by ID" })
  @ApiParam({ name: "id", description: "MongoDB ObjectId of the offer" })
  @ApiResponse({ status: 200, description: "Offer found" })
  @ApiResponse({ status: 404, description: "Offer not found" })
  findOne(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.offerService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.SELLER, UserRole.ADMIN)
  @ApiOperation({ summary: "Create an offer (SELLER must own the restaurant)" })
  @ApiResponse({ status: 201, description: "Offer created" })
  @ApiResponse({ status: 403, description: "Forbidden — not the restaurant owner" })
  create(@CurrentUser() user: AuthenticatedUser, @Body() createOfferDto: CreateOfferDto) {
    return this.offerService.create(createOfferDto, user.id);
  }

  @Put(":id")
  @Roles(UserRole.SELLER, UserRole.ADMIN)
  @ApiOperation({ summary: "Update an offer (SELLER must own the parent restaurant)" })
  @ApiParam({ name: "id", description: "MongoDB ObjectId of the offer" })
  @ApiResponse({ status: 200, description: "Offer updated" })
  @ApiResponse({ status: 403, description: "Forbidden — not the restaurant owner" })
  @ApiResponse({ status: 404, description: "Offer not found" })
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Body() updateOfferDto: UpdateOfferDto,
  ) {
    return this.offerService.update(id, updateOfferDto, user.id);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.SELLER, UserRole.ADMIN)
  @ApiOperation({ summary: "Delete an offer (SELLER must own the parent restaurant)" })
  @ApiParam({ name: "id", description: "MongoDB ObjectId of the offer" })
  @ApiResponse({ status: 204, description: "Offer deleted" })
  @ApiResponse({ status: 403, description: "Forbidden — not the restaurant owner" })
  @ApiResponse({ status: 404, description: "Offer not found" })
  remove(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.offerService.remove(id, user.id);
  }
}
