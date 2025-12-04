export interface InventoryItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string; // Legacy base64 or Cloudinary URL
  imageUrl?: string; // Cloudinary URL (new)
  cloudinaryPublicId?: string; // For image management
  totalSold: number;
  createdAt: number;
  updatedAt?: number;
}

export interface SaleRecord {
  id: string;
  itemId: string;
  itemName: string;
  quantity: number;
  pricePerItem: number;
  totalAmount: number;
  date: number;
}
