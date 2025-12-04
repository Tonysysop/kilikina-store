import { useState } from 'react';
import type { InventoryItem } from '@/types/inventory';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2, ShoppingCart, Package, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InventoryListItemProps {
  item: InventoryItem;
  onEdit: (item: InventoryItem) => void;
  onDelete: (id: string) => void;
  onSell: (item: InventoryItem) => void;
}

export function InventoryListItem({ item, onEdit, onDelete, onSell }: InventoryListItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const stockValue = item.price * item.quantity;
  const isLowStock = item.quantity <= 5 && item.quantity > 0;
  const isOutOfStock = item.quantity === 0;

  return (
    <div className="bg-card rounded-lg overflow-hidden card-shadow">
      {/* Main row - always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-3 flex items-center gap-3 text-left hover:bg-muted/50 transition-colors"
      >
        {/* Image */}
        <div className="relative w-14 h-14 rounded-md overflow-hidden bg-muted flex-shrink-0">
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="h-6 w-6 text-muted-foreground/30" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm truncate">{item.name}</h3>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-primary font-semibold text-sm">
              ${item.price.toFixed(2)}
            </span>
            <span className="text-xs text-muted-foreground">•</span>
            <span className={cn(
              'text-xs font-medium',
              isOutOfStock && 'text-destructive',
              isLowStock && 'text-accent-foreground',
              !isOutOfStock && !isLowStock && 'text-success'
            )}>
              {isOutOfStock ? 'Out of stock' : `${item.quantity} in stock`}
            </span>
          </div>
        </div>

        {/* Expand indicator */}
        <ChevronDown 
          className={cn(
            'h-5 w-5 text-muted-foreground transition-transform flex-shrink-0',
            isExpanded && 'rotate-180'
          )} 
        />
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="px-3 pb-3 space-y-3 border-t">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-2 pt-3 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Stock value:</span>
              <span className="font-medium">${stockValue.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total sold:</span>
              <span className="font-medium">{item.totalSold} units</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="default"
              size="sm"
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation();
                onSell(item);
              }}
              disabled={isOutOfStock}
            >
              <ShoppingCart className="h-4 w-4 mr-1.5" />
              Sell
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(item);
              }}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(item.id);
              }}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
