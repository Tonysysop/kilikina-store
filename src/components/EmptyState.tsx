import { Package, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  onAddItem: () => void;
}

export function EmptyState({ onAddItem }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 animate-fade-in-scale">
      <div className="relative w-24 h-24 rounded-full bg-gradient-primary flex items-center justify-center mb-8 animate-float shadow-lg">
        <div className="absolute inset-0 rounded-full bg-gradient-primary animate-pulse-glow" />
        <Package className="relative h-12 w-12 text-white" strokeWidth={2.5} />
      </div>

      <h3 className="font-display text-3xl font-bold mb-3 text-gradient-primary">
        No items yet
      </h3>

      <p className="text-muted-foreground text-center max-w-md mb-8 text-lg leading-relaxed">
        Start building your Kilikina Accessories inventory by adding your first product.
      </p>

      <Button
        onClick={onAddItem}
        size="lg"
        className="bg-gradient-primary hover:opacity-90 transition-all duration-300 hover:scale-105 shadow-lg text-base font-semibold px-8"
      >
        <Plus className="h-5 w-5 mr-2" />
        Add Your First Item
      </Button>
    </div>
  );
}

