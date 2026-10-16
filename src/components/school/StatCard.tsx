import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  variant?: 'brand' | 'success' | 'warning' | 'error' | 'info';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  variant = 'brand',
}) => {
  const colorMap = {
    brand: 'bg-brand-50 text-brand-500 dark:bg-brand-500/15 dark:text-brand-400',
    success: 'bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500',
    warning: 'bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-orange-400',
    error: 'bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500',
    info: 'bg-blue-light-50 text-blue-light-500 dark:bg-blue-light-500/15 dark:text-blue-light-400',
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {title}
          </span>
          <h4 className="mt-2 text-2xl font-bold text-gray-800 dark:text-white/90">
            {value}
          </h4>
          {subtitle && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {subtitle}
            </p>
          )}
        </div>
        <div
          className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${colorMap[variant]}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
