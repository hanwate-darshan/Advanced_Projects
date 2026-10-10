import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FaCreditCard,
  FaMoneyBillWave,
  FaRotateLeft,
  FaShieldHalved,
  FaCircleCheck,
  FaTriangleExclamation
} from 'react-icons/fa6';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import ConfirmModal from '../components/ConfirmModal';

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Refund modal
  const [refundTarget, setRefundTarget] = useState(null);
  const [refundReason, setRefundReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, [page, search, methodFilter, statusFilter]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/admin/payments', {
        params: {
          page,
          limit: 10,
          search,
          paymentMethod: methodFilter,
          paymentStatus: statusFilter
        },
        withCredentials: true
      });
      if (res.data?.success) {
        setPayments(res.data.data.payments);
        setTotalPages(res.data.data.pagination.totalPages);
        setTotalItems(res.data.data.pagination.total);
      }
    } catch (err) {
      console.error('Failed to load payments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefund = async () => {
    if (!refundTarget) return;
    try {
      setSubmitting(true);
      const res = await axios.post(
        `/api/admin/payments/${refundTarget._id}/refund`,
        { reason: refundReason },
        { withCredentials: true }
      );
      if (res.data?.success) {
        setRefundTarget(null);
        setRefundReason('');
        fetchPayments();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to process refund');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      key: '_id',
      label: 'Order ID',
      render: (p) => (
        <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
          #{p._id.slice(-6).toUpperCase()}
        </span>
      )
    },
    {
      key: 'user',
      label: 'Customer',
      render: (p) => (
        <div className="text-xs">
          <div className="font-medium text-slate-900 dark:text-white">{p.user?.fullName || 'Guest'}</div>
          <div className="text-slate-400">{p.user?.email || p.user?.mobile || ''}</div>
        </div>
      )
    },
    {
      key: 'totalAmount',
      label: 'Amount',
      render: (p) => (
        <span className="text-xs font-bold text-slate-900 dark:text-white">
          ₹{p.totalAmount}
        </span>
      )
    },
    {
      key: 'paymentMethod',
      label: 'Method',
      render: (p) => (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
          {p.paymentMethod === 'online' ? <FaCreditCard className="text-blue-500" /> : <FaMoneyBillWave className="text-emerald-500" />}
          <span>{p.paymentMethod}</span>
        </span>
      )
    },
    {
      key: 'razorpayPaymentId',
      label: 'Gateway Ref ID',
      render: (p) => (
        <span className="font-mono text-[11px] text-slate-500">
          {p.razorpayPaymentId || 'COD_TRANSACTION'}
        </span>
      )
    },
    {
      key: 'paymentStatus',
      label: 'Payment Status',
      render: (p) => {
        const isPaid = p.payment;
        return (
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
            isPaid ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
          }`}>
            {isPaid ? <FaCircleCheck className="text-[10px]" /> : <FaTriangleExclamation className="text-[10px]" />}
            <span>{isPaid ? 'Settled' : 'Uncollected'}</span>
          </span>
        );
      }
    },
    {
      key: 'actions',
      label: 'Actions',
      className: 'text-right',
      render: (p) => (
        <div className="flex items-center justify-end gap-2">
          {p.payment && p.paymentMethod === 'online' && (
            <button
              onClick={() => setRefundTarget(p)}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/50 dark:text-rose-400 transition flex items-center gap-1 cursor-pointer"
              title="Issue full refund"
            >
              <FaRotateLeft className="text-xs" />
              <span>Refund</span>
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
          Payment & Transaction Auditing
        </h1>
        <p className="text-sm text-slate-500">
          Track Razorpay gateway clearances, Cash on Delivery receipts, and handle customer refund requests
        </p>
      </div>

      <DataTable
        columns={columns}
        data={payments}
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
        searchPlaceholder="Search order ID or gateway ref..."
        filters={
          <div className="flex items-center gap-2">
            <select
              value={methodFilter}
              onChange={(e) => {
                setMethodFilter(e.target.value);
                setPage(1);
              }}
              className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              <option value="">All Payment Types</option>
              <option value="online">Online / Razorpay</option>
              <option value="cod">Cash on Delivery</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="paid">Settled</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        }
      />

      {/* Refund Modal */}
      {refundTarget && (
        <ConfirmModal
          isOpen={!!refundTarget}
          title="Process Transaction Refund"
          message={`Are you sure you want to refund ₹${refundTarget.totalAmount} for order #${refundTarget._id.slice(-6).toUpperCase()}? This will update the order status and trigger a reversal.`}
          confirmLabel="Execute Refund"
          variant="danger"
          isLoading={submitting}
          onConfirm={handleRefund}
          onClose={() => {
            setRefundTarget(null);
            setRefundReason('');
          }}
        >
          <div className="mt-3">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Refund Justification
            </label>
            <input
              type="text"
              required
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              placeholder="e.g., Cold food delivered / item missing / wrong order"
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
          </div>
        </ConfirmModal>
      )}
    </div>
  );
}
