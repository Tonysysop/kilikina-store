import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import type { InventoryItem, SaleRecord } from '@/types/inventory';
import {
  subscribeToInventory,
  subscribeToSales,
  subscribeToCategories,
  addInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  addCategory as firestoreAddCategory,
  deleteCategory as firestoreDeleteCategory,
  processSale,
  revertSale,
  type Category,
} from '@/lib/firestore';

export function useInventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Subscribe to real-time Firestore updates
  useEffect(() => {
    setIsLoading(true);

    const unsubscribeInventory = subscribeToInventory((updatedItems) => {
      setItems(updatedItems);
      // Only set loading to false if sales and categories are also loaded or if we decide inventory is enough
      // For now, let's keep simple loading state logic or refine it
    });

    const unsubscribeSales = subscribeToSales((updatedSales) => {
      setSales(updatedSales);
    });

    const unsubscribeCategories = subscribeToCategories((updatedCategories) => {
      setCategories(updatedCategories);
    });

    return () => {
      unsubscribeInventory();
      unsubscribeSales();
      unsubscribeCategories();
    };
  }, []);

  // Update loading state when items are loaded (simplification)
  useEffect(() => {
    if (items.length > 0 || categories.length >= 0) {
      setIsLoading(false);
    }
  }, [items, categories]);


  const addItem = useCallback(async (item: Omit<InventoryItem, 'id' | 'totalSold' | 'createdAt'>) => {
    try {
      await addInventoryItem(item);
      toast({
        title: 'Success',
        description: 'Item added successfully',
      });
    } catch (error) {
      console.error('Error adding item:', error);
      toast({
        title: 'Error',
        description: 'Failed to add item. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  }, []);

  const updateItem = useCallback(async (id: string, updates: Partial<Omit<InventoryItem, 'id' | 'createdAt'>>) => {
    try {
      await updateInventoryItem(id, updates);
      toast({
        title: 'Success',
        description: 'Item updated successfully',
      });
    } catch (error) {
      console.error('Error updating item:', error);
      toast({
        title: 'Error',
        description: 'Failed to update item. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  }, []);

  const deleteItem = useCallback(async (id: string) => {
    try {
      await deleteInventoryItem(id);
      toast({
        title: 'Success',
        description: 'Item deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting item:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete item. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  }, []);

  const addCategory = useCallback(async (name: string) => {
    try {
      await firestoreAddCategory(name);
      toast({
        title: 'Success',
        description: 'Category added successfully',
      });
    } catch (error) {
      console.error('Error adding category:', error);
      toast({
        title: 'Error',
        description: 'Failed to add category',
        variant: 'destructive',
      });
      throw error;
    }
  }, []);

  const deleteCategory = useCallback(async (id: string) => {
    try {
      await firestoreDeleteCategory(id);
      toast({
        title: 'Success',
        description: 'Category deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete category',
        variant: 'destructive',
      });
      throw error;
    }
  }, []);

  const sellItem = useCallback(async (id: string, quantitySold: number, variantId?: string) => {
    console.log('🔷 useInventory.sellItem called', { id, quantitySold, variantId });

    const item = items.find(i => i.id === id);
    if (!item) {
      toast({
        title: 'Error',
        description: 'Item not found',
        variant: 'destructive',
      });
      return false;
    }

    // ... (rest of sellItem logic remains same, just ensuring correct exposure at end)
    console.log('🔷 useInventory: Found item', {
      itemName: item.name,
      hasVariants: item.hasVariants,
      variants: item.variants
    });

    // Handle variant-based sales
    if (item.hasVariants && item.variants && variantId) {
      const variant = item.variants.find(v => v.id === variantId);
      if (!variant) {
        toast({
          title: 'Error',
          description: 'Variant not found',
          variant: 'destructive',
        });
        return false;
      }

      console.log('🔷 useInventory: Processing variant sale', {
        variantId,
        variantName: variant.name,
        variantQuantity: variant.quantity,
        quantitySold
      });

      if (quantitySold > variant.quantity) {
        toast({
          title: 'Error',
          description: 'Insufficient quantity available',
          variant: 'destructive',
        });
        return false;
      }

      try {
        console.log('🔷 useInventory: Calling processSale');
        await processSale(id, quantitySold, item.name, item.price, variantId, variant.name);
        toast({
          title: 'Success',
          description: `Sold ${quantitySold} ${item.name} (${variant.name})`,
        });
        return true;
      } catch (error) {
        console.error('Error processing sale:', error);
        toast({
          title: 'Error',
          description: 'Failed to process sale',
          variant: 'destructive',
        });
        return false;
      }
    }

    // Handle regular (non-variant) sales
    if (quantitySold > item.quantity) {
      toast({
        title: 'Error',
        description: 'Insufficient quantity available',
        variant: 'destructive',
      });
      return false;
    }

    try {
      await processSale(id, quantitySold, item.name, item.price);
      toast({
        title: 'Success',
        description: `Sold ${quantitySold} ${item.name}(s)`,
      });
      return true;
    } catch (error) {
      console.error('Error processing sale:', error);
      toast({
        title: 'Error',
        description: 'Failed to process sale',
        variant: 'destructive',
      });
      return false;
    }
  }, [items]);

  // Dashboard stats
  const stats = {
    totalItemsSold: items.reduce((sum, item) => sum + item.totalSold, 0),
    totalRevenue: sales.reduce((sum, sale) => sum + sale.totalAmount, 0),
    remainingStockValue: items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
    totalItems: items.length,
    lowStockItems: items.filter(item => item.quantity <= 5 && item.quantity > 0).length,
    outOfStockItems: items.filter(item => item.quantity === 0).length,
  };

  const revertSaleRecord = useCallback(async (sale: SaleRecord) => {
    try {
      await revertSale(sale.id, sale.itemId, sale.quantity, sale.variantId);
      toast({
        title: 'Success',
        description: 'Sale reverted successfully',
      });
      return true;
    } catch (error) {
      console.error('Error reverting sale:', error);
      toast({
        title: 'Error',
        description: 'Failed to revert sale',
        variant: 'destructive',
      });
      return false;
    }
  }, []);

  return {
    items,
    sales,
    categories,
    stats,
    isLoading,
    addItem,
    updateItem,
    deleteItem,
    sellItem,
    revertSale: revertSaleRecord,
    addCategory,
    deleteCategory,
  };
}
