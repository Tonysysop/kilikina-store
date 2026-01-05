/**
 * Firestore Service Layer
 * Handles all Firestore database operations for inventory and sales
 */

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  orderBy,
  onSnapshot,
  Timestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/firebase';
import type { InventoryItem, SaleRecord } from '@/types/inventory';

// Collection names
const INVENTORY_COLLECTION = 'inventory';
const SALES_COLLECTION = 'sales';

/**
 * Firestore document type (includes Firestore-specific fields)
 */
interface FirestoreInventoryItem extends Omit<InventoryItem, 'createdAt' | 'updatedAt' | 'id'> {
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

interface FirestoreSaleRecord extends Omit<SaleRecord, 'date' | 'id'> {
  date: Timestamp;
}

// ============================================================================
// INVENTORY OPERATIONS
// ============================================================================

/**
 * Add a new inventory item to Firestore
 */
/**
 * Recursively remove undefined values from an object
 * Firestore doesn't accept undefined values
 */
function removeUndefined(obj: any): any {
  if (obj === null || obj === undefined) {
    return null;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => removeUndefined(item));
  }

  if (typeof obj === 'object' && !(obj instanceof Timestamp)) {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleaned[key] = removeUndefined(value);
      }
    }
    return cleaned;
  }

  return obj;
}

/**
 * Add a new inventory item to Firestore
 */
export async function addInventoryItem(
  item: Omit<InventoryItem, 'id' | 'totalSold' | 'createdAt'>
): Promise<string> {
  try {
    const itemData = {
      ...item,
      totalSold: 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    // Remove all undefined values recursively
    const cleanedData = removeUndefined(itemData);

    const docRef = await addDoc(collection(db, INVENTORY_COLLECTION), cleanedData);
    return docRef.id;
  } catch (error) {
    console.error('Error adding inventory item:', error);
    throw new Error('Failed to add inventory item');
  }
}

/**
 * Update an existing inventory item
 */
export async function updateInventoryItem(
  id: string,
  updates: Partial<Omit<InventoryItem, 'id' | 'createdAt'>>
): Promise<void> {
  try {
    const updateData = {
      ...updates,
      updatedAt: Timestamp.now(),
    };

    // Remove all undefined values recursively
    const cleanedData = removeUndefined(updateData);

    const docRef = doc(db, INVENTORY_COLLECTION, id);
    await updateDoc(docRef, cleanedData);
  } catch (error) {
    console.error('Error updating inventory item:', error);
    throw new Error('Failed to update inventory item');
  }
}

/**
 * Delete an inventory item
 */
export async function deleteInventoryItem(id: string): Promise<void> {
  try {
    const docRef = doc(db, INVENTORY_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    throw new Error('Failed to delete inventory item');
  }
}

/**
 * Get all inventory items (one-time fetch)
 */
export async function getInventoryItems(): Promise<InventoryItem[]> {
  try {
    const q = query(
      collection(db, INVENTORY_COLLECTION),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => {
      const data = doc.data() as FirestoreInventoryItem;
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt.toMillis(),
        updatedAt: data.updatedAt?.toMillis(),
      };
    });
  } catch (error) {
    console.error('Error getting inventory items:', error);
    throw new Error('Failed to fetch inventory items');
  }
}

/**
 * Subscribe to real-time inventory updates
 */
export function subscribeToInventory(
  callback: (items: InventoryItem[]) => void
): Unsubscribe {
  const q = query(
    collection(db, INVENTORY_COLLECTION),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const items = snapshot.docs.map(doc => {
        const data = doc.data() as FirestoreInventoryItem;
        return {
          ...data,
          id: doc.id,
          createdAt: data.createdAt.toMillis(),
          updatedAt: data.updatedAt?.toMillis(),
        };
      });
      console.log('📡 Firestore: Inventory update received', {
        itemCount: items.length,
        items: items.map(i => ({ id: i.id, name: i.name, variants: i.variants }))
      });
      callback(items);
    },
    (error) => {
      console.error('Error in inventory subscription:', error);
    }
  );
}

// ============================================================================
// SALES OPERATIONS
// ============================================================================

/**
 * Record a new sale
 */
