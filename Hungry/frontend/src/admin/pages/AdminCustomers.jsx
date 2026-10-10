import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUserSlash, FaUserCheck, FaEnvelope, FaPhone } from 'react-icons/fa6';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import ConfirmModal from '../components/ConfirmModal';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Block/unblock modal state
  const [actionUser, setActionUser] = useState(null);
  const [blockReason, setBlockReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, [page, search, statusFilter]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/admin/customers', {
        params: { page, limit: 10, search, status: statusFilter },
        withCredentials: true
      });
      if (res.data?.success) {
        setCustomers(res.data.data.customers);
        setTotalPages(res.data.data.pagination.totalPages);
        setTotalItems(res.data.data.pagination.total);
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBlock = async () => {
    if (!actionUser) return;
    try {
      setSubmitting(true);
      const willBlock = actionUser.accountStatus !== 'blocked';
      const res = await axios.patch(
        `/api/admin/users/${actionUser._id}/block`,
        { block: willBlock, reason: blockReason },
        { withCredentials: true }
      );
      if (res.data?.success) {
        setActionUser(null);
        setBlockReason('');
        fetchCustomers();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user status');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      key: 'fullName',
      label: 'Customer Name',
      render: (c) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-orange-100 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-800 flex items-center justify-center font-bold text-orange-600 dark:text-orange-400 text-xs">
            {c.fullName ? c.fullName.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <div className="font-semibold text-slate-900 dark:text-white">{c.fullName}</div>
            <div className="text-xs text-slate-400 flex items-center gap-1">
              <FaEnvelope className="text-[10px]" />
              <span>{c.email}</span>
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'mobile',
      label: 'Contact',
      render: (c) => (
        <div className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
          <FaPhone className="text-slate-400 text-[10px]" />
          <span>{c.mobile || 'Not provided'}</span>
        </div>
      )
    },
    {
      key: 'accountStatus',
      label: 'Account Status',
      render: (c) => <StatusBadge status={c.accountStatus || 'active'} />
    },
    {
      key: 'createdAt',
      label: 'Joined',
      render: (c) => (
        <span className="text-xs text-slate-400">
          {new Date(c.createdAt).toLocaleDateString()}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      className: 'text-right',
      render: (c) => (
        <div className="flex items-center justify-end gap-2">
          {c.accountStatus === 'blocked' ? (
            <button
              onClick={() => setActionUser(c)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-400 transition flex items-center gap-1.5 cursor-pointer"
            >
              <FaUserCheck className="text-xs" />
              <span>Unblock</span>
            </button>
          ) : (
            <button
              onClick={() => setActionUser(c)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/50 dark:text-rose-400 transition flex items-center gap-1.5 cursor-pointer"
            >
              <FaUserSlash className="text-xs" />
              <span>Block Account</span>
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Customer Accounts
        </h1>
        <p className="text-sm text-slate-500">
          Manage registered diners, view profiles, and enforce access restrictions
        </p>
      </div>

      <DataTable
        columns={columns}
        data={customers}
        loading={loading}
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        onPageChange={setPage}
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        searchPlaceholder="Search customer by name, email, or mobile..."
        filters={
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
          </select>
        }
      />

      {/* Block/Unblock Confirmation Modal */}
      {actionUser && (
        <ConfirmModal
          isOpen={!!actionUser}
          title={
            actionUser.accountStatus === 'blocked'
              ? `Unblock Customer Account`
              : `Block Customer Account`
          }
          message={
            actionUser.accountStatus === 'blocked'
              ? `Are you sure you want to restore full access for ${actionUser.fullName}? They will be able to place orders again.`
              : `Are you sure you want to suspend ${actionUser.fullName}? They will be blocked from logging in or placing orders.`
          }
          confirmLabel={
            actionUser.accountStatus === 'blocked' ? 'Unblock User' : 'Confirm Suspension'
          }
          variant={actionUser.accountStatus === 'blocked' ? 'success' : 'danger'}
          isLoading={submitting}
          onConfirm={handleToggleBlock}
          onClose={() => {
            setActionUser(null);
            setBlockReason('');
          }}
        >
          {actionUser.accountStatus !== 'blocked' && (
            <div className="mt-4">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Reason for suspension (optional)
              </label>
              <textarea
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                rows={2}
                placeholder="e.g., Fraudulent payment chargeback, multiple fake orders..."
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>
          )}
        </ConfirmModal>
      )}
    </div>
  );
}
