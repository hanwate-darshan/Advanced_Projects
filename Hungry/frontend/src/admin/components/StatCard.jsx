import React from 'react';

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  badge,
  badgeType = 'positive', // 'positive' | 'negative' | 'neutral'
  color = 'orange', // 'orange' | 'blue' | 'green' | 'purple' | 'red'
  onClick
}) {
  const colorMap = {
    orange: {
      bg: 'bg-orange-50 dark:bg-orange-950/30',
      text: 'text-orange-600 dark:text-orange-400',
      border: 'border-orange-100 dark:border-orange-900/30',
      ring: 'group-hover:border-orange-300'
    },
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-950/30',
      text: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-100 dark:border-blue-900/30',
      ring: 'group-hover:border-blue-300'
    },
    green: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
      text: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-100 dark:border-emerald-900/30',
      ring: 'group-hover:border-emerald-300'
    },
    purple: {
      bg: 'bg-purple-50 dark:bg-purple-950/30',
      text: 'text-purple-600 dark:text-purple-400',
      border: 'border-purple-100 dark:border-purple-900/30',
      ring: 'group-hover:border-purple-300'
    },
    red: {
      bg: 'bg-rose-50 dark:bg-rose-950/30',
      text: 'text-rose-600 dark:text-rose-400',
      border: 'border-rose-100 dark:border-rose-900/30',
      ring: 'group-hover:border-rose-300'
    }
  };

  const c = colorMap[color] || colorMap.orange;

  const badgeStyles = {
    positive: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400',
    negative: 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400',
    neutral: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
  };

  return (
    <div
      onClick={onClick}
      className={`group relative p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {value}
            </span>
          </div>
          {(subtitle || badge) && (
            <div className="mt-2 flex items-center gap-2">
              {badge && (
                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${badgeStyles[badgeType] || badgeStyles.neutral}`}>
                  {badge}
                </span>
              )}
              {subtitle && (
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {subtitle}
                </span>
              )}
            </div>
          )}
        </div>

        {Icon && (
          <div className={`p-3 rounded-xl ${c.bg} ${c.text} ${c.border} border transition-transform duration-200 group-hover:scale-110`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  );
}
