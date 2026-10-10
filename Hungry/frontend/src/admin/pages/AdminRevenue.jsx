import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FaMoneyBillTrendUp,
  FaReceipt,
  FaCoins,
  FaStore,
  FaBuildingColumns,
  FaFileInvoiceDollar
} from 'react-icons/fa6';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import StatCard from '../components/StatCard';

export default function AdminRevenue() {
  const [revenueData, setRevenueData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRevenue();
  }, []);

  const fetchRevenue = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/admin/revenue/analytics', { withCredentials: true });
      if (res.data?.success) {
        setRevenueData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load revenue analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const totals = revenueData?.totals || {};
  const shopBreakdown = revenueData?.shopBreakdown || [];

  const chartData = shopBreakdown.slice(0, 8).map(s => ({
    name: s.shopName?.length > 12 ? s.shopName.slice(0, 12) + '...' : s.shopName,
    grossSales: s.grossSales,
    platformCommission: s.commission,
    merchantPayout: s.merchantPayout
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Revenue, Commission & Merchant Payouts
        </h1>
        <p className="text-sm text-slate-500">
          Financial ledger of platform takes, commissions, delivery tariffs, and restaurant settlements
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Gross Merchandise Value"
          value={`₹${(totals.gmv || 0).toLocaleString('en-IN')}`}
          subtitle="Total customer checkout value"
          icon={FaMoneyBillTrendUp}
          color="green"
        />
        <StatCard
          title="Commission Revenue"
          value={`₹${(totals.commission || 0).toLocaleString('en-IN')}`}
          subtitle="Platform take from restaurants"
          icon={FaCoins}
          color="orange"
        />
        <StatCard
          title="Platform Tariffs"
          value={`₹${(totals.platformFees || 0).toLocaleString('en-IN')}`}
          subtitle="Fixed service fees + delivery tariffs"
          icon={FaReceipt}
          color="purple"
        />
        <StatCard
          title="Hungry Net Platform Take"
          value={`₹${(totals.netPlatformRevenue || 0).toLocaleString('en-IN')}`}
          subtitle="Total platform net earnings"
          icon={FaFileInvoiceDollar}
          color="blue"
        />
      </div>

      {/* Revenue Breakdown Chart */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="mb-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Top Restaurants Financial Flow
          </h2>
          <p className="text-xs text-slate-500">
            Gross sales vs Platform commission vs Net merchant payout
          </p>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <Tooltip
                formatter={(val) => `₹${val.toLocaleString()}`}
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderRadius: '12px',
                  border: '1px solid #1e293b',
                  color: '#fff',
                  fontSize: '12px'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="grossSales" name="Gross Sales" fill="#94a3b8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="merchantPayout" name="Merchant Payout" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="platformCommission" name="Hungry Commission" fill="#f97316" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Merchant Settlements Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Restaurant Payout Ledger
            </h2>
            <p className="text-xs text-slate-500">
              Settlements calculated by individual restaurant commission rates
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400">
            {shopBreakdown.length} Restaurants Active
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/40 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">Restaurant</th>
                <th className="px-4 py-3">Orders Settled</th>
                <th className="px-4 py-3">Gross Sales</th>
                <th className="px-4 py-3">Avg Commission %</th>
                <th className="px-4 py-3">Platform Retained</th>
                <th className="px-4 py-3">Net Merchant Due</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {shopBreakdown.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">
                    No order settlement records yet.
                  </td>
                </tr>
              ) : (
                shopBreakdown.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                    <td className="px-4 py-3.5 font-medium text-slate-900 dark:text-white flex items-center gap-2">
                      <FaStore className="text-orange-500 text-xs" />
                      <span>{row.shopName}</span>
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-slate-700 dark:text-slate-200">
                      {row.orderCount}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white">
                      ₹{row.grossSales.toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500">
                      {row.commissionRate}%
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-orange-600 dark:text-orange-400">
                      ₹{row.commission.toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-emerald-600 dark:text-emerald-400">
                      ₹{row.merchantPayout.toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
