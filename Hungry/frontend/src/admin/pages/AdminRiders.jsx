import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FaMotorcycle,
  FaCheck,
  FaXmark,
  FaUserSlash,
  FaUserCheck,
  FaPhone,
  FaEnvelope,
  FaLocationDot
} from 'react-icons/fa6';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import ConfirmModal from '../components/ConfirmModal';

export default function AdminRiders() {
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [search, setSearch] = useState('');
  const [approvalFilter, setApprovalFilter] = useState('');

  // Approve / Reject modal
  const [approvalTarget, setApprovalTarget] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Block modal
  const [blockTarget, setBlockTarget] = useState(null);

  useEffect(() => {
    fetchRiders();
  }, [page, search, approvalFilter]);

  const fetchRiders = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/admin/riders', {
        params: { page, limit: 10, search, approvalStatus: approvalFilter },
        withCredentials: true
      });
      if (res.data?.success) {
        setRiders(res.data.data.riders);
        setTotalPages(res.data.data.pagination.totalPages);
        setTotalItems(res.data.data.pagination.total);
      }
    } catch (err) {
      console.error('Error fetching riders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprovalAction = async () => {
    if (!approvalTarget) return;
    try {
      setSubmitting(true);
      const { rider, action } = approvalTarget;
      const res = await axios.patch(
        `/api/admin/riders/${rider._id}/approve`,
        { action },
        { withCredentials: true }
      );
      if (res.data?.success) {
        setApprovalTarget(null);
        fetchRiders();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update rider status');
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
        fetchRiders();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update rider account');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      key: 'fullName',
      label: 'Delivery Partner',
      render: (r) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center font-bold text-blue-700 dark:text-blue-400 text-xs">
            <FaMotorcycle className="text-sm" />
          </div>
          <div>
            <div className="font-semibold text-slate-900 dark:text-white">{r.fullName}</div>
            <div className="text-xs text-slate-400 flex items-center gap-1">
              <FaEnvelope className="text-[10px]" />
              <span>{r.email}</span>
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'mobile',
      label: 'Contact',
      render: (r) => (
        <div className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
          <FaPhone className="text-slate-400 text-[10px]" />
          <span>{r.mobile || 'N/A'}</span>
        </div>
      )
    },
    {
      key: 'riderStatus',
      label: 'Duty Status',
      render: (r) => <StatusBadge status={r.riderStatus || 'offline'} />
    },
    {
      key: 'approvalStatus',
      label: 'Approval',
      render: (r) => <StatusBadge status={r.approvalStatus || 'approved'} />
    },
    {
      key: 'location',
      label: 'Live GPS',
      render: (r) => {
        const hasCoords = r.location?.coordinates && (r.location.coordinates[0] !== 0 || r.location.coordinates[1] !== 0);
        return (
          <div className="flex items-center gap-1 text-xs">
            <FaLocationDot className={hasCoords ? 'text-emerald-500' : 'text-slate-400'} />
            <span className={hasCoords ? 'text-slate-700 dark:text-slate-200' : 'text-slate-400'}>
              {hasCoords ? `${r.location.coordinates[1].toFixed(3)}, ${r.location.coordinates[0].toFixed(3)}` : 'No GPS Ping'}
            </span>
          </div>
        );
      }
    },
    {
      key: 'actions',
      label: 'Actions',
      className: 'text-right',
      render: (r) => (
        <div className="flex items-center justify-end gap-2">
          {r.approvalStatus === 'pending' && (
            <>
              <button
                onClick={() => setApprovalTarget({ rider: r, action: 'approved' })}
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-400 transition flex items-center gap-1 cursor-pointer"
                title="Approve Rider"
              >
                <FaCheck className="text-xs" />
                <span>Approve</span>
              </button>
              <button
                onClick={() => setApprovalTarget({ rider: r, action: 'rejected' })}
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/50 dark:text-rose-400 transition flex items-center gap-1 cursor-pointer"
                title="Reject Rider"
              >
                <FaXmark className="text-xs" />
                <span>Reject</span>
              </button>
            </>
          )}

          {r.approvalStatus !== 'pending' && (
            <button
              onClick={() => setBlockTarget(r)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1 cursor-pointer ${
                r.accountStatus === 'blocked'
                  ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-400'
                  : 'bg-slate-100 text-slate-700 hover:bg-rose-50 hover:text-rose-700 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              {r.accountStatus === 'blocked' ? (
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
          Delivery Fleet Partners
        </h1>
        <p className="text-sm text-slate-500">
          Verify rider driver applications, monitor duty status, and handle dispatch permissions
        </p>
      </div>

      <DataTable
        columns={columns}
        data={riders}
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
        searchPlaceholder="Search rider by name, phone, or email..."
        filters={
          <select
            value={approvalFilter}
            onChange={(e) => {
              setApprovalFilter(e.target.value);
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

      {approvalTarget && (
        <ConfirmModal
          isOpen={!!approvalTarget}
          title={approvalTarget.action === 'approved' ? 'Approve Delivery Partner' : 'Reject Partner'}
          message={`Are you sure you want to ${approvalTarget.action === 'approved' ? 'grant dispatch rights to' : 'reject application of'} ${approvalTarget.rider.fullName}?`}
          confirmLabel={approvalTarget.action === 'approved' ? 'Approve' : 'Reject'}
          variant={approvalTarget.action === 'approved' ? 'success' : 'danger'}
          isLoading={submitting}
          onConfirm={handleApprovalAction}
          onClose={() => setApprovalTarget(null)}
        />
      )}

      {blockTarget && (
        <ConfirmModal
          isOpen={!!blockTarget}
          title={blockTarget.accountStatus === 'blocked' ? 'Unblock Rider' : 'Block Rider'}
          message={`Are you sure you want to ${blockTarget.accountStatus === 'blocked' ? 'unblock' : 'suspend'} rider ${blockTarget.fullName}? They will not be dispatched new orders.`}
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
