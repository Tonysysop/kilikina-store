import { useState } from 'react';
import type { Variant } from '@/types/variant';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { generateVariantId } from '@/lib/variantUtils';

interface VariantManagerProps {
    variants: Variant[];
    onChange: (variants: Variant[]) => void;
}

export function VariantManager({ variants, onChange }: VariantManagerProps) {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValues, setEditValues] = useState<{ name: string; quantity: string; sku: string } | null>(null);
    const [newVariant, setNewVariant] = useState({ name: '', quantity: '', sku: '' });

    const handleAddVariant = () => {
        if (!newVariant.name || !newVariant.quantity) return;

        const variant: Variant = {
            id: generateVariantId(),
            name: newVariant.name.trim(),
            quantity: parseInt(newVariant.quantity),
            sold: 0,
            sku: newVariant.sku.trim() || undefined,
        };

        onChange([...variants, variant]);
        setNewVariant({ name: '', quantity: '', sku: '' });
    };

    const startEditing = (variant: Variant) => {
        setEditingId(variant.id);
        setEditValues({
            name: variant.name,
            quantity: variant.quantity.toString(),
            sku: variant.sku || ''
        });
    };

    const handleSaveEdit = () => {
        if (!editingId || !editValues) return;

        onChange(variants.map(v => v.id === editingId ? {
            ...v,
            name: editValues.name,
            quantity: parseInt(editValues.quantity) || 0,
            sku: editValues.sku.trim() || undefined
        } : v));

        setEditingId(null);
        setEditValues(null);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditValues(null);
    };

    const handleDeleteVariant = (id: string) => {
        onChange(variants.filter(v => v.id !== id));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSaveEdit();
        } else if (e.key === 'Escape') {
            handleCancelEdit();
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Product Variants</Label>
                <span className="text-sm text-muted-foreground">{variants.length} variant{variants.length !== 1 ? 's' : ''}</span>
            </div>

            {/* Existing Variants List */}
            {variants.length > 0 && (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                    {variants.map((variant) => (
                        <div
                            key={variant.id}
                            className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors border border-border/50"
                        >
                            {editingId === variant.id && editValues ? (
                                <>
                                    <Input
                                        value={editValues.name}
                                        onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                                        className="flex-1 h-8"
                                        onKeyDown={handleKeyDown}
                                        autoFocus
                                    />
                                    <Input
                                        type="number"
                                        value={editValues.quantity}
                                        onChange={(e) => setEditValues({ ...editValues, quantity: e.target.value })}
                                        className="w-20 h-8"
                                        onKeyDown={handleKeyDown}
                                    />
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="ghost"
                                        className="h-8 w-8 p-0 text-success hover:text-success hover:bg-success/10"
                                        onClick={handleSaveEdit}
                                    >
                                        <Check className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="ghost"
                                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                                        onClick={handleCancelEdit}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-sm truncate">{variant.name}</p>
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
                                        {variant.quantity} in stock
                                    </div>
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="ghost"
                                        className="h-8 w-8 p-0"
                                        onClick={() => startEditing(variant)}
                                    >
                                        <Edit2 className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="ghost"
                                        className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                        onClick={() => handleDeleteVariant(variant.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Add New Variant Form */}
            <div className="p-4 rounded-lg bg-gradient-to-r from-primary/5 to-accent/5 border border-border/50 space-y-3">
                <p className="text-sm font-semibold">Add New Variant</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                        <Label htmlFor="variant-name" className="text-xs">Variant Name *</Label>
                        <Input
                            id="variant-name"
                            placeholder="e.g., Size 38"
                            value={newVariant.name}
                            onChange={(e) => setNewVariant({ ...newVariant, name: e.target.value })}
                            className="h-9 mt-1"
                        />
                    </div>
                    <div>
                        <Label htmlFor="variant-quantity" className="text-xs">Quantity *</Label>
                        <Input
                            id="variant-quantity"
                            type="number"
                            placeholder="0"
                            value={newVariant.quantity}
                            onChange={(e) => setNewVariant({ ...newVariant, quantity: e.target.value })}
                            className="h-9 mt-1"
                        />
                    </div>
                    <div>
                        <Label htmlFor="variant-sku" className="text-xs">SKU (Optional)</Label>
                        <Input
                            id="variant-sku"
                            placeholder="SKU-001"
                            value={newVariant.sku}
                            onChange={(e) => setNewVariant({ ...newVariant, sku: e.target.value })}
                            className="h-9 mt-1"
                        />
                    </div>
                </div>
                <Button
                    type="button"
                    onClick={handleAddVariant}
                    disabled={!newVariant.name || !newVariant.quantity}
                    className="w-full bg-gradient-primary hover:opacity-90 transition-all duration-300"
                    size="sm"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Variant
                </Button>
            </div>

            {variants.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                    No variants added yet. Add your first variant above.
                </p>
            )}
        </div>
    );
}