export async function addSaleRecord(
  sale: Omit<SaleRecord, 'id' | 'date'>
): Promise<string> {
  try {
    const saleData: Omit<FirestoreSaleRecord, 'id'> = {
      ...sale,
      date: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, SALES_COLLECTION), saleData);
    return docRef.id;
  } catch (error) {
    console.error('Error adding sale record:', error);
    throw new Error('Failed to record sale');
  }
}

/**
 * Get all sales records (one-time fetch)
 */
export async function getSalesRecords(): Promise<SaleRecord[]> {
  try {
    const q = query(
      collection(db, SALES_COLLECTION),
      orderBy('date', 'desc')
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => {
      const data = doc.data() as FirestoreSaleRecord;
      return {
        ...data,
        id: doc.id,
        date: data.date.toMillis(),
      };
    });
  } catch (error) {
    console.error('Error getting sales records:', error);
    throw new Error('Failed to fetch sales records');
  }
}

/**
 * Subscribe to real-time sales updates
 */
export function subscribeToSales(
  callback: (sales: SaleRecord[]) => void
): Unsubscribe {
  const q = query(
    collection(db, SALES_COLLECTION),
    orderBy('date', 'desc')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const sales = snapshot.docs.map(doc => {
        const data = doc.data() as FirestoreSaleRecord;
        return {
          ...data,
          id: doc.id,
          date: data.date.toMillis(),
        };
      });
      callback(sales);
    },
    (error) => {
      console.error('Error in sales subscription:', error);
    }
  );
}

// ============================================================================
// TRANSACTION OPERATIONS
// ============================================================================

/**
 * Process a sale (update inventory and create sale record)
 * Supports both regular items and variant-based items
 */
export async function processSale(
  itemId: string,
  quantitySold: number,
  itemName: string,
  pricePerItem: number,
  variantId?: string,
  variantName?: string
): Promise<void> {
  try {
    // Get current item
    const itemRef = doc(db, INVENTORY_COLLECTION, itemId);
    const itemDoc = await getDoc(itemRef);

    if (!itemDoc.exists()) {
      throw new Error('Item not found');
    }

    const itemData = itemDoc.data() as FirestoreInventoryItem;
    const currentTotalSold = itemData.totalSold || 0;

    // Handle variant-based sales
    if (variantId && itemData.hasVariants && itemData.variants) {
      const variants = [...itemData.variants];
      const variantIndex = variants.findIndex(v => v.id === variantId);

      if (variantIndex === -1) {
        throw new Error('Variant not found');
      }

      const variant = variants[variantIndex];

      console.log('🛒 processSale: Before update', {
        variantId,
        variantName: variant.name,
        currentQuantity: variant.quantity,
        quantitySold,
        newQuantity: variant.quantity - quantitySold
      });

      if (quantitySold > variant.quantity) {
        throw new Error('Insufficient quantity for variant');
      }

      // Update the specific variant
      variants[variantIndex] = {
        ...variant,
        quantity: variant.quantity - quantitySold,
        sold: (variant.sold || 0) + quantitySold,
      };

      // Calculate new total quantity
      const newTotalQuantity = variants.reduce((sum, v) => sum + v.quantity, 0);

      console.log('💾 processSale: Updating Firestore', {
        updatedVariant: variants[variantIndex],
        newTotalQuantity,
        allVariants: variants
      });

      // Update inventory with new variant data
      await updateDoc(itemRef, {
        variants,
        quantity: newTotalQuantity,
        totalSold: currentTotalSold + quantitySold,
        updatedAt: Timestamp.now(),
      });

      console.log('✅ processSale: Firestore updated successfully');

      // Create sale record with variant info
      await addSaleRecord({
        itemId,
        itemName,
        quantity: quantitySold,
        pricePerItem,
        totalAmount: quantitySold * pricePerItem,
        variantId,
        variantName,
      });

      return;
    }

    // Handle regular (non-variant) sales
    const currentQuantity = itemData.quantity;

    if (quantitySold > currentQuantity) {
      throw new Error('Insufficient quantity');
    }

    // Update inventory
    await updateDoc(itemRef, {
      quantity: currentQuantity - quantitySold,
      totalSold: currentTotalSold + quantitySold,
      updatedAt: Timestamp.now(),
    });

    // Create sale record
    await addSaleRecord({
      itemId,
      itemName,
      quantity: quantitySold,
      pricePerItem,
      totalAmount: quantitySold * pricePerItem,
    });
  } catch (error) {
    console.error('Error processing sale:', error);
    throw error;
  }
}
// ============================================================================
// TRANSACTION OPERATIONS
// ============================================================================

