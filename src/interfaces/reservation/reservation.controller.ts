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

@Controller("reservations")
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  @Get()
  findAll(
    @Query("userId") userId?: string,
    @Query("restaurantId") restaurantId?: string,
  ) {
    if (userId) {
      return this.reservationService.findByUser(userId);
    }
    if (restaurantId) {
      return this.reservationService.findByRestaurant(restaurantId);
    }
    return this.reservationService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.reservationService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createReservationDto: CreateReservationDto) {
    return this.reservationService.create(createReservationDto);
  }

  @Put(":id")
  update(
    @Param("id") id: string,
    @Body() updateReservationDto: UpdateReservationDto,
  ) {
    return this.reservationService.update(id, updateReservationDto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param("id") id: string) {
    return this.reservationService.remove(id);
  }
}
