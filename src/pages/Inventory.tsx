import { useState, useEffect } from 'react';
import { useInventory } from '@/hooks/useInventory';
import type { InventoryItem } from '@/types/inventory';
import { StatCard } from '@/components/StatCard';
import { InventoryCard } from '@/components/InventoryCard';
import { InventoryListItem } from '@/components/InventoryListItem';
import { AddItemModal } from '@/components/AddItemModal';
import { EditItemModal } from '@/components/EditItemModal';
import { SellItemModal } from '@/components/SellItemModal';
import { DeleteConfirmModal } from '@/components/DeleteConfirmModal';
import { EmptyState } from '@/components/EmptyState';
import { LowStockList } from '@/components/LowStockList';
import { AvailabilityTable } from '@/components/AvailabilityTable';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DollarSign,
  TrendingUp,
  Wallet,
  Plus,
  Search,
  LayoutGrid,
  List,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const Index = () => {
  const { items, stats, addItem, updateItem, deleteItem, sellItem, isLoading } = useInventory();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [sellingItem, setSellingItem] = useState<InventoryItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<{ id: string; name: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  // Initialize view mode based on screen width
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() =>
    typeof window !== 'undefined' && window.innerWidth < 768 ? 'list' : 'grid'
  );

  // Update view mode on window resize
  useEffect(() => {
    const handleResize = () => {
      setViewMode(window.innerWidth < 768 ? 'list' : 'grid');
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteConfirm = () => {
    if (deletingItem) {
      deleteItem(deletingItem.id);
      toast.success('Item deleted successfully');
      setDeletingItem(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading inventory...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight">
                Kilikina Accessories
              </h1>
              <p className="text-muted-foreground text-sm mt-0.5">
                Inventory Management
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <ThemeToggle />
              <Button onClick={() => setShowAddModal(true)} size="lg" className="flex-1 sm:flex-initial">
                <Plus className="h-5 w-5 sm:mr-2" />
                <span className="hidden sm:inline">Add Item</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Stats Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Revenue"
            value={`₦${stats.totalRevenue.toFixed(2)}`}
            icon={DollarSign}
            variant="primary"
          />
          <StatCard
            title="Items Sold"
            value={stats.totalItemsSold}
            icon={TrendingUp}
            variant="success"
          />
          <StatCard
            title="Stock Value"
            value={`₦${stats.remainingStockValue.toFixed(2)}`}
            icon={Wallet}
            variant="default"
          />
          <StatCard
            title="Low Stock Items"
            value={stats.lowStockItems + stats.outOfStockItems}
            icon={AlertTriangle}
            variant={stats.lowStockItems + stats.outOfStockItems > 0 ? 'warning' : 'default'}
          />
        </section>

        {/* Dashboard Grid - Availability & Low Stock */}
        {items.length > 0 && (
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <AvailabilityTable items={items} />
            </div>
            <div>
              <LowStockList items={items} onSell={setSellingItem} />
            </div>
          </section>
        )}

        {/* Inventory Section */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-xl font-display font-semibold">Products</h2>

            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* View Toggle */}
              <div className="flex items-center bg-muted rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${viewMode === 'grid'
                    ? 'bg-background shadow-sm text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                    }`}
                  title="Grid View"
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${viewMode === 'list'
                    ? 'bg-background shadow-sm text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                    }`}
                  title="List View"
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Items Grid/List */}
          {items.length === 0 ? (
            <EmptyState onAddItem={() => setShowAddModal(true)} />
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No items match your search
            </div>
          ) : (
            <div className={cn(
              viewMode === 'grid'
                ? 'grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                : 'space-y-3'
            )}>
              {filteredItems.map((item) => (
                viewMode === 'grid' ? (
                  <InventoryCard
                    key={item.id}
                    item={item}
                    onEdit={setEditingItem}
                    onDelete={(id) => setDeletingItem({ id, name: item.name })}
                    onSell={setSellingItem}
                  />
                ) : (
                  <InventoryListItem
                    key={item.id}
                    item={item}
                    onEdit={setEditingItem}
                    onDelete={(id) => setDeletingItem({ id, name: item.name })}
                    onSell={setSellingItem}
                  />
                )
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Modals */}
      <AddItemModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onAdd={(item) => {
          addItem(item);
          toast.success('Item added successfully');
        }}
      />

      <EditItemModal
        item={editingItem}
        open={!!editingItem}
        onOpenChange={(open) => !open && setEditingItem(null)}
        onSave={(id, updates) => {
          updateItem(id, updates);
          toast.success('Item updated successfully');
        }}
      />

      <SellItemModal
        item={sellingItem ? items.find(i => i.id === sellingItem.id) || sellingItem : null}
        open={!!sellingItem}
        onOpenChange={(open) => !open && setSellingItem(null)}
        onSell={async (id, quantity, variantId) => {
          const result = await sellItem(id, quantity, variantId);
          return result;
        }}
      />

      <DeleteConfirmModal
        open={!!deletingItem}
        onOpenChange={(open) => !open && setDeletingItem(null)}
        onConfirm={handleDeleteConfirm}
        itemName={deletingItem?.name}
      />
    </div>
  );
};

export default Index;
