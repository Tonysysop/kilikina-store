import type { Variant } from '@/types/variant';

/**
 * Helper functions for working with product variants
 */

/**
 * Calculate total quantity across all variants
 */
export function getTotalQuantity(variants?: Variant[]): number {
    if (!variants || variants.length === 0) return 0;
    return variants.reduce((sum, variant) => sum + variant.quantity, 0);
}

/**
 * Calculate total sold across all variants
 */
export function getTotalSold(variants?: Variant[]): number {
    if (!variants || variants.length === 0) return 0;
    return variants.reduce((sum, variant) => sum + variant.sold, 0);
}

/**
 * Check if any variant is low on stock (<=5)
 */
export function hasLowStockVariant(variants?: Variant[]): boolean {
    if (!variants || variants.length === 0) return false;
    return variants.some(v => v.quantity > 0 && v.quantity <= 5);
}

/**
 * Check if any variant is out of stock
 */
export function hasOutOfStockVariant(variants?: Variant[]): boolean {
    if (!variants || variants.length === 0) return false;
    return variants.some(v => v.quantity === 0);
}

/**
 * Get low stock variants
 */
export function getLowStockVariants(variants?: Variant[]): Variant[] {
    if (!variants || variants.length === 0) return [];
    return variants.filter(v => v.quantity > 0 && v.quantity <= 5);
}

/**
 * Get out of stock variants
 */
export function getOutOfStockVariants(variants?: Variant[]): Variant[] {
    if (!variants || variants.length === 0) return [];
    return variants.filter(v => v.quantity === 0);
}

/**
 * Generate a unique variant ID
 */
export function generateVariantId(): string {
    return `var_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
