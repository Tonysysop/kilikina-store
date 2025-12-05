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
import { ImagePlus, X, Loader2 } from 'lucide-react';
import type { InventoryItem } from '@/types/inventory';
import type { Variant } from '@/types/variant';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { toast } from 'sonner';
import { VariantManager } from '@/components/VariantManager';
import { getTotalQuantity } from '@/lib/variantUtils';

interface EditItemModalProps {
  item: InventoryItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (id: string, updates: Partial<Omit<InventoryItem, 'id' | 'createdAt'>>) => void;
}

export function EditItemModal({ item, open, onOpenChange, onSave }: EditItemModalProps) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [image, setImage] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [cloudinaryPublicId, setCloudinaryPublicId] = useState('');

  // Variant support
  const [hasVariants, setHasVariants] = useState(false);
  const [variants, setVariants] = useState<Variant[]>([]);

  useEffect(() => {
    if (item) {
      setName(item.name);
      setPrice(item.price.toString());
      setQuantity(item.quantity.toString());
      setImage(item.imageUrl || item.image);
      setImagePreview(item.imageUrl || item.image);
      setCloudinaryPublicId(item.cloudinaryPublicId || '');
      setHasVariants(item.hasVariants || false);
      setVariants(item.variants || []);
    }
  }, [item]);

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

    if (!item || !name || !price) return;

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

      onSave(item.id, {
        name,
        price: parseFloat(price),
        quantity: totalQuantity,
        image: finalImageUrl,
        imageUrl: finalImageUrl,
        cloudinaryPublicId: finalPublicId,
        hasVariants,
        variants: hasVariants ? variants : undefined,
      });

      setImageFile(null);
      onOpenChange(false);
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Edit Item</DialogTitle>
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
            <Label htmlFor="edit-name">Item Name</Label>
            <Input
              id="edit-name"
              placeholder="e.g., Leather Wallet, Running Shoes"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Price */}
          <div className="space-y-2">
            <Label htmlFor="edit-price">Price (₦)</Label>
            <Input
              id="edit-price"
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
              <Label htmlFor="edit-quantity">Quantity</Label>
              <Input
                id="edit-quantity"
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
                'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
