import React from 'react';

const badgeStyles = {
  // Account Statuses
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20',
  blocked: 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/20',
  suspended: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/20',
  deactivated: 'bg-gray-100 text-gray-700 border-gray-200 ring-gray-400/20',

  // Approval Statuses
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20',
  pending: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/20',
  rejected: 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/20',

  // Order Statuses
  preparing: 'bg-sky-50 text-sky-700 border-sky-200 ring-sky-500/20',
  'out of delivery': 'bg-indigo-50 text-indigo-700 border-indigo-200 ring-indigo-500/20',
  delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20',
  cancelled: 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/20',

  // Payment Statuses
  paid: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20',
  unpaid: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/20',
  failed: 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/20',

  // Priorities
  low: 'bg-gray-100 text-gray-700 border-gray-200',
  medium: 'bg-sky-50 text-sky-700 border-sky-200',
  high: 'bg-amber-50 text-amber-700 border-amber-200',
  urgent: 'bg-rose-50 text-rose-700 border-rose-200'
};

export default function StatusBadge({ status, type }) {
  const normalized = (status || '').toString().toLowerCase();
  const style = badgeStyles[normalized] || 'bg-gray-100 text-gray-700 border-gray-200';

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize border ${style}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {status || 'Unknown'}
    </span>
  );
}
