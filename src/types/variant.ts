export interface Variant {
    id: string;
    name: string;        // e.g., "Size 38", "Medium", "Red"
    sku?: string;        // Optional SKU for this variant
    quantity: number;    // Stock for this variant
    sold: number;        // Units sold for this variant
}
