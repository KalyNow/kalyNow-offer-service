import { Injectable, NotFoundException } from "@nestjs/common";
import { Reservation } from "../../domain/reservation/reservation.entity";
import { ReservationRepository } from "../../domain/reservation/reservation.repository";
import { CreateReservationDto } from "./dto/create-reservation.dto";
import { UpdateReservationDto } from "./dto/update-reservation.dto";

@Injectable()
export class ReservationService {
  constructor(private readonly reservationRepository: ReservationRepository) {}

  findAll(): Promise<Reservation[]> {
    return this.reservationRepository.findAll();
  }

  async findOne(id: string): Promise<Reservation> {
    const reservation = await this.reservationRepository.findById(id);
    if (!reservation) {
      throw new NotFoundException(`Reservation #${id} not found`);
    }
    return reservation;
  }

  findByUser(userId: string): Promise<Reservation[]> {
    return this.reservationRepository.findByUserId(userId);
  }

  findByRestaurant(restaurantId: string): Promise<Reservation[]> {
    return this.reservationRepository.findByRestaurantId(restaurantId);
  }

  create(createReservationDto: CreateReservationDto): Promise<Reservation> {
    return this.reservationRepository.create({
      ...createReservationDto,
      reservationDate: new Date(createReservationDto.reservationDate),
    });
  }

  async update(
    id: string,
    updateReservationDto: UpdateReservationDto,
  ): Promise<Reservation> {
    const reservation = await this.reservationRepository.update(id, {
      ...updateReservationDto,
      reservationDate: updateReservationDto.reservationDate
        ? new Date(updateReservationDto.reservationDate)
        : undefined,
    });
    if (!reservation) {
      throw new NotFoundException(`Reservation #${id} not found`);
    }
    return reservation;
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.reservationRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException(`Reservation #${id} not found`);
    }
  }
}