/**
 * Revert a sale (Undo)
 * - Restores inventory quantity
 * - Decrements totalSold count
 * - Deletes the sale record
 */
export async function revertSale(
  saleId: string,
  itemId: string,
  quantityToRevert: number,
  variantId?: string
): Promise<void> {
  try {
    const itemRef = doc(db, INVENTORY_COLLECTION, itemId);
    const itemDoc = await getDoc(itemRef);

    if (!itemDoc.exists()) {
      throw new Error('Item not found');
    }

    const itemData = itemDoc.data() as FirestoreInventoryItem;
    const currentTotalSold = itemData.totalSold || 0;

    // Handle variant-based revert
    if (variantId && itemData.hasVariants && itemData.variants) {
      const variants = [...itemData.variants];
      const variantIndex = variants.findIndex(v => v.id === variantId);

      if (variantIndex === -1) {
        throw new Error('Variant not found');
      }

      const variant = variants[variantIndex];

      // Update the specific variant
      variants[variantIndex] = {
        ...variant,
        quantity: (variant.quantity || 0) + quantityToRevert,
        sold: Math.max(0, (variant.sold || 0) - quantityToRevert),
      };

      // Calculate new total quantity
      const newTotalQuantity = variants.reduce((sum, v) => sum + v.quantity, 0);

      // Update inventory
      await updateDoc(itemRef, {
        variants,
        quantity: newTotalQuantity,
        totalSold: Math.max(0, currentTotalSold - quantityToRevert),
        updatedAt: Timestamp.now(),
      });
    } else {
      // Handle regular item revert
      const currentQuantity = itemData.quantity;

      await updateDoc(itemRef, {
        quantity: currentQuantity + quantityToRevert,
        totalSold: Math.max(0, currentTotalSold - quantityToRevert),
        updatedAt: Timestamp.now(),
      });
    }

    // Delete the sale record
    await deleteDoc(doc(db, SALES_COLLECTION, saleId));
    
    console.log('↩️ Sale reverted successfully', { saleId, itemId, quantityToRevert });
  } catch (error) {
    console.error('Error reverting sale:', error);
    throw new Error('Failed to revert sale');
  }
}

// ============================================================================
// CATEGORY OPERATIONS
// ============================================================================

const CATEGORIES_COLLECTION = 'categories';

export interface Category {
  id: string;
  name: string;
  createdAt: number;
}

interface FirestoreCategory extends Omit<Category, 'createdAt' | 'id'> {
  createdAt: Timestamp;
}

/**
 * Subscribe to real-time category updates
 */
export function subscribeToCategories(
  callback: (categories: Category[]) => void
): Unsubscribe {
  const q = query(
    collection(db, CATEGORIES_COLLECTION),
    orderBy('name', 'asc')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const categories = snapshot.docs.map(doc => {
        const data = doc.data() as FirestoreCategory;
        return {
          ...data,
          id: doc.id,
          createdAt: data.createdAt.toMillis(),
        };
      });
      callback(categories);
    },
    (error) => {
      console.error('Error in categories subscription:', error);
    }
  );
}

/**
 * Add a new category
 */
export async function addCategory(name: string): Promise<string> {
  try {
    const categoryData = {
      name,
      createdAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, CATEGORIES_COLLECTION), categoryData);
    return docRef.id;
  } catch (error) {
    console.error('Error adding category:', error);
    throw new Error('Failed to add category');
  }
}

/**
 * Delete a category
 */
export async function deleteCategory(id: string): Promise<void> {
  try {
    const docRef = doc(db, CATEGORIES_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting category:', error);
    throw new Error('Failed to delete category');
  }
}
