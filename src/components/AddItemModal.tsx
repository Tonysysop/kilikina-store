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
import { ImagePlus, X, Loader2 } from 'lucide-react';
import type { InventoryItem } from '@/types/inventory';
import type { Variant } from '@/types/variant';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { toast } from 'sonner';
import { VariantManager } from '@/components/VariantManager';
import { getTotalQuantity } from '@/lib/variantUtils';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useInventory } from '@/hooks/useInventory';
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown, Plus, Trash2 } from 'lucide-react';

interface AddItemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (item: Omit<InventoryItem, 'id' | 'totalSold' | 'createdAt'>) => void;
}

export function AddItemModal({ open, onOpenChange, onAdd }: AddItemModalProps) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [category, setCategory] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [openCombobox, setOpenCombobox] = useState(false);
  const [image, setImage] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [cloudinaryPublicId, setCloudinaryPublicId] = useState('');

  // Variant support
  const [hasVariants, setHasVariants] = useState(false);
  const [variants, setVariants] = useState<Variant[]>([]);

  const { categories, addCategory, deleteCategory } = useInventory();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setImagePreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !price) return;

    // Validate based on mode
    if (hasVariants) {
      if (variants.length === 0) {
        toast.error('Please add at least one variant');
        return;
      }
    } else {
      if (!quantity) {
        toast.error('Please enter a quantity');
        return;
      }
    }

    setIsUploading(true);

    try {
      let finalImageUrl = image;
      let finalPublicId = cloudinaryPublicId;

      // Upload to Cloudinary if a new file was selected
      if (imageFile) {
        const uploadResult = await uploadToCloudinary(imageFile, {
          folder: 'kilikina-inventory',
        });
        finalImageUrl = uploadResult.secure_url;
        finalPublicId = uploadResult.public_id;
      }

      const totalQuantity = hasVariants ? getTotalQuantity(variants) : parseInt(quantity);

      onAdd({
        name,
        price: parseFloat(price),
        quantity: totalQuantity,
        category: category || undefined,
        image: finalImageUrl,
        imageUrl: finalImageUrl,
        cloudinaryPublicId: finalPublicId,
        hasVariants,
        variants: hasVariants ? variants : undefined,
      });

      // Reset form
      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    try {
      await addCategory(newCategory.trim());
      setCategory(newCategory.trim()); // Auto-select new category
      setOpenCombobox(false);
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error('Failed to add category. Check your permissions.');
    }
  };

  const handleDeleteCategory = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent select closing or selection
    if (confirm('Are you sure you want to delete this category?')) {
      await deleteCategory(id);
      if (category === categories.find(c => c.id === id)?.name) {
        setCategory('');
      }
    }
  };

  const resetForm = () => {
    setName('');
    setPrice('');
    setQuantity('');
    setCategory('');
    setImage('');
    setImagePreview('');
    setImageFile(null);
    setCloudinaryPublicId('');
    setHasVariants(false);
    setVariants([]);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) resetForm();
      onOpenChange(isOpen);
    }}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Add New Item</DialogTitle>
          <DialogDescription>
            Add a new item to your inventory.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Product Image</Label>
            <div className="flex justify-center">
              {imagePreview ? (
                <div className="relative w-32 h-32 rounded-lg overflow-hidden bg-muted">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      setImage('');
                      setImagePreview('');
                      setImageFile(null);
                    }}
                    className="absolute top-2 right-2 p-1 rounded-full bg-foreground/80 text-background hover:bg-foreground transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label className="w-32 h-32 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
                  <ImagePlus className="h-8 w-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground mt-2">Upload Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Item Name</Label>
            <Input
              id="name"
              placeholder="e.g., Leather Wallet, Running Shoes"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Category</Label>
            <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openCombobox}
                  className="w-full justify-between"
                >
                  {category || "Select a category..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                <Command>
                  <CommandInput 
                    placeholder="Search or add category..." 
                    value={newCategory}
                    onValueChange={setNewCategory}
                  />
                  <CommandList>
                    <CommandEmpty>
                      <button
                        type="button"
                        className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground cursor-pointer"
                        onClick={handleAddCategory}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Create "{newCategory}"
                      </button>
                    </CommandEmpty>
                    
                    <CommandGroup heading="Existing Categories">
                      {categories.map((cat) => (
                        <CommandItem
                          key={cat.id}
                          value={cat.name}
                          onSelect={() => {
                            setCategory(cat.name === category ? "" : cat.name);
                            setOpenCombobox(false);
                          }}
                          className="flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-2">
                            <Check
                              className={cn(
                                "h-4 w-4",
                                category === cat.name ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {cat.name}
                          </div>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteCategory(cat.id, e)}
                            className="bg-transparent hover:bg-destructive/10 text-muted-foreground hover:text-destructive p-1 rounded-sm transition-colors z-50 focus:outline-none"
                            title="Delete category"
                            onMouseDown={(e) => e.stopPropagation()} // Prevent CommandItem selection on click/focus
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Price */}
          <div className="space-y-2">
            <Label htmlFor="price">Price (₦)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>

          {/* Variant Toggle */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-primary/5 to-accent/5 border border-border/50">
            <div>
              <Label className="text-base font-semibold">Does this product have variants?</Label>
              <p className="text-xs text-muted-foreground mt-1">
                e.g., Different sizes, colors, or styles
              </p>
            </div>
            <button
              type="button"
              onClick={() => setHasVariants(!hasVariants)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${hasVariants ? 'bg-gradient-primary' : 'bg-muted'
                }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${hasVariants ? 'translate-x-6' : 'translate-x-1'
                  }`}
              />
            </button>
          </div>

          {/* Conditional: Single Quantity or Variants */}
          {hasVariants ? (
            <VariantManager variants={variants} onChange={setVariants} />
          ) : (
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                placeholder="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required={!hasVariants}
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-primary hover:opacity-90"
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Add Item'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
