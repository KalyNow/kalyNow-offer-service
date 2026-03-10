import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException } from "@nestjs/common";
import { OfferService } from "./offer.service";
import { OfferRepository } from "../../domain/offer/offer.repository";
import { Offer } from "../../domain/offer/offer.entity";
import { CreateOfferDto } from "./dto/create-offer.dto";
import { UpdateOfferDto } from "./dto/update-offer.dto";

const mockOffer: Offer = {
  id: "1",
  restaurantId: "restaurant1",
  title: "Test Offer",
  description: "A test offer",
  price: 20,
  discountedPrice: 15,
  availableFrom: new Date(),
  availableTo: new Date(),
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockOfferRepository = {
  findAll: jest.fn(),
  findById: jest.fn(),
  findByRestaurantId: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe("OfferService", () => {
  let service: OfferService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OfferService,
        { provide: OfferRepository, useValue: mockOfferRepository },
      ],
    }).compile();

    service = module.get<OfferService>(OfferService);
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("findAll", () => {
    it("should return an array of offers", async () => {
      mockOfferRepository.findAll.mockResolvedValue([mockOffer]);
      const result = await service.findAll();
      expect(result).toEqual([mockOffer]);
    });
  });

  describe("findOne", () => {
    it("should return an offer by id", async () => {
      mockOfferRepository.findById.mockResolvedValue(mockOffer);
      const result = await service.findOne("1");
      expect(result).toEqual(mockOffer);
    });

    it("should throw NotFoundException when offer not found", async () => {
      mockOfferRepository.findById.mockResolvedValue(null);
      await expect(service.findOne("unknown")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("findByRestaurant", () => {
    it("should return offers by restaurant id", async () => {
      mockOfferRepository.findByRestaurantId.mockResolvedValue([mockOffer]);
      const result = await service.findByRestaurant("restaurant1");
      expect(result).toEqual([mockOffer]);
      expect(mockOfferRepository.findByRestaurantId).toHaveBeenCalledWith(
        "restaurant1",
      );
    });
  });

  describe("create", () => {
    it("should create an offer", async () => {
      mockOfferRepository.create.mockResolvedValue(mockOffer);
      const dto: CreateOfferDto = {
        restaurantId: "restaurant1",
        title: "Test Offer",
        price: 20,
      };
      const result = await service.create(dto);
      expect(result).toEqual(mockOffer);
    });
  });

  describe("update", () => {
    it("should update an offer", async () => {
      const updated = { ...mockOffer, title: "Updated" };
      mockOfferRepository.update.mockResolvedValue(updated);
      const dto: UpdateOfferDto = { title: "Updated" };
      const result = await service.update("1", dto);
      expect(result).toEqual(updated);
    });

    it("should throw NotFoundException when offer not found", async () => {
      mockOfferRepository.update.mockResolvedValue(null);
      await expect(service.update("unknown", {})).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("remove", () => {
    it("should remove an offer", async () => {
      mockOfferRepository.delete.mockResolvedValue(true);
      await expect(service.remove("1")).resolves.not.toThrow();
    });

    it("should throw NotFoundException when offer not found", async () => {
      mockOfferRepository.delete.mockResolvedValue(false);
      await expect(service.remove("unknown")).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
