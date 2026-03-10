import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException } from "@nestjs/common";
import { ReservationService } from "./reservation.service";
import { ReservationRepository } from "../../domain/reservation/reservation.repository";
import {
  Reservation,
  ReservationStatus,
} from "../../domain/reservation/reservation.entity";
import { CreateReservationDto } from "./dto/create-reservation.dto";
import { UpdateReservationDto } from "./dto/update-reservation.dto";

const mockReservation: Reservation = {
  id: "1",
  restaurantId: "restaurant1",
  offerId: "offer1",
  userId: "user1",
  partySize: 2,
  status: ReservationStatus.PENDING,
  reservationDate: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockReservationRepository = {
  findAll: jest.fn(),
  findById: jest.fn(),
  findByUserId: jest.fn(),
  findByRestaurantId: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe("ReservationService", () => {
  let service: ReservationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationService,
        { provide: ReservationRepository, useValue: mockReservationRepository },
      ],
    }).compile();

    service = module.get<ReservationService>(ReservationService);
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("findAll", () => {
    it("should return an array of reservations", async () => {
      mockReservationRepository.findAll.mockResolvedValue([mockReservation]);
      const result = await service.findAll();
      expect(result).toEqual([mockReservation]);
    });
  });

  describe("findOne", () => {
    it("should return a reservation by id", async () => {
      mockReservationRepository.findById.mockResolvedValue(mockReservation);
      const result = await service.findOne("1");
      expect(result).toEqual(mockReservation);
    });

    it("should throw NotFoundException when reservation not found", async () => {
      mockReservationRepository.findById.mockResolvedValue(null);
      await expect(service.findOne("unknown")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("findByUser", () => {
    it("should return reservations by user id", async () => {
      mockReservationRepository.findByUserId.mockResolvedValue([
        mockReservation,
      ]);
      const result = await service.findByUser("user1");
      expect(result).toEqual([mockReservation]);
      expect(mockReservationRepository.findByUserId).toHaveBeenCalledWith(
        "user1",
      );
    });
  });

  describe("findByRestaurant", () => {
    it("should return reservations by restaurant id", async () => {
      mockReservationRepository.findByRestaurantId.mockResolvedValue([
        mockReservation,
      ]);
      const result = await service.findByRestaurant("restaurant1");
      expect(result).toEqual([mockReservation]);
    });
  });

  describe("create", () => {
    it("should create a reservation", async () => {
      mockReservationRepository.create.mockResolvedValue(mockReservation);
      const dto: CreateReservationDto = {
        restaurantId: "restaurant1",
        userId: "user1",
        partySize: 2,
        reservationDate: new Date().toISOString(),
      };
      const result = await service.create(dto);
      expect(result).toEqual(mockReservation);
    });
  });

  describe("update", () => {
    it("should update a reservation", async () => {
      const updated = {
        ...mockReservation,
        status: ReservationStatus.CONFIRMED,
      };
      mockReservationRepository.update.mockResolvedValue(updated);
      const dto: UpdateReservationDto = { status: ReservationStatus.CONFIRMED };
      const result = await service.update("1", dto);
      expect(result).toEqual(updated);
    });

    it("should throw NotFoundException when reservation not found", async () => {
      mockReservationRepository.update.mockResolvedValue(null);
      await expect(service.update("unknown", {})).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("remove", () => {
    it("should remove a reservation", async () => {
      mockReservationRepository.delete.mockResolvedValue(true);
      await expect(service.remove("1")).resolves.not.toThrow();
    });

    it("should throw NotFoundException when reservation not found", async () => {
      mockReservationRepository.delete.mockResolvedValue(false);
      await expect(service.remove("unknown")).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
