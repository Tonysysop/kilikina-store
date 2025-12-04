import type { InventoryItem } from '@/types/inventory';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2, ShoppingCart, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InventoryCardProps {
  item: InventoryItem;
  onEdit: (item: InventoryItem) => void;
  onDelete: (id: string) => void;
  onSell: (item: InventoryItem) => void;
}

export function InventoryCard({ item, onEdit, onDelete, onSell }: InventoryCardProps) {
  const stockValue = item.price * item.quantity;
  const isLowStock = item.quantity <= 5 && item.quantity > 0;
  const isOutOfStock = item.quantity === 0;

  return (
    <div className="group bg-card rounded-lg overflow-hidden card-shadow transition-all duration-300 hover:card-shadow-hover animate-slide-up">
      {/* Image - Reduced height ratio */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="h-12 w-12 text-muted-foreground/30" />
          </div>
        )}
        
        {/* Stock badge - Smaller */}
        <div className={cn(
          'absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wide',
          isOutOfStock && 'bg-destructive text-destructive-foreground',
          isLowStock && 'bg-accent text-accent-foreground',
          !isOutOfStock && !isLowStock && 'bg-success/90 text-success-foreground'
        )}>
          {isOutOfStock ? 'Out' : isLowStock ? 'Low' : `${item.quantity} left`}
        </div>
      </div>

      {/* Content - Compact padding and typography */}
      <div className="p-3 space-y-2">
        <div>
          <h3 className="font-display font-semibold text-base truncate leading-tight">{item.name}</h3>
          <p className="text-primary font-bold text-lg">
            ${item.price.toFixed(2)}
          </p>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Value:</span>
          <span className="font-medium text-foreground">${stockValue.toFixed(2)}</span>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Sold:</span>
          <span className="font-medium text-foreground">{item.totalSold}</span>
        </div>

        {/* Actions - Compact buttons */}
        <div className="flex gap-1.5 pt-1">
          <Button
            variant="default"
            size="sm"
            className="flex-1 h-8 text-xs"
            onClick={() => onSell(item)}
            disabled={isOutOfStock}
          >
            <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
            Sell
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => onEdit(item)}
          >
            <Edit2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(item.id)}
            className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
