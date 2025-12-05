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
    <div className="group bg-card rounded-xl overflow-hidden card-shadow transition-all duration-300 hover:card-shadow-hover border border-border/50">
      {/* Main row - always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center gap-4 text-left hover:bg-gradient-to-r hover:from-primary/5 hover:to-transparent transition-all duration-300"
      >
        {/* Image */}
        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-muted to-muted/50 flex-shrink-0">
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5">
              <Package className="h-8 w-8 text-muted-foreground/30" />
            </div>
          )}

          {/* Stock badge */}
          <div className={cn(
            'absolute bottom-1 right-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase backdrop-blur-md',
            isOutOfStock && 'bg-destructive/90 text-white',
            isLowStock && 'bg-accent/90 text-white',
            !isOutOfStock && !isLowStock && 'bg-success/90 text-white'
          )}>
            {item.quantity}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-bold text-base truncate group-hover:text-primary transition-colors">
            {item.name}
          </h3>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-primary font-bold text-lg bg-gradient-primary bg-clip-text text-transparent">
              ₦{item.price.toFixed(2)}
            </span>
            <span className="text-xs text-muted-foreground">•</span>
            <span className={cn(
              'text-xs font-bold uppercase tracking-wider',
              isOutOfStock && 'text-destructive',
              isLowStock && 'text-accent',
              !isOutOfStock && !isLowStock && 'text-success'
            )}>
              {isOutOfStock ? 'Out of stock' : `${item.quantity} in stock`}
            </span>
          </div>
        </div>

        {/* Expand indicator */}
        <ChevronDown
          className={cn(
            'h-5 w-5 text-muted-foreground transition-all duration-300 flex-shrink-0 group-hover:text-primary',
            isExpanded && 'rotate-180'
          )}
        />
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-border/50 bg-gradient-to-b from-muted/20 to-transparent animate-fade-in">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 pt-4">
            <div className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
              <span className="text-xs text-muted-foreground font-medium block mb-1">Stock Value</span>
              <span className="font-bold text-sm">₦{stockValue.toFixed(2)}</span>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
              <span className="text-xs text-muted-foreground font-medium block mb-1">Total Sold</span>
              <span className="font-bold text-sm">{item.totalSold} units</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="default"
              size="sm"
              className="flex-1 bg-gradient-primary hover:opacity-90 transition-all duration-300 hover:scale-105 font-semibold"
              onClick={(e) => {
                e.stopPropagation();
                onSell(item);
              }}
              disabled={isOutOfStock}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Sell
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="hover:bg-primary/10 hover:text-primary hover:border-primary transition-all duration-300"
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
              className="text-destructive hover:bg-destructive/10 hover:border-destructive transition-all duration-300"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
