import { useNavigate } from 'react-router-dom';
import { useInventory } from '@/hooks/useInventory';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Wallet, TrendingUp, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ThemeToggle } from '@/components/ThemeToggle';

const CategorySummary = () => {
  const navigate = useNavigate();
  const { items, categories, isLoading } = useInventory();

  // Aggregate data by category
  const categoryStats = categories.map(category => {
    const categoryItems = items.filter(item => item.category === category.name);
    const totalValue = categoryItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const itemCount = categoryItems.length;
    const totalQuantity = categoryItems.reduce((sum, item) => sum + item.quantity, 0);

    return {
      id: category.id,
      name: category.name,
      totalValue,
      itemCount,
      totalQuantity
    };
  });

  // Calculate items with no category
  const uncategorizedItems = items.filter(item => !item.category || item.category === 'Uncategorized');
  if (uncategorizedItems.length > 0) {
    categoryStats.push({
      id: 'uncategorized',
      name: 'Uncategorized',
      totalValue: uncategorizedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      itemCount: uncategorizedItems.length,
      totalQuantity: uncategorizedItems.reduce((sum, item) => sum + item.quantity, 0)
    });
  }

  // Calculate Grand Total
  const grandTotalValue = categoryStats.reduce((sum, cat) => sum + cat.totalValue, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading summary...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl sm:text-3xl font-bold tracking-tight">Summary</h1>
            <p className="text-xs sm:text-base text-muted-foreground">Financial breakdown</p>
          </div>
        </div>
        <ThemeToggle />
      </div>

      {/* Grand Total Card */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-medium">Grand Total Stock Value</CardTitle>
          <Wallet className="h-5 w-5 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-primary">
            ₦{grandTotalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Total value of all inventory across {categoryStats.length} categories
          </p>
        </CardContent>
      </Card>

      {/* Category Grid */}
      <div className={`grid gap-4 ${categoryStats.length > 5 ? 'grid-cols-2' : 'grid-cols-1'} sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`}>
        {categoryStats.sort((a, b) => b.totalValue - a.totalValue).map((category) => (
          <Card key={category.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-medium truncate" title={category.name}>
                {category.name}
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₦{category.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Package className="h-3 w-3" />
                  {category.itemCount} items
                </div>
                <div>
                  {category.totalQuantity} units
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CategorySummary;
