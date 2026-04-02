import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


interface MetricCardProps {
  label: string;
  value: string;
  subValue?: string;
  trend?: number;
  trendLabel?: string;
  icon: React.ElementType;
  iconBg?: string;
  iconColor?: string;
  variant?: 'default' | 'alert' | 'success' | 'warning';
  className?: string;
}

export default function MetricCard({
  label,
  value,
  subValue,
  trend,
  trendLabel,
  icon: Icon,
  iconBg = 'bg-amber-100',
  iconColor = 'text-amber-600',
  variant = 'default',
  className = '',
}: MetricCardProps) {
  const variantStyles = {
    default: 'bg-white border-slate-200',
    alert: 'bg-red-50 border-red-200',
    success: 'bg-green-50 border-green-200',
    warning: 'bg-amber-50 border-amber-200',
  };

  const trendPositive = trend !== undefined && trend > 0;
  const trendNegative = trend !== undefined && trend < 0;

  return (
    <div className={`rounded-xl border p-4 shadow-card ${variantStyles[variant]} ${className}`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center shrink-0`}>
          <Icon size={20} className={iconColor} />
        </div>
        {trend !== undefined && (
          <div
            className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full
              ${trendPositive ? 'bg-green-100 text-green-700' : trendNegative ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}
            `}
          >
            {trendPositive ? <TrendingUp size={11} /> : trendNegative ? <TrendingDown size={11} /> : <Minus size={11} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-2xl font-bold text-slate-900 tabular-nums leading-tight">{value}</p>
      {subValue && <p className="text-xs text-slate-500 mt-1">{subValue}</p>}
      {trendLabel && <p className="text-xs text-slate-400 mt-1">{trendLabel}</p>}
    </div>
  );
}