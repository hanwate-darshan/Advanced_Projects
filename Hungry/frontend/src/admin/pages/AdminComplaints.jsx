import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FaCircleExclamation,
  FaCircleCheck,
  FaClock,
  FaMessage,
  FaUser,
  FaReceipt,
  FaRotateLeft
} from 'react-icons/fa6';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import ConfirmModal from '../components/ConfirmModal';

export default function AdminComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  // Resolve Modal
  const [resolveTarget, setResolveTarget] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [newStatus, setNewStatus] = useState('resolved');
  const [refundAmount, setRefundAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComplaints();
  }, [page, statusFilter, priorityFilter]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/admin/complaints', {
        params: { page, limit: 10, status: statusFilter, priority: priorityFilter },
        withCredentials: true
      });
      if (res.data?.success) {
        setComplaints(res.data.data.complaints);
        setTotalPages(res.data.data.pagination.totalPages);
        setTotalItems(res.data.data.pagination.total);
      }
    } catch (err) {
      console.error('Failed to load complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async () => {
    if (!resolveTarget) return;
    try {
      setSubmitting(true);
      const res = await axios.patch(
        `/api/admin/complaints/${resolveTarget._id}/resolve`,
        {
          status: newStatus,
          resolutionNotes,
          refundAmount: refundAmount ? Number(refundAmount) : 0
        },
        { withCredentials: true }
      );
      if (res.data?.success) {
        setResolveTarget(null);
        setResolutionNotes('');
        setRefundAmount('');
        fetchComplaints();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update complaint');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      key: 'subject',
      label: 'Ticket / Issue',
      render: (c) => (
        <div>
          <div className="font-semibold text-slate-900 dark:text-white text-xs">{c.subject}</div>
          <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{c.description}</p>
        </div>
      )
    },
    {
      key: 'user',
      label: 'Customer',
      render: (c) => (
        <div className="text-xs">
          <div className="font-medium text-slate-800 dark:text-slate-200">{c.user?.fullName || 'User'}</div>
          <div className="text-slate-400">{c.user?.email || ''}</div>
        </div>
      )
    },
    {
      key: 'order',
      label: 'Related Order',
      render: (c) => (
        c.order ? (
          <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
            #{c.order?._id?.slice(-6).toUpperCase()}
          </span>
        ) : (
          <span className="text-xs text-slate-400 italic">General Inquiry</span>
        )
      )
    },
    {
      key: 'priority',
      label: 'Priority',
      render: (c) => <StatusBadge status={c.priority || 'medium'} />
    },
    {
      key: 'status',
      label: 'Resolution',
      render: (c) => <StatusBadge status={c.status} />
    },
    {
      key: 'createdAt',
      label: 'Filed At',
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
          {c.status !== 'closed' && (
            <button
              onClick={() => {
                setResolveTarget(c);
                setNewStatus(c.status === 'open' ? 'investigating' : 'resolved');
              }}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-orange-50 text-orange-700 hover:bg-orange-100 dark:bg-orange-950/40 dark:text-orange-400 transition cursor-pointer"
            >
              Manage Ticket
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
          Complaints & Customer Support Desk
        </h1>
        <p className="text-sm text-slate-500">
          Handle order disputes, quality grievances, delivery delays, and customer compensation
        </p>
      </div>

      <DataTable
        columns={columns}
        data={complaints}
        loading={loading}
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        onPageChange={setPage}
        filters={
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="open">Open</option>
              <option value="investigating">Investigating</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setPage(1);
              }}
              className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              <option value="">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        }
      />

      {/* Ticket Management Modal */}
      {resolveTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Ticket: {resolveTarget.subject}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Filed by {resolveTarget.user?.fullName} ({resolveTarget.user?.email})
              </p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl text-xs text-slate-700 dark:text-slate-300">
              <span className="font-semibold block text-[10px] uppercase text-slate-400 mb-1">Customer Description</span>
              {resolveTarget.description}
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Update Ticket Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
                >
                  <option value="investigating">Investigating</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Resolution Notes / Internal Remarks
                </label>
                <textarea
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  rows={2}
                  placeholder="e.g., Contacted restaurant, order was replaced or customer compensated..."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Issue Compensation Refund (₹, optional)
                </label>
                <input
                  type="number"
                  min="0"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  placeholder="0"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setResolveTarget(null)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleResolve}
                className="px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-xs transition cursor-pointer"
              >
                {submitting ? 'Updating...' : 'Save Resolution'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
