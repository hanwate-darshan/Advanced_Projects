import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FaClockRotateLeft,
  FaShieldHalved,
  FaUser,
  FaNetworkWired
} from 'react-icons/fa6';
import DataTable from '../components/DataTable';

const ACTION_COLORS = {
  OWNER_APPROVED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400',
  OWNER_REJECTED: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-400',
  RIDER_APPROVED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400',
  RIDER_REJECTED: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-400',
  USER_BLOCKED: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-400',
  USER_UNBLOCKED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400',
  SHOP_SUSPENDED: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400',
  SETTINGS_UPDATED: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-400',
  BROADCAST_SENT: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-400'
};

export default function AdminActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    fetchLogs();
  }, [page]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/admin/logs', {
        params: { page, limit: 15 },
        withCredentials: true
      });
      if (res.data?.success) {
        setLogs(res.data.data.logs);
        setTotalPages(res.data.data.pagination.totalPages);
        setTotalItems(res.data.data.pagination.total);
      }
    } catch (err) {
      console.error('Failed to load activity logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      key: 'action',
      label: 'Security Action',
      render: (l) => (
        <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-mono font-bold tracking-tight uppercase ${
          ACTION_COLORS[l.action] || 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
        }`}>
          {l.action}
        </span>
      )
    },
    {
      key: 'module',
      label: 'Target Subsystem',
      render: (l) => (
        <span className="text-xs font-semibold uppercase text-slate-600 dark:text-slate-400">
          {l.module || 'SYSTEM'}
        </span>
      )
    },
    {
      key: 'details',
      label: 'Audit Trace & Metadata',
      render: (l) => (
        <div className="text-xs text-slate-600 dark:text-slate-300 font-mono max-w-md truncate">
          {typeof l.details === 'object' ? JSON.stringify(l.details) : l.details || 'No additional parameters'}
        </div>
      )
    },
    {
      key: 'admin',
      label: 'Operator',
      render: (l) => (
        <div className="text-xs">
          <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1">
            <FaUser className="text-[10px] text-slate-400" />
            <span>{l.admin?.fullName || 'Super Admin'}</span>
          </div>
          <div className="text-[11px] text-slate-400">{l.admin?.email || ''}</div>
        </div>
      )
    },
    {
      key: 'ipAddress',
      label: 'Client IP',
      render: (l) => (
        <span className="font-mono text-xs text-slate-500 flex items-center gap-1">
          <FaNetworkWired className="text-[10px]" />
          <span>{l.ipAddress || '127.0.0.1'}</span>
        </span>
      )
    },
    {
      key: 'createdAt',
      label: 'Timestamp',
      render: (l) => (
        <span className="text-xs text-slate-400">
          {new Date(l.createdAt).toLocaleString()}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <FaClockRotateLeft className="text-orange-500" />
          <span>Security Audit & Activity Logs</span>
        </h1>
        <p className="text-sm text-slate-500">
          Immutable audit trail capturing all administrative actions, merchant approvals, blocks, and settings adjustments
        </p>
      </div>

      <DataTable
        columns={columns}
        data={logs}
        loading={loading}
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        onPageChange={setPage}
      />
    </div>
  );
}
