import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import type { InventoryItem, SaleRecord } from '@/types/inventory';
import {
  subscribeToInventory,
  subscribeToSales,
  addInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  processSale,
} from '@/lib/firestore';

export function useInventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Subscribe to real-time Firestore updates
  useEffect(() => {
    setIsLoading(true);

    // Subscribe to inventory
    const unsubscribeInventory = subscribeToInventory((updatedItems) => {
      setItems(updatedItems);
      setIsLoading(false);
    });

    // Subscribe to sales
    const unsubscribeSales = subscribeToSales((updatedSales) => {
      setSales(updatedSales);
    });

    // Cleanup subscriptions on unmount
    return () => {
      unsubscribeInventory();
      unsubscribeSales();
    };
  }, []);

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

  const sellItem = useCallback(async (id: string, quantitySold: number, variantId?: string) => {
    const item = items.find(i => i.id === id);
    if (!item) {
      toast({
        title: 'Error',
        description: 'Item not found',
        variant: 'destructive',
      });
      return false;
    }

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

      if (quantitySold > variant.quantity) {
        toast({
          title: 'Error',
          description: `Insufficient quantity available for ${variant.name}`,
          variant: 'destructive',
        });
        return false;
      }

      try {
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
          description: 'Failed to process sale. Please try again.',
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
        description: 'Failed to process sale. Please try again.',
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

  return {
    items,
    sales,
    stats,
    isLoading,
    addItem,
    updateItem,
    deleteItem,
    sellItem,
  };
}
