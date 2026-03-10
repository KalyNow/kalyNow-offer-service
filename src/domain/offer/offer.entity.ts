export class Offer {
  id: string;
  restaurantId: string;
  title: string;
  description: string;
  price: number;
  discountedPrice: number;
  availableFrom: Date;
  availableTo: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
