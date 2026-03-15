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
import { RestaurantService } from "../../application/restaurant/restaurant.service";
import { CreateRestaurantDto } from "../../application/restaurant/dto/create-restaurant.dto";
import { UpdateRestaurantDto } from "../../application/restaurant/dto/update-restaurant.dto";
import { RestaurantQueryDto } from "../../application/restaurant/dto/restaurant-query.dto";
import { StorageService } from "../../infrastructure/storage/storage.service";
import { ApiTags } from "@nestjs/swagger";
import { ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiSecurity, ApiConsumes, ApiBody } from "@nestjs/swagger";
import { CurrentUser } from "../common/current-user.decorator";
import type { AuthenticatedUser } from "../common/current-user.decorator";
import { Roles, UserRole } from "../common/roles.decorator";

@ApiTags("restaurants")
@ApiSecurity("X-User-Id")
@ApiSecurity("X-User-Role")
@Controller("restaurants")
export class RestaurantController {
  constructor(
    private readonly restaurantService: RestaurantService,
    private readonly storageService: StorageService,
  ) { }

  @Get()
  @ApiOperation({ summary: "List all restaurants with pagination" })
  @ApiQuery({ name: "page", required: false, description: "Page number (default 1)" })
  @ApiQuery({ name: "limit", required: false, description: "Items per page (default 20, max 100)" })
  @ApiQuery({ name: "search", required: false, description: "Search by name" })
  @ApiResponse({ status: 200, description: "Paginated array of restaurants" })
  async findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: RestaurantQueryDto,
  ) {
    return this.restaurantService.findPaginated(query);
  }

  @Get("/me")
  @ApiOperation({ summary: "List restaurants owned by the authenticated seller (paginated)" })
  @ApiQuery({ name: "page", required: false, description: "Page number (default 1)" })
  @ApiQuery({ name: "limit", required: false, description: "Items per page (default 20, max 100)" })
  @ApiQuery({ name: "search", required: false, description: "Search by name" })
  @ApiResponse({ status: 200, description: "Paginated array of restaurants belonging to the current user" })
  async finByOwner(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: RestaurantQueryDto,
  ) {
    return this.restaurantService.findByOwnerPaginated(user.id, query);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a restaurant by ID" })
  @ApiParam({ name: "id", description: "MongoDB ObjectId of the restaurant" })
  @ApiResponse({ status: 200, description: "Restaurant found" })
  @ApiResponse({ status: 404, description: "Restaurant not found" })
  async findOne(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.restaurantService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.SELLER, UserRole.ADMIN)
  @ApiOperation({ summary: "Create a restaurant (SELLER / ADMIN)" })
  @ApiResponse({ status: 201, description: "Restaurant created" })
  @ApiResponse({ status: 403, description: "Forbidden — requires SELLER or ADMIN role" })
  async create(@CurrentUser() user: AuthenticatedUser, @Body() createRestaurantDto: CreateRestaurantDto) {
    return this.restaurantService.create(createRestaurantDto, user.id);
  }

  @Put(":id")
  @Roles(UserRole.SELLER, UserRole.ADMIN)
  @ApiOperation({ summary: "Update a restaurant (owner only)" })
  @ApiParam({ name: "id", description: "MongoDB ObjectId of the restaurant" })
  @ApiResponse({ status: 200, description: "Restaurant updated" })
  @ApiResponse({ status: 403, description: "Forbidden — not the owner" })
  @ApiResponse({ status: 404, description: "Restaurant not found" })
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Body() updateRestaurantDto: UpdateRestaurantDto,
  ) {
    return this.restaurantService.update(id, updateRestaurantDto, user.id);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.SELLER, UserRole.ADMIN)
  @ApiOperation({ summary: "Delete a restaurant (owner only)" })
  @ApiParam({ name: "id", description: "MongoDB ObjectId of the restaurant" })
  @ApiResponse({ status: 204, description: "Restaurant deleted" })
  @ApiResponse({ status: 403, description: "Forbidden — not the owner" })
  @ApiResponse({ status: 404, description: "Restaurant not found" })
  remove(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.restaurantService.remove(id, user.id);
  }
  // ----------------------------------------------------------------
  // Logo upload
  // ----------------------------------------------------------------

  @Post(":id/logo")
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.SELLER, UserRole.ADMIN)
  @UseInterceptors(FileInterceptor("file"))
  @ApiOperation({ summary: "Upload or replace the restaurant logo" })
  @ApiParam({ name: "id", description: "MongoDB ObjectId of the restaurant" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        file: { type: "string", format: "binary", description: "Logo image (jpg, png, webp, svg)" },
      },
      required: ["file"],
    },
  })
  @ApiResponse({ status: 200, description: "Logo uploaded, returns updated restaurant" })
  @ApiResponse({ status: 400, description: "No file provided" })
  @ApiResponse({ status: 403, description: "Forbidden \u2014 not the owner" })
  @ApiResponse({ status: 404, description: "Restaurant not found" })
  async uploadLogo(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException("No file provided");

    const path = await this.storageService.upload(
      file.buffer,
      file.originalname,
      "restaurants/logos",
    );

    // path = "/kalynow-assets/restaurants/logos/uuid.jpg" — stored as-is in DB
    return this.restaurantService.update(id, { logoUrl: path }, user.id);
  }
}
