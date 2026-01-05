import { formatDistanceToNow } from 'date-fns';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Undo2, Loader2, Package } from 'lucide-react';
import type { SaleRecord } from '@/types/inventory';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useState } from 'react';
import { toast } from 'sonner';

interface SalesHistoryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sales: SaleRecord[];
  onRevertSale: (sale: SaleRecord) => Promise<boolean>;
}

export function SalesHistory({ open, onOpenChange, sales, onRevertSale }: SalesHistoryProps) {
  const [revertingId, setRevertingId] = useState<string | null>(null);

  const handleRevert = async (sale: SaleRecord) => {
    setRevertingId(sale.id);
    try {
      const success = await onRevertSale(sale);
      if (success) {
        toast.success("Sale reverted", {
          description: `Restored ${sale.quantity}x ${sale.itemName} to inventory`
        });
      }
    } catch (error) {
      toast.error("Failed to revert sale");
    } finally {
      setRevertingId(null);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-xl font-display">Recent Sales</SheetTitle>
          <SheetDescription>
            History of completed transactions. You can revert accidental sales here.
          </SheetDescription>
        </SheetHeader>

        {sales.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground border-2 border-dashed rounded-lg">
            <Package className="h-10 w-10 mb-2 opacity-20" />
            <p className="font-medium">No sales recorded yet</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium truncate max-w-[150px]" title={sale.itemName}>
                          {sale.itemName}
                        </span>
                        {sale.variantName && (
                          <span className="text-xs text-muted-foreground">
                            {sale.variantName}
                          </span>
                        )}
                        <span className="text-[10px] text-muted-foreground mt-0.5">
                          {formatDistanceToNow(sale.date, { addSuffix: true })}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {sale.quantity}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ₦{sale.totalAmount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            disabled={revertingId === sale.id}
                          >
                            {revertingId === sale.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Undo2 className="h-4 w-4" />
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Revert this sale?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will return <strong>{sale.quantity}x {sale.itemName}</strong> to inventory and remove this sale record.
                              <br /><br />
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleRevert(sale)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Revert Sale
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
