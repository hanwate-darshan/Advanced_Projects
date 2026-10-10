import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import adminApi from '../api';
import {
  FaReceipt,
  FaMoneyBillTrendUp,
  FaUsers,
  FaMotorcycle,
  FaStore,
  FaCircleExclamation,
  FaClockRotateLeft,
  FaArrowRight,
  FaCircleCheck,
  FaSpinner
} from 'react-icons/fa6';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';

const STATUS_COLORS = {
  delivered: '#10b981',
  cancelled: '#f43f5e',
  pending: '#f59e0b',
  preparing: '#3b82f6',
  out_for_delivery: '#8b5cf6'
};

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/admin/dashboard/stats', { withCredentials: true });
      if (res.data?.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <FaSpinner className="w-8 h-8 text-orange-500 animate-spin" />
        <span className="text-sm font-medium text-slate-500">Loading operations overview...</span>
      </div>
    );
  }

  const counts = data?.counts || {};
  const revenue = data?.revenue || {};
  const pending = data?.pending || {};
  const trend = data?.orderTrend || [];
  const statusDist = data?.statusDistribution || [];
  const recentOrders = data?.recentOrders || [];

  const pieData = statusDist.map(item => ({
    name: item._id?.replace(/_/g, ' ') || 'Unknown',
    value: item.count,
    color: STATUS_COLORS[item._id] || '#94a3b8'
  }));

  return (
    <div className="space-y-6">
      {/* Page Title & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Operations Command Center
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Real-time platform metrics, dispatch health, and financial activity
          </p>
        </div>
        <button
          onClick={fetchDashboard}
          className="self-start sm:self-auto px-4 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition cursor-pointer shadow-xs"
        >
          Refresh Live Data
        </button>
      </div>

      {/* Action Required Banner if pending items exist */}
      {(pending.restaurantOwners > 0 || pending.deliveryRiders > 0 || pending.complaints > 0) && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <FaCircleExclamation className="text-xl text-amber-500 flex-shrink-0" />
            <div className="text-sm">
              <span className="font-semibold">Attention Required: </span>
              {pending.restaurantOwners > 0 && (
                <span className="mr-3">{pending.restaurantOwners} Restaurant Owner(s) pending approval</span>
              )}
              {pending.deliveryRiders > 0 && (
                <span className="mr-3">{pending.deliveryRiders} Rider(s) awaiting verification</span>
              )}
              {pending.complaints > 0 && (
                <span>{pending.complaints} Open complaint(s)</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {pending.restaurantOwners > 0 && (
              <Link
                to="/admin/owners"
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold transition"
              >
                Review Owners
              </Link>
            )}
            {pending.deliveryRiders > 0 && (
              <Link
                to="/admin/riders"
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold transition"
              >
                Review Riders
              </Link>
            )}
            {pending.complaints > 0 && (
              <Link
                to="/admin/complaints"
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold transition"
              >
                View Complaints
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Gross Merchandise Value"
          value={`₹${(revenue.totalGmv || 0).toLocaleString('en-IN')}`}
          subtitle="Total platform order value"
          icon={FaMoneyBillTrendUp}
          color="green"
        />
        <StatCard
          title="Platform Net Cut"
          value={`₹${(revenue.platformNet || 0).toLocaleString('en-IN')}`}
          subtitle="Commissions + platform fees"
          icon={FaReceipt}
          color="purple"
        />
        <StatCard
          title="Total Orders"
          value={counts.totalOrders || 0}
          subtitle={`${counts.activeOrders || 0} currently active`}
          badge={counts.activeOrders > 0 ? `${counts.activeOrders} active` : null}
          badgeType="positive"
          icon={FaReceipt}
          color="orange"
        />
        <StatCard
          title="Active Riders"
          value={counts.riders || 0}
          subtitle={`${counts.shops || 0} active restaurants`}
          icon={FaMotorcycle}
          color="blue"
        />
      </div>

      {/* Secondary Quick Counts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl">
          <p className="text-xs text-slate-500">Customers</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{counts.customers || 0}</p>
        </div>
        <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl">
          <p className="text-xs text-slate-500">Restaurant Owners</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{counts.owners || 0}</p>
        </div>
        <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl">
          <p className="text-xs text-slate-500">Listed Shops</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{counts.shops || 0}</p>
        </div>
        <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl">
          <p className="text-xs text-slate-500">Avg Delivery Ticket</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            ₹{counts.totalOrders > 0 ? Math.round((revenue.totalGmv || 0) / counts.totalOrders) : 0}
          </p>
        </div>
      </div>

      {/* Visual Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Area Chart (2 Cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Revenue & Orders (Last 7 Days)</h2>
              <p className="text-xs text-slate-500">Daily processed volume and sales</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} />
                <XAxis dataKey="_id" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <Tooltip
                  formatter={(val, name) => [
                    name === 'sales' ? `₹${val.toLocaleString()}` : val,
                    name === 'sales' ? 'Revenue' : 'Orders'
                  ]}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '12px',
                    border: '1px solid #1e293b',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Area type="monotone" dataKey="sales" stroke="#f97316" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Status Distribution Donut (1 Col) */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col">
          <div className="mb-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Order Status Mix</h2>
            <p className="text-xs text-slate-500">Current lifecycle distribution</p>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '8px',
                    border: '1px solid #1e293b',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs">
            {pieData.map((entry) => (
              <div key={entry.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-slate-600 dark:text-slate-400 capitalize truncate">{entry.name}:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders Preview */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Recent Orders</h2>
            <p className="text-xs text-slate-500">Live feed of orders placed across Hungry</p>
          </div>
          <Link
            to="/admin/orders"
            className="text-xs font-semibold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <FaArrowRight className="text-[10px]" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/40 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">Order ID</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Shop</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-xs text-slate-400">
                    No orders placed yet.
                  </td>
                </tr>
              ) : (
                recentOrders.map((ord) => (
                  <tr key={ord._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-slate-900 dark:text-white">
                      #{ord._id?.slice(-6).toUpperCase()}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {ord.user?.fullName || 'Guest'}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {ord.shop?.name || ord.shopOrders?.[0]?.shop?.name || 'Restaurant'}
                    </td>
                    <td className="px-4 py-3 text-xs font-semibold text-slate-900 dark:text-white">
                      ₹{ord.totalAmount}
                    </td>
                    <td className="px-4 py-3 text-xs uppercase font-medium">
                      {ord.paymentMethod || 'COD'}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={ord.status || ord.shopOrders?.[0]?.status || 'pending'} />
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">
                      {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
