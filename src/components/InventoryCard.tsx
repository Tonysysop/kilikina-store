import { useState } from 'react';
import type { InventoryItem } from '@/types/inventory';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2, ShoppingCart, Package, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VariantList } from '@/components/VariantList';

interface InventoryCardProps {
  item: InventoryItem;
  onEdit: (item: InventoryItem) => void;
  onDelete: (id: string) => void;
  onSell: (item: InventoryItem) => void;
}

export function InventoryCard({ item, onEdit, onDelete, onSell }: InventoryCardProps) {
  const [showVariants, setShowVariants] = useState(false);

  const hasVariants = item.hasVariants && item.variants && item.variants.length > 0;
  const stockValue = item.price * item.quantity;
  const isLowStock = item.quantity <= 5 && item.quantity > 0;
  const isOutOfStock = item.quantity === 0;

  return (
    <div className="group bg-card rounded-lg overflow-hidden card-shadow transition-all duration-500 hover:card-shadow-hover hover:scale-[1.02] animate-slide-up">
      {/* Image with gradient overlay */}
      <div className="relative aspect-[5/4] overflow-hidden bg-gradient-to-br from-muted to-muted/50">
        {item.image ? (
          <>
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110"
            />
            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5">
            <Package className="h-12 w-12 text-muted-foreground/20" />
          </div>
        )}

        {/* Variant count badge (top left) */}
        {hasVariants && (
          <div className="absolute top-2 left-2 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md bg-primary/90 text-primary-foreground shadow-lg">
            {item.variants!.length} Variants
          </div>
        )}

        {/* Glassmorphic stock badge (top right) */}
        <div className={cn(
          'absolute top-2 right-2 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md transition-all duration-300 group-hover:scale-110',
          isOutOfStock && 'bg-destructive/90 text-destructive-foreground shadow-lg',
          isLowStock && 'bg-accent/90 text-accent-foreground shadow-lg',
          !isOutOfStock && !isLowStock && 'bg-success/90 text-success-foreground shadow-lg'
        )}>
          {isOutOfStock ? 'Out' : isLowStock ? 'Low' : `${item.quantity}`}
        </div>
      </div>

      {/* Content */}
      <div className="p-3 space-y-2">
        <div>
          <h3 className="font-display font-bold text-base truncate leading-tight group-hover:text-primary transition-colors duration-300">
            {item.name}
          </h3>
          <p className="text-primary font-bold text-xl mt-0.5 bg-gradient-primary bg-clip-text text-transparent">
            ₦{item.price.toFixed(2)}
          </p>
        </div>

        {/* Variants expandable section */}
        {hasVariants && (
          <div className="space-y-1.5">
            <button
              onClick={() => setShowVariants(!showVariants)}
              className="w-full flex items-center justify-between p-1.5 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-xs font-medium"
            >
              <span className="text-muted-foreground">Variants</span>
              <ChevronDown className={cn(
                "h-3.5 w-3.5 transition-transform",
                showVariants && "rotate-180"
              )} />
            </button>
            {showVariants && (
              <div className="animate-fade-in">
                <VariantList variants={item.variants!} compact />
              </div>
            )}
          </div>
        )}

        <div className="space-y-1.5 text-xs">
          <div className="flex items-center justify-between p-1.5 rounded-lg bg-muted/50 transition-colors hover:bg-muted">
            <span className="text-muted-foreground font-medium">Value:</span>
            <span className="font-bold text-foreground">₦{stockValue.toFixed(2)}</span>
          </div>

          <div className="flex items-center justify-between p-1.5 rounded-lg bg-muted/50 transition-colors hover:bg-muted">
            <span className="text-muted-foreground font-medium">Sold:</span>
            <span className="font-bold text-foreground">{item.totalSold}</span>
          </div>
        </div>

        {/* Enhanced action buttons */}
        <div className="flex gap-1.5 pt-1">
          <Button
            variant="default"
            size="sm"
            className="flex-1 h-8 text-xs font-semibold bg-gradient-primary hover:opacity-90 transition-all duration-300 hover:scale-105 shadow-md"
            onClick={() => onSell(item)}
            disabled={isOutOfStock}
          >
            <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
            Sell
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary hover:border-primary transition-all duration-300 hover:scale-110"
            onClick={() => onEdit(item)}
          >
            <Edit2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(item.id)}
            className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 hover:border-destructive transition-all duration-300 hover:scale-110"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
