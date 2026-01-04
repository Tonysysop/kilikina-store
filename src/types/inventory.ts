import type { Variant } from './variant';

export interface InventoryItem {
  id: string;
  name: string;
  price: number;
  quantity: number; // Total quantity (sum of variants or single quantity)
  image: string; // Legacy base64 or Cloudinary URL
  imageUrl?: string; // Cloudinary URL (new)
  cloudinaryPublicId?: string; // For image management
  totalSold: number; // Total sold (sum of variants or single sold count)
  createdAt: number;
  updatedAt?: number;
  category?: string;

  // Variant support (optional)
  variants?: Variant[]; // If present, use variants for stock tracking
  hasVariants?: boolean; // Flag to indicate if item uses variants
}

export interface SaleRecord {
  id: string;
  itemId: string;
  itemName: string;
  quantity: number;
  pricePerItem: number;
  totalAmount: number;
  date: number;
  variantId?: string; // Optional: which variant was sold
  variantName?: string; // Optional: variant name for reference
}
