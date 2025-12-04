import type { InventoryItem } from '@/types/inventory';
import { Package, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LowStockListProps {
  items: InventoryItem[];
  onSell: (item: InventoryItem) => void;
}

export function LowStockList({ items }: LowStockListProps) {
  const lowStockItems = items.filter(item => item.quantity <= 5).sort((a, b) => a.quantity - b.quantity);

  if (lowStockItems.length === 0) {
    return (
      <div className="bg-card rounded-lg p-6 card-shadow">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-success/10">
            <Package className="h-5 w-5 text-success" />
          </div>
          <h3 className="font-display font-semibold">Stock Status</h3>
        </div>
        <p className="text-muted-foreground text-sm">All items are well stocked!</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg p-6 card-shadow">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-destructive/10">
          <AlertTriangle className="h-5 w-5 text-destructive" />
        </div>
        <div>
          <h3 className="font-display font-semibold">Low Stock Alert</h3>
          <p className="text-muted-foreground text-xs">{lowStockItems.length} item{lowStockItems.length > 1 ? 's' : ''} need restocking</p>
        </div>
      </div>
      
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {lowStockItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
          >
            {item.image ? (
              <img
                src={item.image}
                alt={item.name}
                className="w-10 h-10 rounded-md object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-md bg-secondary flex items-center justify-center">
                <Package className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{item.name}</p>
              <p className="text-xs text-muted-foreground">${item.price.toFixed(2)}</p>
            </div>
            <div className={cn(
              'px-2.5 py-1 rounded-full text-xs font-semibold',
              item.quantity === 0 
                ? 'bg-destructive text-destructive-foreground' 
                : 'bg-accent text-accent-foreground'
            )}>
              {item.quantity === 0 ? 'Out' : `${item.quantity} left`}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
