import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FaStore,
  FaPercent,
  FaUtensils,
  FaLocationDot,
  FaBan,
  FaCheck,
  FaXmark,
  FaEye,
  FaPen
} from 'react-icons/fa6';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import ConfirmModal from '../components/ConfirmModal';

export default function AdminRestaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Status toggle modal
  const [statusTarget, setStatusTarget] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Commission modal
  const [commissionTarget, setCommissionTarget] = useState(null);
  const [commissionValue, setCommissionValue] = useState(15);

  // Menu moderation drawer / modal
  const [menuShop, setMenuShop] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loadingMenu, setLoadingMenu] = useState(false);

  useEffect(() => {
    fetchRestaurants();
  }, [page, search, statusFilter]);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/admin/restaurants', {
        params: { page, limit: 10, search, status: statusFilter },
        withCredentials: true
      });
      if (res.data?.success) {
        setRestaurants(res.data.data.restaurants);
        setTotalPages(res.data.data.pagination.totalPages);
        setTotalItems(res.data.data.pagination.total);
      }
    } catch (err) {
      console.error('Error fetching restaurants:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!statusTarget) return;
    try {
      setSubmitting(true);
      const newStatus = statusTarget.status === 'suspended' ? 'active' : 'suspended';
      const res = await axios.patch(
        `/api/admin/restaurants/${statusTarget._id}/status`,
        { status: newStatus },
        { withCredentials: true }
      );
      if (res.data?.success) {
        setStatusTarget(null);
        fetchRestaurants();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update restaurant status');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateCommission = async (e) => {
    e.preventDefault();
    if (!commissionTarget) return;
    try {
      setSubmitting(true);
      const res = await axios.patch(
        `/api/admin/restaurants/${commissionTarget._id}/commission`,
        { commissionRate: Number(commissionValue) },
        { withCredentials: true }
      );
      if (res.data?.success) {
        setCommissionTarget(null);
        fetchRestaurants();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update commission rate');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenMenu = async (shop) => {
    setMenuShop(shop);
    setLoadingMenu(true);
    try {
      const res = await axios.get(`/api/admin/restaurants/${shop._id}/items`, {
        withCredentials: true
      });
      if (res.data?.success) {
        setMenuItems(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load menu items:', err);
    } finally {
      setLoadingMenu(false);
    }
  };

  const handleModerateItem = async (itemId, field, currentVal) => {
    try {
      const update = { [field]: !currentVal };
      const res = await axios.patch(`/api/admin/items/${itemId}/moderate`, update, {
        withCredentials: true
      });
      if (res.data?.success) {
        setMenuItems((prev) =>
          prev.map((it) => (it._id === itemId ? { ...it, ...update } : it))
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update menu item');
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Restaurant',
      render: (r) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950/60 overflow-hidden flex items-center justify-center flex-shrink-0 border border-orange-200 dark:border-orange-800">
            {r.image ? (
              <img src={r.image} alt={r.name} className="w-full h-full object-cover" />
            ) : (
              <FaStore className="text-orange-500" />
            )}
          </div>
          <div>
            <div className="font-semibold text-slate-900 dark:text-white">{r.name}</div>
            <div className="text-xs text-slate-400 flex items-center gap-1">
              <FaLocationDot className="text-[10px]" />
              <span>{r.city || 'Location unlisted'}</span>
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'owner',
      label: 'Owner Account',
      render: (r) => (
        <div className="text-xs">
          <div className="font-medium text-slate-800 dark:text-slate-200">{r.owner?.fullName || 'N/A'}</div>
          <div className="text-slate-400">{r.owner?.email || ''}</div>
        </div>
      )
    },
    {
      key: 'commissionRate',
      label: 'Commission %',
      render: (r) => (
        <button
          onClick={() => {
            setCommissionTarget(r);
            setCommissionValue(r.commissionRate ?? 15);
          }}
          className="group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-orange-50 dark:bg-slate-800 dark:hover:bg-slate-750 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-orange-600 transition cursor-pointer"
          title="Click to override commission"
        >
          <span>{r.commissionRate ?? 15}%</span>
          <FaPen className="text-[10px] text-slate-400 group-hover:text-orange-500" />
        </button>
      )
    },
    {
      key: 'status',
      label: 'Listing Status',
      render: (r) => <StatusBadge status={r.status || 'active'} />
    },
    {
      key: 'actions',
      label: 'Actions',
      className: 'text-right',
      render: (r) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => handleOpenMenu(r)}
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/50 dark:text-blue-400 transition flex items-center gap-1 cursor-pointer"
            title="Inspect Menu Items"
          >
            <FaUtensils className="text-xs" />
            <span>Menu ({r.items?.length || 0})</span>
          </button>

          <button
            onClick={() => setStatusTarget(r)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1 cursor-pointer ${
              r.status === 'suspended'
                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-400'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/50 dark:text-rose-400'
            }`}
          >
            {r.status === 'suspended' ? (
              <>
                <FaCheck className="text-xs" />
                <span>Activate</span>
              </>
            ) : (
              <>
                <FaBan className="text-xs" />
                <span>Suspend</span>
              </>
            )}
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Restaurants & Menu Control
        </h1>
        <p className="text-sm text-slate-500">
          Supervise store profiles, override commission rates, inspect food menus, and toggle listings
        </p>
      </div>

      <DataTable
        columns={columns}
        data={restaurants}
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
        searchPlaceholder="Search restaurant by name or city..."
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
            <option value="suspended">Suspended</option>
          </select>
        }
      />

      {/* Suspend Confirmation Modal */}
      {statusTarget && (
        <ConfirmModal
          isOpen={!!statusTarget}
          title={statusTarget.status === 'suspended' ? 'Activate Restaurant' : 'Suspend Restaurant'}
          message={`Are you sure you want to ${
            statusTarget.status === 'suspended' ? 'activate' : 'suspend'
          } "${statusTarget.name}"? Suspended restaurants are hidden from customer search and cannot accept orders.`}
          confirmLabel={statusTarget.status === 'suspended' ? 'Activate' : 'Suspend Restaurant'}
          variant={statusTarget.status === 'suspended' ? 'success' : 'danger'}
          isLoading={submitting}
          onConfirm={handleToggleStatus}
          onClose={() => setStatusTarget(null)}
        />
      )}

      {/* Commission Rate Override Modal */}
      {commissionTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Custom Commission Rate
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Set the platform commission percentage for {commissionTarget.name}
            </p>

            <form onSubmit={handleUpdateCommission} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Commission Percentage (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="50"
                    step="0.5"
                    required
                    value={commissionValue}
                    onChange={(e) => setCommissionValue(e.target.value)}
                    className="w-full text-sm font-semibold p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  />
                  <FaPercent className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCommissionTarget(null)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-xs"
                >
                  {submitting ? 'Updating...' : 'Save Rate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Menu Moderation Modal */}
      {menuShop && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Menu Items: {menuShop.name}
                </h3>
                <p className="text-xs text-slate-500">
                  Moderate dish availability and approval status
                </p>
              </div>
              <button
                onClick={() => setMenuShop(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <FaXmark className="text-lg" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-3">
              {loadingMenu ? (
                <div className="py-12 text-center text-xs text-slate-400">Loading dishes...</div>
              ) : menuItems.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">No dishes listed by this restaurant yet.</div>
              ) : (
                menuItems.map((item) => (
                  <div
                    key={item._id}
                    className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-orange-50 dark:bg-orange-950/30 overflow-hidden flex items-center justify-center border border-slate-200 dark:border-slate-700 flex-shrink-0">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <FaUtensils className="text-orange-500" />
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                          <span>{item.name}</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${item.foodType === 'Veg' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                            {item.foodType}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500">₹{item.price} • {item.category}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleModerateItem(item._id, 'isApproved', item.isApproved !== false)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition ${
                          item.isApproved !== false
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-800 hover:bg-rose-200 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                        title="Toggle item approval"
                      >
                        {item.isApproved !== false ? 'Approved' : 'Disapproved'}
                      </button>

                      <button
                        onClick={() => handleModerateItem(item._id, 'isAvailable', item.isAvailable !== false)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition ${
                          item.isAvailable !== false
                            ? 'bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-950 dark:text-blue-300'
                            : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                        title="Toggle item in stock"
                      >
                        {item.isAvailable !== false ? 'In Stock' : 'Out of Stock'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-right">
              <button
                onClick={() => setMenuShop(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 transition"
              >
                Close Menu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
