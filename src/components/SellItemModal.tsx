import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Minus, Plus, Package } from 'lucide-react';
import type { InventoryItem } from '@/types/inventory';
import type { Variant } from '@/types/variant';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface SellItemModalProps {
  item: InventoryItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSell: (id: string, quantity: number, variantId?: string) => Promise<boolean>;
}

export function SellItemModal({ item, open, onOpenChange, onSell }: SellItemModalProps) {
  const hasVariants = item?.hasVariants && item?.variants && item.variants.length > 0;

  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);

  // Track previous state to detect changes for reset
  const [prevOpen, setPrevOpen] = useState(open);
  const [prevItemId, setPrevItemId] = useState(item?.id);
  const variantsStr = JSON.stringify(item?.variants);
  const [prevVariantsStr, setPrevVariantsStr] = useState(variantsStr);

  const shouldReset =
    (open && !prevOpen) || // Just opened
    (!open && prevOpen) || // Just closed
    (item?.id !== prevItemId) || // Item changed
    (variantsStr !== prevVariantsStr); // Variants changed

  if (shouldReset) {
    setPrevOpen(open);
    setPrevItemId(item?.id);
    setPrevVariantsStr(variantsStr);

    if (!open || !item) {
      setSelectedVariant(null);
      setQuantity(1);
    } else {
      if (!hasVariants || !item.variants || item.variants.length === 0) {
        setSelectedVariant(null);
        setQuantity(1);
      } else {
        // Always get fresh variant data when modal opens or variants change
        const firstAvailable = item.variants.find(v => v.quantity > 0);
        const initialVariant = firstAvailable || item.variants[0];

        setSelectedVariant(initialVariant);
        setQuantity(1);
      }
    }
  }


  const availableStock = hasVariants && selectedVariant ? selectedVariant.quantity : item?.quantity || 0;

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= availableStock) {
      setQuantity(newQuantity);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('🔵 SellItemModal: handleSubmit called', {
      itemId: item?.id,
      quantity,
      availableStock,
      hasVariants,
      selectedVariant
    });

    if (!item || quantity < 1 || quantity > availableStock) return;

    // If has variants, ensure a variant is selected
    if (hasVariants && !selectedVariant) {
      toast.error('Please select a variant');
      return;
    }

    console.log('🟢 SellItemModal: Calling onSell', {
      itemId: item.id,
      quantity,
      variantId: selectedVariant?.id
    });

    const success = await onSell(
      item.id,
      quantity,
      selectedVariant?.id
    );

    console.log('🟣 SellItemModal: onSell returned', { success });

    if (success) {
      const variantInfo = selectedVariant ? ` (${selectedVariant.name})` : '';
      toast.success(`Sold ${quantity} ${item.name}${variantInfo}`, {
        description: `Total: ${(quantity * item.price).toFixed(2)}`,
      });
      onOpenChange(false);
    } else {
      toast.error('Failed to complete sale');
    }
  };

  if (!item) return null;

  const totalAmount = quantity * item.price;

  return (
    <Dialog open={open} onOpenChange={onOpenChange} key={item.id}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogDescription>
            
          </DialogDescription>
          <DialogTitle className="font-display text-xl">Record Sale</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Item Preview */}
          <div className="flex gap-4 p-3 bg-muted/50 rounded-lg border border-border/50">
            {item.image ? (
              <img
                src={item.image}
                alt={item.name}
                className="w-16 h-16 rounded-md object-cover ring-2 ring-border"
              />
            ) : (
              <div className="w-16 h-16 rounded-md bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h4 className="font-display font-bold truncate">{item.name}</h4>
              <p className="text-primary font-bold text-lg">₦{item.price.toFixed(2)} each</p>
              {!hasVariants && (
                <p className="text-sm text-muted-foreground">{item.quantity} available</p>
              )}
            </div>
          </div>

          {/* Variant Selector */}
          {hasVariants && item.variants && (
            <div className="space-y-2">
              <Label>Select Variant</Label>
              <div className="grid grid-cols-1 gap-2">
                {item.variants.map((variant) => (
                  <button
                    key={variant.id}
                    type="button"
                    onClick={() => {
                      setSelectedVariant(variant);
                      setQuantity(1); // Reset quantity when changing variant
                    }}
                    disabled={variant.quantity === 0}
                    className={cn(
                      'flex items-center justify-between p-3 rounded-lg border-2 transition-all text-left',
                      selectedVariant?.id === variant.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50 hover:bg-muted/50',
                      variant.quantity === 0 && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    <div className="flex-1">
                      <p className="font-semibold">{variant.name}</p>
                      {variant.sku && (
                        <p className="text-xs text-muted-foreground">SKU: {variant.sku}</p>
                      )}
                    </div>
                    <div className={cn(
                      'px-3 py-1 rounded-full text-xs font-bold',
                      variant.quantity === 0 && 'bg-destructive/10 text-destructive',
                      variant.quantity > 0 && variant.quantity <= 5 && 'bg-accent/10 text-accent',
                      variant.quantity > 5 && 'bg-success/10 text-success'
                    )}>
                      {variant.quantity} available
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="space-y-2">
            <Label>Quantity to Sell</Label>
            <div className="flex items-center justify-center gap-4">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
                className="h-10 w-10"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                min="1"
                max={availableStock}
                value={quantity}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 1;
                  setQuantity(Math.min(Math.max(1, val), availableStock));
                }}
                className="w-24 text-center text-lg font-bold"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleQuantityChange(1)}
                disabled={quantity >= availableStock}
                className="h-10 w-10"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-center text-muted-foreground">
              Max: {availableStock} available
            </p>
          </div>

          {/* Total */}
          <div className="p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg text-center border border-border/50">
            <p className="text-sm text-muted-foreground mb-1 font-medium">Total Amount</p>
            <p className="text-3xl font-display font-bold bg-gradient-primary bg-clip-text text-transparent">
              ₦{totalAmount.toFixed(2)}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-primary hover:opacity-90"
              disabled={availableStock === 0 || (hasVariants && !selectedVariant)}
            >
              Confirm Sale
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
