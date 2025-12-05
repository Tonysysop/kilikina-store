import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'success' | 'warning';
}

const variantStyles = {
  default: 'bg-card border border-border/50',
  primary: 'bg-gradient-primary text-white border-0',
  success: 'bg-gradient-success text-white border-0',
  warning: 'bg-gradient-warning text-white border-0',
};

const iconContainerStyles = {
  default: 'bg-gradient-to-br from-primary/10 to-accent/10 text-primary',
  primary: 'bg-white/20 text-white backdrop-blur-sm',
  success: 'bg-white/20 text-white backdrop-blur-sm',
  warning: 'bg-white/20 text-white backdrop-blur-sm',
};

const textStyles = {
  default: 'text-muted-foreground',
  primary: 'text-white/90',
  success: 'text-white/90',
  warning: 'text-white/90',
};

const valueStyles = {
  default: 'text-foreground',
  primary: 'text-white',
  success: 'text-white',
  warning: 'text-white',
};

export function StatCard({ title, value, icon: Icon, trend, variant = 'default' }: StatCardProps) {
  return (
    <div className={cn(
      'group relative rounded-xl p-6 transition-all duration-500 hover:scale-[1.02] animate-fade-in-scale overflow-hidden',
      'card-shadow hover:card-shadow-hover',
      variantStyles[variant]
    )}>
      {/* Animated gradient background for non-default variants */}
      {variant !== 'default' && (
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      )}

      <div className="relative flex items-start justify-between">
        <div className="space-y-3 flex-1">
          <p className={cn('text-sm font-medium tracking-wide', textStyles[variant])}>
            {title}
          </p>
          <p className={cn(
            'text-3xl font-display font-bold tracking-tight transition-transform duration-300 group-hover:scale-105',
            valueStyles[variant]
          )}>
            {value}
          </p>
          {trend && (
            <p className={cn(
              'text-xs font-semibold flex items-center gap-1',
              variant === 'default'
                ? (trend.isPositive ? 'text-success' : 'text-destructive')
                : 'text-white/80'
            )}>
              <span className="text-base">{trend.isPositive ? '↑' : '↓'}</span>
              {Math.abs(trend.value)}% from last week
            </p>
          )}
        </div>

        <div className={cn(
          'p-3.5 rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-6',
          iconContainerStyles[variant]
        )}>
          <Icon className="h-6 w-6" strokeWidth={2.5} />
        </div>
      </div>

      {/* Shimmer effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-0 animate-shimmer" />
      </div>
    </div>
  );
}

