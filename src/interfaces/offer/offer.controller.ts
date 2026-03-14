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
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { OfferService } from "../../application/offer/offer.service";
import { CreateOfferDto } from "../../application/offer/dto/create-offer.dto";
import { UpdateOfferDto } from "../../application/offer/dto/update-offer.dto";
import { StorageService } from "../../infrastructure/storage/storage.service";
import { ApiTags } from "@nestjs/swagger";
import { ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiSecurity, ApiConsumes, ApiBody } from "@nestjs/swagger";
import { CurrentUser } from "../common/current-user.decorator";
import type { AuthenticatedUser } from "../common/current-user.decorator";
import { Roles, UserRole } from "../common/roles.decorator";

@ApiTags("offers")
@ApiSecurity("X-User-Id")
@ApiSecurity("X-User-Role")
@Controller("offers")
export class OfferController {
  constructor(
    private readonly offerService: OfferService,
    private readonly storageService: StorageService,
  ) { }
  // StorageService is injected only for the image upload endpoint

  @Get()
  @ApiOperation({ summary: "List all offers, optionally filtered by restaurant" })
  @ApiQuery({ name: "restaurantId", required: false, description: "Filter offers by restaurant ID" })
  @ApiResponse({ status: 200, description: "Array of offers" })
  async findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query("restaurantId") restaurantId?: string,
  ) {
    return restaurantId
      ? await this.offerService.findByRestaurant(restaurantId)
      : await this.offerService.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get an offer by ID" })
  @ApiParam({ name: "id", description: "MongoDB ObjectId of the offer" })
  @ApiResponse({ status: 200, description: "Offer found" })
  @ApiResponse({ status: 404, description: "Offer not found" })
  async findOne(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.offerService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.SELLER, UserRole.ADMIN)
  @ApiOperation({ summary: "Create an offer (SELLER must own the restaurant)" })
  @ApiResponse({ status: 201, description: "Offer created" })
  @ApiResponse({ status: 403, description: "Forbidden — not the restaurant owner" })
  async create(@CurrentUser() user: AuthenticatedUser, @Body() createOfferDto: CreateOfferDto) {
    return this.offerService.create(createOfferDto, user.id);
  }

  @Put(":id")
  @Roles(UserRole.SELLER, UserRole.ADMIN)
  @ApiOperation({ summary: "Update an offer (SELLER must own the parent restaurant)" })
  @ApiParam({ name: "id", description: "MongoDB ObjectId of the offer" })
  @ApiResponse({ status: 200, description: "Offer updated" })
  @ApiResponse({ status: 403, description: "Forbidden — not the restaurant owner" })
  @ApiResponse({ status: 404, description: "Offer not found" })
  async update(
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

  // ----------------------------------------------------------------
  // Image upload
  // ----------------------------------------------------------------

  @Post(":id/images")
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.SELLER, UserRole.ADMIN)
  @UseInterceptors(FileInterceptor("file"))
  @ApiOperation({ summary: "Upload an image for an offer and append its URL to imageUrls" })
  @ApiParam({ name: "id", description: "MongoDB ObjectId of the offer" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        file: { type: "string", format: "binary", description: "Image file (jpg, png, webp, gif, svg)" },
      },
      required: ["file"],
    },
  })
  @ApiResponse({ status: 200, description: "Image uploaded, returns updated offer" })
  @ApiResponse({ status: 400, description: "No file provided" })
  @ApiResponse({ status: 403, description: "Forbidden — not the restaurant owner" })
  @ApiResponse({ status: 404, description: "Offer not found" })
  async uploadImage(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException("No file provided");

    const path = await this.storageService.upload(
      file.buffer,
      file.originalname,
      "offers",
    );

    // path = "/kalynow-assets/offers/uuid.jpg" — stored as-is in DB
    const offer = await this.offerService.findOne(id);
    return this.offerService.update(
      id,
      { imageUrls: [...(offer.imageUrls ?? []), path] },
      user.id,
    );
  }
}
