import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Minus, Plus, Package } from 'lucide-react';
import type { InventoryItem } from '@/types/inventory';
import { toast } from 'sonner';

interface SellItemModalProps {
  item: InventoryItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSell: (id: string, quantity: number) => Promise<boolean>;
}

export function SellItemModal({ item, open, onOpenChange, onSell }: SellItemModalProps) {
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (open) {
      setQuantity(1);
    }
  }, [open]);

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && item && newQuantity <= item.quantity) {
      setQuantity(newQuantity);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!item || quantity < 1 || quantity > item.quantity) return;

    const success = await onSell(item.id, quantity);
    
    if (success) {
      toast.success(`Sold ${quantity} ${item.name}${quantity > 1 ? 's' : ''}`, {
        description: `Total: $${(quantity * item.price).toFixed(2)}`,
      });
      onOpenChange(false);
    } else {
      toast.error('Failed to complete sale');
    }
  };

  if (!item) return null;

  const totalAmount = quantity * item.price;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Record Sale</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Item Preview */}
          <div className="flex gap-4 p-3 bg-muted rounded-lg">
            {item.image ? (
              <img
                src={item.image}
                alt={item.name}
                className="w-16 h-16 rounded-md object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-md bg-secondary flex items-center justify-center">
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold truncate">{item.name}</h4>
              <p className="text-primary font-medium">${item.price.toFixed(2)} each</p>
              <p className="text-sm text-muted-foreground">{item.quantity} available</p>
            </div>
          </div>

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
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                min="1"
                max={item.quantity}
                value={quantity}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 1;
                  setQuantity(Math.min(Math.max(1, val), item.quantity));
                }}
                className="w-20 text-center text-lg font-semibold"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleQuantityChange(1)}
                disabled={quantity >= item.quantity}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Total */}
          <div className="p-4 bg-primary/10 rounded-lg text-center">
            <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
            <p className="text-3xl font-display font-bold text-primary">
              ${totalAmount.toFixed(2)}
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
            <Button type="submit" className="flex-1">
              Confirm Sale
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
