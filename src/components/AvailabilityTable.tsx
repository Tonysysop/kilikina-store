import type { InventoryItem } from '@/types/inventory';
import { Package, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AvailabilityTableProps {
  items: InventoryItem[];
}

export function AvailabilityTable({ items }: AvailabilityTableProps) {
  if (items.length === 0) {
    return null;
  }

  const getStatus = (quantity: number) => {
    if (quantity === 0) return { label: 'Out of Stock', color: 'destructive', icon: XCircle };
    if (quantity <= 5) return { label: 'Low Stock', color: 'accent', icon: AlertCircle };
    return { label: 'In Stock', color: 'success', icon: CheckCircle };
  };

  return (
    <div className="bg-card rounded-xl card-shadow overflow-hidden border border-border/50">
      <div className="p-5 bg-gradient-to-r from-primary/5 to-accent/5 border-b border-border/50">
        <h3 className="font-display font-bold text-lg">Availability Overview</h3>
        <p className="text-muted-foreground text-sm mt-1">Quick view of all item stock levels</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Item</th>
              <th className="text-center p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Price</th>
              <th className="text-center p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Qty</th>
              <th className="text-center p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => {
              const status = getStatus(item.quantity);
              const StatusIcon = status.icon;

              return (
                <tr
                  key={item.id}
                  className={cn(
                    'border-b border-border/30 hover:bg-gradient-to-r hover:from-primary/5 hover:to-transparent transition-all duration-300',
                    index === items.length - 1 && 'border-b-0'
                  )}
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-10 h-10 rounded-lg object-cover ring-2 ring-border/50"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                          <Package className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                      <span className="font-semibold text-sm truncate max-w-[200px]">{item.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-center text-sm font-semibold">₦{item.price.toFixed(2)}</td>
                  <td className="p-4 text-center text-sm font-bold">{item.quantity}</td>
                  <td className="p-4">
                    <div className="flex justify-center">
                      <div className={cn(
                        'inline-flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm transition-all duration-300 hover:scale-105',
                        status.color === 'destructive' && 'bg-gradient-to-r from-destructive to-destructive/80 text-white',
                        status.color === 'accent' && 'bg-gradient-to-r from-accent to-accent/80 text-white',
                        status.color === 'success' && 'bg-gradient-success text-white'
                      )}>
                        <StatusIcon className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="hidden sm:inline">{status.label}</span>
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
