import { Package, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  onAddItem: () => void;
}

export function EmptyState({ onAddItem }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 animate-fade-in">
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <Package className="h-10 w-10 text-primary" />
      </div>
      <h3 className="font-display text-2xl font-semibold mb-2">No items yet</h3>
      <p className="text-muted-foreground text-center max-w-sm mb-6">
        Start building your Kilikina Accessories inventory by adding your first product.
      </p>
      <Button onClick={onAddItem} size="lg">
        <Plus className="h-5 w-5 mr-2" />
        Add Your First Item
      </Button>
    </div>
  );
}
