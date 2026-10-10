import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FaReceipt,
  FaEye,
  FaBan,
  FaStore,
  FaUser,
  FaMotorcycle,
  FaLocationDot,
  FaXmark,
  FaClock
} from 'react-icons/fa6';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import ConfirmModal from '../components/ConfirmModal';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');

  // Selected Order for detail modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Status override modal
  const [statusUpdateTarget, setStatusUpdateTarget] = useState(null); // { order, newStatus }
  const [cancelReason, setCancelReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [page, search, statusFilter, paymentFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/admin/orders', {
        params: {
          page,
          limit: 10,
          search,
          status: statusFilter,
          paymentMethod: paymentFilter
        },
        withCredentials: true
      });
      if (res.data?.success) {
        setOrders(res.data.data.orders);
        setTotalPages(res.data.data.pagination.totalPages);
        setTotalItems(res.data.data.pagination.total);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetail = async (orderId) => {
    try {
      setLoadingDetail(true);
      const res = await axios.get(`/api/admin/orders/${orderId}`, { withCredentials: true });
      if (res.data?.success) {
        setSelectedOrder(res.data.data);
      }
    } catch (err) {
      alert('Failed to load order details');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleStatusOverride = async () => {
    if (!statusUpdateTarget) return;
    try {
      setSubmitting(true);
      const { order, newStatus } = statusUpdateTarget;
      const res = await axios.patch(
        `/api/admin/orders/${order._id}/status`,
        {
          status: newStatus,
          reason: newStatus === 'cancelled' ? cancelReason : undefined
        },
        { withCredentials: true }
      );
      if (res.data?.success) {
        setStatusUpdateTarget(null);
        setCancelReason('');
        if (selectedOrder?._id === order._id) {
          setSelectedOrder(res.data.data);
        }
        fetchOrders();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      key: '_id',
      label: 'Order ID',
      render: (o) => (
        <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
          #{o._id.slice(-6).toUpperCase()}
        </span>
      )
    },
    {
      key: 'user',
      label: 'Customer',
      render: (o) => (
        <div className="text-xs">
          <div className="font-semibold text-slate-900 dark:text-white">{o.user?.fullName || 'Guest'}</div>
          <div className="text-slate-400">{o.user?.mobile || o.user?.email || ''}</div>
        </div>
      )
    },
    {
      key: 'shop',
      label: 'Restaurant',
      render: (o) => (
        <div className="text-xs font-medium text-slate-800 dark:text-slate-200">
          {o.shop?.name || o.shopOrders?.[0]?.shop?.name || 'Restaurant'}
        </div>
      )
    },
    {
      key: 'totalAmount',
      label: 'Amount',
      render: (o) => (
        <span className="text-xs font-bold text-slate-900 dark:text-white">
          ₹{o.totalAmount}
        </span>
      )
    },
    {
      key: 'paymentMethod',
      label: 'Payment',
      render: (o) => (
        <div className="text-xs">
          <span className="uppercase font-semibold text-slate-700 dark:text-slate-300">
            {o.paymentMethod || 'COD'}
          </span>
          <span className={`ml-1.5 text-[10px] font-bold ${o.payment ? 'text-emerald-600' : 'text-amber-500'}`}>
            ({o.payment ? 'Paid' : 'Unpaid'})
          </span>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (o) => <StatusBadge status={o.status || o.shopOrders?.[0]?.status || 'pending'} />
    },
    {
      key: 'createdAt',
      label: 'Timestamp',
      render: (o) => (
        <span className="text-xs text-slate-400">
          {new Date(o.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      className: 'text-right',
      render: (o) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => handleOpenDetail(o._id)}
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 transition flex items-center gap-1 cursor-pointer"
          >
            <FaEye className="text-xs" />
            <span>View</span>
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Orders Control & Lifecycle
        </h1>
        <p className="text-sm text-slate-500">
          Supervise orders from all restaurants, inspect item line breakdown, and execute emergency overrides
        </p>
      </div>

      <DataTable
        columns={columns}
        data={orders}
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
        searchPlaceholder="Search by order ID or customer..."
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
              <option value="pending">Pending</option>
              <option value="preparing">Preparing</option>
              <option value="out_for_delivery">Out for Delivery</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={paymentFilter}
              onChange={(e) => {
                setPaymentFilter(e.target.value);
                setPage(1);
              }}
              className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              <option value="">All Payments</option>
              <option value="cod">Cash on Delivery</option>
              <option value="online">Online / Razorpay</option>
            </select>
          </div>
        }
      />

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Order #{selectedOrder._id.slice(-6).toUpperCase()}
                  </h3>
                  <StatusBadge status={selectedOrder.status || selectedOrder.shopOrders?.[0]?.status || 'pending'} />
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <FaXmark className="text-lg" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs">
              {/* Restaurant & Customer Details */}
              <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-100 dark:border-slate-800">
                <div>
                  <span className="font-semibold text-slate-500 uppercase text-[10px]">Restaurant</span>
                  <p className="font-bold text-slate-900 dark:text-white mt-1">
                    {selectedOrder.shop?.name || selectedOrder.shopOrders?.[0]?.shop?.name || 'Restaurant'}
                  </p>
                  <p className="text-slate-500">
                    {selectedOrder.shop?.city || selectedOrder.shopOrders?.[0]?.shop?.city || ''}
                  </p>
                </div>
                <div>
                  <span className="font-semibold text-slate-500 uppercase text-[10px]">Customer</span>
                  <p className="font-bold text-slate-900 dark:text-white mt-1">{selectedOrder.user?.fullName}</p>
                  <p className="text-slate-500">{selectedOrder.user?.mobile || selectedOrder.user?.email}</p>
                </div>
              </div>

              {/* Delivery Address & Assigned Rider */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2">
                <div>
                  <span className="font-semibold text-slate-500 uppercase text-[10px]">Delivery Address</span>
                  <p className="text-slate-800 dark:text-slate-200 font-medium mt-0.5">
                    {selectedOrder.deliveryAddress?.address || selectedOrder.deliveryAddress?.text || 'No address provided'}
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between">
                  <span className="font-semibold text-slate-500 uppercase text-[10px]">Assigned Delivery Partner</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {selectedOrder.assignedRider?.fullName || selectedOrder.shopOrders?.[0]?.assignedDeliveryBoy?.fullName || 'Not assigned yet'}
                  </span>
                </div>
              </div>

              {/* Items List */}
              <div>
                <span className="font-semibold text-slate-500 uppercase text-[10px] block mb-2">Order Line Items</span>
                <div className="space-y-2">
                  {(selectedOrder.items || selectedOrder.shopOrders?.[0]?.shopOrderItems || []).map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 bg-slate-50/60 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-orange-600 dark:text-orange-400">
                          {item.quantity || 1}x
                        </span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {item.item?.name || item.name || 'Dish item'}
                        </span>
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white">
                        ₹{(item.price || item.item?.price || 0) * (item.quantity || 1)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bill Summary */}
              <div className="p-3.5 bg-orange-50/40 dark:bg-orange-950/20 rounded-xl border border-orange-100 dark:border-orange-900/30 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Total Billed Amount</span>
                  <p className="text-[11px] text-slate-400">
                    Payment Method: {selectedOrder.paymentMethod?.toUpperCase()} • {selectedOrder.payment ? 'PAID' : 'PENDING'}
                  </p>
                </div>
                <span className="text-xl font-bold text-orange-600 dark:text-orange-400">
                  ₹{selectedOrder.totalAmount}
                </span>
              </div>
            </div>

            {/* Admin Override Actions Footer */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
              {selectedOrder.status !== 'cancelled' && selectedOrder.status !== 'delivered' && (
                <button
                  onClick={() => setStatusUpdateTarget({ order: selectedOrder, newStatus: 'cancelled' })}
                  className="px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition cursor-pointer"
                >
                  Force Cancel Order
                </button>
              )}

              <div className="ml-auto flex items-center gap-2">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Force Cancel Modal */}
      {statusUpdateTarget && (
        <ConfirmModal
          isOpen={!!statusUpdateTarget}
          title="Force Cancel Order"
          message={`Are you sure you want to cancel order #${statusUpdateTarget.order._id.slice(-6).toUpperCase()}? This overrides shop and customer status.`}
          confirmLabel="Cancel Order"
          variant="danger"
          isLoading={submitting}
          onConfirm={handleStatusOverride}
          onClose={() => setStatusUpdateTarget(null)}
        >
          <div className="mt-3">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Cancellation Reason
            </label>
            <input
              type="text"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g., Unreachable customer / store emergency closure"
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
          </div>
        </ConfirmModal>
      )}
    </div>
  );
}
