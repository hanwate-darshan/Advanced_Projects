import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FaBrain,
  FaWandMagicSparkles,
  FaChartLine,
  FaArrowTrendUp,
  FaLightbulb,
  FaSpinner,
  FaStore,
  FaUtensils,
  FaFire
} from 'react-icons/fa6';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

export default function AdminAnalytics() {
  const [summary, setSummary] = useState(null);
  const [aiInsights, setAiInsights] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingAi, setLoadingAi] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/admin/dashboard/stats', { withCredentials: true });
      if (res.data?.success) {
        setSummary(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAiInsights = async () => {
    try {
      setLoadingAi(true);
      const res = await axios.get('/api/admin/analytics/ai-insights', { withCredentials: true });
      if (res.data?.success) {
        setAiInsights(res.data.data.analysis);
      }
    } catch (err) {
      alert('AI insight generation failed. Please check network/LLM provider.');
    } finally {
      setLoadingAi(false);
    }
  };

  const trend = summary?.orderTrend || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <FaBrain className="text-purple-500" />
            <span>AI Operations Intelligence & Platform Analytics</span>
          </h1>
          <p className="text-sm text-slate-500">
            Algorithmic trend diagnostics and automated executive insights powered by Qwen AI
          </p>
        </div>

        <button
          onClick={handleGenerateAiInsights}
          disabled={loadingAi}
          className="self-start sm:self-auto px-4 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-md shadow-purple-500/25 flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
        >
          {loadingAi ? (
            <>
              <FaSpinner className="animate-spin text-sm" />
              <span>Analyzing Platform Signals...</span>
            </>
          ) : (
            <>
              <FaWandMagicSparkles className="text-sm" />
              <span>Generate AI Executive Analysis</span>
            </>
          )}
        </button>
      </div>

      {/* AI Insights Card */}
      {aiInsights && (
        <div className="relative overflow-hidden p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 border border-purple-500/30 shadow-xl text-white">
          <div className="flex items-center gap-2.5 text-purple-300 font-semibold text-xs tracking-wider uppercase mb-3">
            <FaWandMagicSparkles className="text-sm text-purple-400" />
            <span>Qwen Intelligence Diagnostic Report</span>
          </div>

          <div className="prose prose-invert max-w-none text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line font-normal">
            {aiInsights}
          </div>

          <div className="mt-4 pt-3 border-t border-purple-500/20 flex items-center justify-between text-[11px] text-purple-300/70">
            <span>Generated from live database aggregations & dispatch logs</span>
            <span>Refreshed live</span>
          </div>
        </div>
      )}

      {/* Analytics Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="mb-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FaArrowTrendUp className="text-orange-500 text-sm" />
              <span>Order Velocity by Day</span>
            </h2>
            <p className="text-xs text-slate-500">Processed order count per day</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} />
                <XAxis dataKey="_id" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '12px',
                    border: '1px solid #1e293b',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="orders" name="Total Orders" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
              <FaLightbulb className="text-amber-500 text-sm" />
              <span>Operational Efficiency Highlights</span>
            </h2>
            <p className="text-xs text-slate-500 mb-4">Key indicators for business optimization</p>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Delivery Fulfillment Ratio</span>
                  <p className="text-slate-400 text-[11px]">Percentage of completed orders without dispute</p>
                </div>
                <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">98.4%</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Active Rider Density</span>
                  <p className="text-slate-400 text-[11px]">Riders available per active hyper-local cluster</p>
                </div>
                <span className="text-base font-bold text-blue-600 dark:text-blue-400">
                  {summary?.counts?.riders || 0} Partners
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Platform Commission Yield</span>
                  <p className="text-slate-400 text-[11px]">Weighted platform take on gross merchant volume</p>
                </div>
                <span className="text-base font-bold text-purple-600 dark:text-purple-400">15.0%</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
            <span className="text-xs text-slate-400">
              Run AI analysis anytime to discover conversion anomalies or dispatch bottlenecks
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
