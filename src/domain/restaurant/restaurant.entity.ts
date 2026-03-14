export class Restaurant {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  logoUrl: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
