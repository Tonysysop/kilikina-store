import type { Variant } from '@/types/variant';
import { cn } from '@/lib/utils';

interface VariantListProps {
    variants: Variant[];
    compact?: boolean;
}

export function VariantList({ variants, compact = false }: VariantListProps) {
    if (!variants || variants.length === 0) return null;

    if (compact) {
        // Compact view for cards
        return (
            <div className="flex flex-wrap gap-1.5">
                {variants.map((variant) => (
                    <div
                        key={variant.id}
                        className={cn(
                            'px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider',
                            variant.quantity === 0 && 'bg-destructive/90 text-white',
                            variant.quantity > 0 && variant.quantity <= 5 && 'bg-accent/90 text-white',
                            variant.quantity > 5 && 'bg-success/90 text-white'
                        )}
                    >
                        {variant.name}: {variant.quantity}
                    </div>
                ))}
            </div>
        );
    }

    // Full view for modals/details
    return (
        <div className="space-y-2">
            {variants.map((variant) => (
                <div
                    key={variant.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{variant.name}</p>
                        {variant.sku && (
                            <p className="text-xs text-muted-foreground">SKU: {variant.sku}</p>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            'px-3 py-1 rounded-full text-xs font-bold',
                            variant.quantity === 0 && 'bg-destructive/10 text-destructive',
                            variant.quantity > 0 && variant.quantity <= 5 && 'bg-accent/10 text-accent',
                            variant.quantity > 5 && 'bg-success/10 text-success'
                        )}>
                            {variant.quantity} in stock
                        </div>
                        {variant.sold > 0 && (
                            <span className="text-xs text-muted-foreground">
                                {variant.sold} sold
                            </span>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
