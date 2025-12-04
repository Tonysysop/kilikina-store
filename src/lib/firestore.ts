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
export async function addInventoryItem(
  item: Omit<InventoryItem, 'id' | 'totalSold' | 'createdAt'>
): Promise<string> {
  try {
    const itemData: Omit<FirestoreInventoryItem, 'id'> = {
      ...item,
      totalSold: 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, INVENTORY_COLLECTION), itemData);
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
    const docRef = doc(db, INVENTORY_COLLECTION, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
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
 * This should be done atomically, but for simplicity we'll do it sequentially
 */
export async function processSale(
  itemId: string,
  quantitySold: number,
  itemName: string,
  pricePerItem: number
): Promise<void> {
  try {
    // Get current item
    const itemRef = doc(db, INVENTORY_COLLECTION, itemId);
    const itemDoc = await getDoc(itemRef);
    
    if (!itemDoc.exists()) {
      throw new Error('Item not found');
    }

    const itemData = itemDoc.data() as FirestoreInventoryItem;
    const currentQuantity = itemData.quantity;
    const currentTotalSold = itemData.totalSold || 0;

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
