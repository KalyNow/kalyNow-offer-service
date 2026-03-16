export enum OfferStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  INACTIVE = 'INACTIVE',
}

export class Offer {
  id: string;
  restaurantId: string;
  title: string;
  description: string;
  price: number;
  discountedPrice: number;
  availableFrom: Date;
  availableTo: Date;
  imageUrls: string[];
  isActive: boolean;
  quantity: number | null;
  createdAt: Date;
  updatedAt: Date;

  get status(): OfferStatus {
    if (!this.isActive) return OfferStatus.INACTIVE;
    if (this.availableTo && this.availableTo < new Date()) return OfferStatus.EXPIRED;
    return OfferStatus.ACTIVE;
  }
}
