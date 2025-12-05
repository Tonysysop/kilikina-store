import type { InventoryItem } from '@/types/inventory';
import { Package, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LowStockListProps {
  items: InventoryItem[];
  onSell: (item: InventoryItem) => void;
}

export function LowStockList({ items }: LowStockListProps) {
  // Get low stock items and their variants
  const lowStockEntries: Array<{
    item: InventoryItem;
    variantId?: string;
    variantName?: string;
    quantity: number;
  }> = [];

  items.forEach(item => {
    if (item.hasVariants && item.variants) {
      // Check each variant for low stock
      item.variants.forEach(variant => {
        if (variant.quantity <= 5) {
          lowStockEntries.push({
            item,
            variantId: variant.id,
            variantName: variant.name,
            quantity: variant.quantity
          });
        }
      });
    } else {
      // Check overall item quantity
      if (item.quantity <= 5) {
        lowStockEntries.push({
          item,
          quantity: item.quantity
        });
      }
    }
  });

  // Sort by quantity (lowest first)
  lowStockEntries.sort((a, b) => a.quantity - b.quantity);

  if (lowStockEntries.length === 0) {
    return (
      <div className="bg-card rounded-xl p-6 card-shadow border border-border/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-xl bg-gradient-success">
            <Package className="h-5 w-5 text-white" />
          </div>
          <h3 className="font-display font-bold text-lg">Stock Status</h3>
        </div>
        <p className="text-muted-foreground">All items are well stocked! 🎉</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl p-6 card-shadow border border-border/50">
      <div className="flex items-center gap-3 mb-5">
        <div className="p-3 rounded-xl bg-gradient-to-br from-destructive to-destructive/80">
          <AlertTriangle className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="font-display font-bold text-lg">Low Stock Alert</h3>
          <p className="text-muted-foreground text-sm">
            {lowStockEntries.length} item{lowStockEntries.length > 1 ? 's' : ''} need restocking
          </p>
        </div>
      </div>

      <div className="space-y-3 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
        {lowStockEntries.map((entry, index) => (
          <div
            key={`${entry.item.id}-${entry.variantId || 'main'}-${index}`}
            className="group flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-muted/50 to-transparent hover:from-muted hover:to-muted/50 transition-all duration-300 hover:scale-[1.02] border border-transparent hover:border-border/50"
          >
            {entry.item.image ? (
              <img
                src={entry.item.image}
                alt={entry.item.name}
                className="w-12 h-12 rounded-lg object-cover ring-2 ring-border/50 group-hover:ring-primary/50 transition-all duration-300"
              />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                <Package className="h-6 w-6 text-muted-foreground" />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                {entry.item.name}
                {entry.variantName && (
                  <span className="ml-2 text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    {entry.variantName}
                  </span>
                )}
              </p>
              <p className="text-xs text-muted-foreground font-medium">
                ₦{entry.item.price.toFixed(2)}
              </p>
            </div>

            <div className={cn(
              'px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-md transition-all duration-300 group-hover:scale-110',
              entry.quantity === 0
                ? 'bg-gradient-to-r from-destructive to-destructive/80 text-white'
                : 'bg-gradient-to-r from-accent to-accent/80 text-white'
            )}>
              {entry.quantity === 0 ? 'Out' : `${entry.quantity} left`}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

