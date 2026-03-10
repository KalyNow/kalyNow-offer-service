import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException } from "@nestjs/common";
import { RestaurantService } from "./restaurant.service";
import { RestaurantRepository } from "../../domain/restaurant/restaurant.repository";
import { Restaurant } from "../../domain/restaurant/restaurant.entity";
import { CreateRestaurantDto } from "./dto/create-restaurant.dto";
import { UpdateRestaurantDto } from "./dto/update-restaurant.dto";

const mockRestaurant: Restaurant = {
  id: "1",
  name: "Test Restaurant",
  description: "A test restaurant",
  address: "123 Main St",
  phone: "555-1234",
  email: "test@restaurant.com",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockRestaurantRepository = {
  findAll: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe("RestaurantService", () => {
  let service: RestaurantService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RestaurantService,
        { provide: RestaurantRepository, useValue: mockRestaurantRepository },
      ],
    }).compile();

    service = module.get<RestaurantService>(RestaurantService);
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("findAll", () => {
    it("should return an array of restaurants", async () => {
      mockRestaurantRepository.findAll.mockResolvedValue([mockRestaurant]);
      const result = await service.findAll();
      expect(result).toEqual([mockRestaurant]);
      expect(mockRestaurantRepository.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe("findOne", () => {
    it("should return a restaurant by id", async () => {
      mockRestaurantRepository.findById.mockResolvedValue(mockRestaurant);
      const result = await service.findOne("1");
      expect(result).toEqual(mockRestaurant);
    });

    it("should throw NotFoundException when restaurant not found", async () => {
      mockRestaurantRepository.findById.mockResolvedValue(null);
      await expect(service.findOne("unknown")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("create", () => {
    it("should create a restaurant", async () => {
      mockRestaurantRepository.create.mockResolvedValue(mockRestaurant);
      const dto: CreateRestaurantDto = {
        name: "Test Restaurant",
        address: "123 Main St",
      };
      const result = await service.create(dto);
      expect(result).toEqual(mockRestaurant);
      expect(mockRestaurantRepository.create).toHaveBeenCalledWith(dto);
    });
  });

  describe("update", () => {
    it("should update a restaurant", async () => {
      const updated = { ...mockRestaurant, name: "Updated" };
      mockRestaurantRepository.update.mockResolvedValue(updated);
      const dto: UpdateRestaurantDto = { name: "Updated" };
      const result = await service.update("1", dto);
      expect(result).toEqual(updated);
    });

    it("should throw NotFoundException when restaurant not found", async () => {
      mockRestaurantRepository.update.mockResolvedValue(null);
      await expect(service.update("unknown", {})).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("remove", () => {
    it("should remove a restaurant", async () => {
      mockRestaurantRepository.delete.mockResolvedValue(true);
      await expect(service.remove("1")).resolves.not.toThrow();
    });

    it("should throw NotFoundException when restaurant not found", async () => {
      mockRestaurantRepository.delete.mockResolvedValue(false);
      await expect(service.remove("unknown")).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
