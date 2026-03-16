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
import { ReservationService } from "../../application/reservation/reservation.service";
import { CreateReservationDto } from "../../application/reservation/dto/create-reservation.dto";
import { UpdateReservationDto } from "../../application/reservation/dto/update-reservation.dto";
import { ApiTags } from "@nestjs/swagger";
import { ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiSecurity } from "@nestjs/swagger";
import { CurrentUser } from "../common/current-user.decorator";
import type { AuthenticatedUser } from "../common/current-user.decorator";
import { Roles, UserRole } from "../common/roles.decorator";

@ApiTags("reservations")
@ApiSecurity("X-User-Id")
@ApiSecurity("X-User-Role")
@Controller("reservations")
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) { }

  @Get()
  @ApiOperation({ summary: "List reservations (defaults to the authenticated user\'s own)" })
  @ApiQuery({ name: "userId", required: false, description: "Filter by user ID (defaults to authenticated user)" })
  @ApiQuery({ name: "restaurantId", required: false, description: "Filter by restaurant ID" })
  @ApiResponse({ status: 200, description: "Array of reservations" })
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query("userId") userId?: string,
    @Query("restaurantId") restaurantId?: string,
  ) {
    // Default to the authenticated user's own reservations
    const resolvedUserId = userId ?? user?.id;
    if (resolvedUserId) {
      return this.reservationService.findByUser(resolvedUserId);
    }
    if (restaurantId) {
      return this.reservationService.findByRestaurant(restaurantId);
    }
    return this.reservationService.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a reservation by ID" })
  @ApiParam({ name: "id", description: "MongoDB ObjectId of the reservation" })
  @ApiResponse({ status: 200, description: "Reservation found" })
  @ApiResponse({ status: 404, description: "Reservation not found" })
  findOne(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.reservationService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.BUYER)
  @ApiOperation({ summary: "Create a reservation (BUYER only — userId auto-filled from auth headers)" })
  @ApiResponse({ status: 201, description: "Reservation created" })
  @ApiResponse({ status: 403, description: "Forbidden — requires BUYER role" })
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() createReservationDto: CreateReservationDto,
  ) {
    // Automatically set userId from the authenticated user
    return this.reservationService.create({
      ...createReservationDto,
      userId: user?.id ?? createReservationDto.userId,
    });
  }

  @Put(":id")
  @Roles(UserRole.SELLER, UserRole.ADMIN)
  @ApiOperation({ summary: "Update reservation status (SELLER / ADMIN only)" })
  @ApiParam({ name: "id", description: "MongoDB ObjectId of the reservation" })
  @ApiResponse({ status: 200, description: "Reservation updated" })
  @ApiResponse({ status: 403, description: "Forbidden — requires SELLER or ADMIN role" })
  @ApiResponse({ status: 404, description: "Reservation not found" })
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Body() updateReservationDto: UpdateReservationDto,
  ) {
    return this.reservationService.update(id, updateReservationDto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.BUYER)
  @ApiOperation({ summary: "Cancel a reservation (BUYER only)" })
  @ApiParam({ name: "id", description: "MongoDB ObjectId of the reservation" })
  @ApiResponse({ status: 204, description: "Reservation cancelled" })
  @ApiResponse({ status: 403, description: "Forbidden — requires BUYER role" })
  remove(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.reservationService.remove(id);
  }
}
