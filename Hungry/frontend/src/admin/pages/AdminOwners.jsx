import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FaCheck,
  FaXmark,
  FaUserSlash,
  FaUserCheck,
  FaStore,
  FaEnvelope,
  FaPhone
} from 'react-icons/fa6';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import ConfirmModal from '../components/ConfirmModal';

export default function AdminOwners() {
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [search, setSearch] = useState('');
  const [approvalStatusFilter, setApprovalStatusFilter] = useState('');

  // Approve / Reject Modal
  const [approvalTarget, setApprovalTarget] = useState(null); // { owner, action: 'approved' | 'rejected' }
  const [rejectReason, setRejectReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Block Modal
  const [blockTarget, setBlockTarget] = useState(null);

  useEffect(() => {
    fetchOwners();
  }, [page, search, approvalStatusFilter]);

  const fetchOwners = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/admin/owners', {
        params: { page, limit: 10, search, approvalStatus: approvalStatusFilter },
        withCredentials: true
      });
      if (res.data?.success) {
        setOwners(res.data.data.owners);
        setTotalPages(res.data.data.pagination.totalPages);
        setTotalItems(res.data.data.pagination.total);
      }
    } catch (err) {
      console.error('Error fetching owners:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprovalAction = async () => {
    if (!approvalTarget) return;
    try {
      setSubmitting(true);
      const { owner, action } = approvalTarget;
      const res = await axios.patch(
        `/api/admin/owners/${owner._id}/approve`,
        {
          action,
          reason: action === 'rejected' ? rejectReason : undefined
        },
        { withCredentials: true }
      );
      if (res.data?.success) {
        setApprovalTarget(null);
        setRejectReason('');
        fetchOwners();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update approval status');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleBlock = async () => {
    if (!blockTarget) return;
    try {
      setSubmitting(true);
      const willBlock = blockTarget.accountStatus !== 'blocked';
      const res = await axios.patch(
        `/api/admin/users/${blockTarget._id}/block`,
        { block: willBlock },
        { withCredentials: true }
      );
      if (res.data?.success) {
        setBlockTarget(null);
        fetchOwners();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      key: 'fullName',
      label: 'Owner Info',
      render: (o) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center font-bold text-amber-700 dark:text-amber-400 text-xs">
            {o.fullName ? o.fullName.charAt(0).toUpperCase() : 'O'}
          </div>
          <div>
            <div className="font-semibold text-slate-900 dark:text-white">{o.fullName}</div>
            <div className="text-xs text-slate-400 flex items-center gap-1">
              <FaEnvelope className="text-[10px]" />
              <span>{o.email}</span>
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'shop',
      label: 'Restaurant / Shop',
      render: (o) => (
        o.shop ? (
          <div className="flex items-center gap-2">
            <FaStore className="text-slate-400 text-xs" />
            <div>
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">{o.shop.name}</div>
              <div className="text-[11px] text-slate-400">{o.shop.city}</div>
            </div>
          </div>
        ) : (
          <span className="text-xs text-slate-400 italic">No shop created yet</span>
        )
      )
    },
    {
      key: 'approvalStatus',
      label: 'Approval Status',
      render: (o) => <StatusBadge status={o.approvalStatus || 'approved'} />
    },
    {
      key: 'accountStatus',
      label: 'Account Status',
      render: (o) => <StatusBadge status={o.accountStatus || 'active'} />
    },
    {
      key: 'actions',
      label: 'Actions',
      className: 'text-right',
      render: (o) => (
        <div className="flex items-center justify-end gap-2">
          {o.approvalStatus === 'pending' && (
            <>
              <button
                onClick={() => setApprovalTarget({ owner: o, action: 'approved' })}
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-400 transition flex items-center gap-1 cursor-pointer"
                title="Approve Partner"
              >
                <FaCheck className="text-xs" />
                <span>Approve</span>
              </button>
              <button
                onClick={() => setApprovalTarget({ owner: o, action: 'rejected' })}
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/50 dark:text-rose-400 transition flex items-center gap-1 cursor-pointer"
                title="Reject Partner"
              >
                <FaXmark className="text-xs" />
                <span>Reject</span>
              </button>
            </>
          )}

          {o.approvalStatus !== 'pending' && (
            <button
              onClick={() => setBlockTarget(o)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1 cursor-pointer ${
                o.accountStatus === 'blocked'
                  ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-400'
                  : 'bg-slate-100 text-slate-700 hover:bg-rose-50 hover:text-rose-700 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              {o.accountStatus === 'blocked' ? (
                <>
                  <FaUserCheck className="text-xs" />
                  <span>Unblock</span>
                </>
              ) : (
                <>
                  <FaUserSlash className="text-xs" />
                  <span>Block</span>
                </>
              )}
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
          Restaurant Owners & Verification
        </h1>
        <p className="text-sm text-slate-500">
          Review onboarding merchant applications, grant listing permissions, or suspend accounts
        </p>
      </div>

      <DataTable
        columns={columns}
        data={owners}
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
        searchPlaceholder="Search owner by name, email, or restaurant..."
        filters={
          <select
            value={approvalStatusFilter}
            onChange={(e) => {
              setApprovalStatusFilter(e.target.value);
              setPage(1);
            }}
            className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="">All Approvals</option>
            <option value="pending">Pending Approval</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        }
      />

      {/* Approval / Rejection Modal */}
      {approvalTarget && (
        <ConfirmModal
          isOpen={!!approvalTarget}
          title={
            approvalTarget.action === 'approved'
              ? `Approve Restaurant Owner`
              : `Reject Restaurant Owner Application`
          }
          message={
            approvalTarget.action === 'approved'
              ? `Are you sure you want to approve ${approvalTarget.owner.fullName}? They will receive immediate permissions to publish menus and take live customer orders.`
              : `Specify why you are rejecting the merchant application for ${approvalTarget.owner.fullName}.`
          }
          confirmLabel={
            approvalTarget.action === 'approved' ? 'Grant Approval' : 'Confirm Rejection'
          }
          variant={approvalTarget.action === 'approved' ? 'success' : 'danger'}
          isLoading={submitting}
          onConfirm={handleApprovalAction}
          onClose={() => {
            setApprovalTarget(null);
            setRejectReason('');
          }}
        >
          {approvalTarget.action === 'rejected' && (
            <div className="mt-4">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Reason for Rejection
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                required
                rows={2}
                placeholder="e.g., Incomplete FSSAI license / invalid business documents..."
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>
          )}
        </ConfirmModal>
      )}

      {/* Block Confirmation Modal */}
      {blockTarget && (
        <ConfirmModal
          isOpen={!!blockTarget}
          title={blockTarget.accountStatus === 'blocked' ? 'Unblock Owner' : 'Block Owner'}
          message={`Are you sure you want to ${
            blockTarget.accountStatus === 'blocked' ? 'unblock' : 'suspend'
          } ${blockTarget.fullName}? Their restaurant will also become inactive.`}
          confirmLabel={blockTarget.accountStatus === 'blocked' ? 'Unblock' : 'Confirm Block'}
          variant={blockTarget.accountStatus === 'blocked' ? 'success' : 'danger'}
          isLoading={submitting}
          onConfirm={handleToggleBlock}
          onClose={() => setBlockTarget(null)}
        />
      )}
    </div>
  );
}
