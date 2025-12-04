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
    <div className="bg-card rounded-lg card-shadow overflow-hidden">
      <div className="p-4 border-b border-border">
        <h3 className="font-display font-semibold">Availability Overview</h3>
        <p className="text-muted-foreground text-xs mt-0.5">Quick view of all item stock levels</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Item</th>
              <th className="text-center p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Price</th>
              <th className="text-center p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Qty</th>
              <th className="text-center p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
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
                    'border-b border-border/50 hover:bg-muted/30 transition-colors',
                    index === items.length - 1 && 'border-b-0'
                  )}
                >
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-8 h-8 rounded-md object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-md bg-secondary flex items-center justify-center">
                          <Package className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                      <span className="font-medium text-sm truncate max-w-[150px]">{item.name}</span>
                    </div>
                  </td>
                  <td className="p-3 text-center text-sm">${item.price.toFixed(2)}</td>
                  <td className="p-3 text-center text-sm font-semibold">{item.quantity}</td>
                  <td className="p-3">
                    <div className="flex justify-center">
                      <div className={cn(
                        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
                        status.color === 'destructive' && 'bg-destructive/10 text-destructive',
                        status.color === 'accent' && 'bg-accent/10 text-accent',
                        status.color === 'success' && 'bg-success/10 text-success'
                      )}>
                        <StatusIcon className="h-3 w-3" />
                        {status.label}
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
