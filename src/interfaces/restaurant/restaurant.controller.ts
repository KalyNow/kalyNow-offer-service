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
import { RestaurantService } from "../../application/restaurant/restaurant.service";
import { CreateRestaurantDto } from "../../application/restaurant/dto/create-restaurant.dto";
import { UpdateRestaurantDto } from "../../application/restaurant/dto/update-restaurant.dto";
import { ApiTags } from "@nestjs/swagger";
import { ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiSecurity } from "@nestjs/swagger";
import { CurrentUser } from "../common/current-user.decorator";
import type { AuthenticatedUser } from "../common/current-user.decorator";
import { Roles, UserRole } from "../common/roles.decorator";

@ApiTags("restaurants")
@ApiSecurity("X-User-Id")
@ApiSecurity("X-User-Role")
@Controller("restaurants")
export class RestaurantController {
  constructor(private readonly restaurantService: RestaurantService) { }

  @Get()
  @ApiOperation({ summary: "List all restaurants" })
  @ApiResponse({ status: 200, description: "Array of restaurants" })
  findAll(
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.restaurantService.findAll();
  }

  @Get("/me")
  @ApiOperation({ summary: "List restaurants owned by the authenticated seller" })
  @ApiResponse({ status: 200, description: "Array of restaurants belonging to the current user" })
  finByOwner(
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.restaurantService.findByOwner(user.id)
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a restaurant by ID" })
  @ApiParam({ name: "id", description: "MongoDB ObjectId of the restaurant" })
  @ApiResponse({ status: 200, description: "Restaurant found" })
  @ApiResponse({ status: 404, description: "Restaurant not found" })
  findOne(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.restaurantService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.SELLER, UserRole.ADMIN)
  @ApiOperation({ summary: "Create a restaurant (SELLER / ADMIN)" })
  @ApiResponse({ status: 201, description: "Restaurant created" })
  @ApiResponse({ status: 403, description: "Forbidden — requires SELLER or ADMIN role" })
  create(@CurrentUser() user: AuthenticatedUser, @Body() createRestaurantDto: CreateRestaurantDto) {
    return this.restaurantService.create(createRestaurantDto, user.id);
  }

  @Put(":id")
  @Roles(UserRole.SELLER, UserRole.ADMIN)
  @ApiOperation({ summary: "Update a restaurant (owner only)" })
  @ApiParam({ name: "id", description: "MongoDB ObjectId of the restaurant" })
  @ApiResponse({ status: 200, description: "Restaurant updated" })
  @ApiResponse({ status: 403, description: "Forbidden — not the owner" })
  @ApiResponse({ status: 404, description: "Restaurant not found" })
  update(
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
}
