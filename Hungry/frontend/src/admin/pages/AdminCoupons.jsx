import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FaTicket,
  FaPlus,
  FaPercent,
  FaCoins,
  FaTrashCan,
  FaCheck,
  FaXmark
} from 'react-icons/fa6';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import ConfirmModal from '../components/ConfirmModal';

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Create modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: '',
    minOrderValue: 0,
    maxDiscount: '',
    usageLimit: 100,
    validUntil: ''
  });
  const [submitting, setSubmitting] = useState(false);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    fetchCoupons();
  }, [page]);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/admin/coupons', {
        params: { page, limit: 10 },
        withCredentials: true
      });
      if (res.data?.success) {
        setCoupons(res.data.data.coupons);
        setTotalPages(res.data.data.pagination.totalPages);
        setTotalItems(res.data.data.pagination.total);
      }
    } catch (err) {
      console.error('Failed to load coupons:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await axios.post('/api/admin/coupons', formData, { withCredentials: true });
      if (res.data?.success) {
        setShowCreateModal(false);
        setFormData({
          code: '',
          discountType: 'percentage',
          discountValue: '',
          minOrderValue: 0,
          maxDiscount: '',
          usageLimit: 100,
          validUntil: ''
        });
        fetchCoupons();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create coupon');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (coupon) => {
    try {
      const res = await axios.patch(
        `/api/admin/coupons/${coupon._id}/toggle`,
        {},
        { withCredentials: true }
      );
      if (res.data?.success) {
        fetchCoupons();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle status');
    }
  };

  const handleDeleteCoupon = async () => {
    if (!deleteTarget) return;
    try {
      setSubmitting(true);
      const res = await axios.delete(`/api/admin/coupons/${deleteTarget._id}`, {
        withCredentials: true
      });
      if (res.data?.success) {
        setDeleteTarget(null);
        fetchCoupons();
      }
    } catch (err) {
      alert('Failed to delete coupon');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      key: 'code',
      label: 'Promo Code',
      render: (c) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-950/50 flex items-center justify-center text-orange-600 dark:text-orange-400">
            <FaTicket className="text-xs" />
          </div>
          <div>
            <span className="font-mono text-xs font-bold text-slate-900 dark:text-white tracking-wider">
              {c.code}
            </span>
          </div>
        </div>
      )
    },
    {
      key: 'discount',
      label: 'Benefit',
      render: (c) => (
        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `₹${c.discountValue} FLAT OFF`}
        </span>
      )
    },
    {
      key: 'minOrderValue',
      label: 'Min Order',
      render: (c) => <span className="text-xs text-slate-600 dark:text-slate-300">₹{c.minOrderValue || 0}</span>
    },
    {
      key: 'usedCount',
      label: 'Redemptions',
      render: (c) => (
        <span className="text-xs text-slate-600 dark:text-slate-300">
          {c.usedCount || 0} / {c.usageLimit || '∞'}
        </span>
      )
    },
    {
      key: 'validUntil',
      label: 'Expiry',
      render: (c) => (
        <span className="text-xs text-slate-400">
          {c.validUntil ? new Date(c.validUntil).toLocaleDateString() : 'No expiry'}
        </span>
      )
    },
    {
      key: 'isActive',
      label: 'Active',
      render: (c) => (
        <button
          onClick={() => handleToggleStatus(c)}
          className={`px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition ${
            c.isActive
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400'
              : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
          }`}
        >
          {c.isActive ? 'Active' : 'Disabled'}
        </button>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      className: 'text-right',
      render: (c) => (
        <button
          onClick={() => setDeleteTarget(c)}
          className="p-1.5 text-slate-400 hover:text-rose-600 transition cursor-pointer"
          title="Delete coupon"
        >
          <FaTrashCan className="text-xs" />
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Promotional Coupons & Deals
          </h1>
          <p className="text-sm text-slate-500">
            Create discount vouchers, set minimum cart value thresholds, and monitor campaign redemptions
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="self-start sm:self-auto px-4 py-2 text-xs font-semibold rounded-xl bg-orange-600 hover:bg-orange-700 text-white transition flex items-center gap-2 cursor-pointer shadow-sm shadow-orange-500/20"
        >
          <FaPlus className="text-xs" />
          <span>Create Voucher</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={coupons}
        loading={loading}
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        onPageChange={setPage}
      />

      {/* Create Coupon Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Create Promotional Coupon
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <FaXmark className="text-lg" />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Coupon Code (uppercase)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., HUNGRY50"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full uppercase font-mono p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Discount Type
                  </label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Discount Value
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder={formData.discountType === 'percentage' ? '20' : '50'}
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Min Order Value (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="199"
                    value={formData.minOrderValue}
                    onChange={(e) => setFormData({ ...formData, minOrderValue: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Max Discount Cap (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="100"
                    value={formData.maxDiscount}
                    onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Total Usage Limit
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Valid Until Date
                  </label>
                  <input
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-xs transition cursor-pointer"
                >
                  {submitting ? 'Creating...' : 'Publish Voucher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <ConfirmModal
          isOpen={!!deleteTarget}
          title="Delete Promo Voucher"
          message={`Are you sure you want to permanently delete coupon "${deleteTarget.code}"?`}
          confirmLabel="Delete Coupon"
          variant="danger"
          isLoading={submitting}
          onConfirm={handleDeleteCoupon}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
