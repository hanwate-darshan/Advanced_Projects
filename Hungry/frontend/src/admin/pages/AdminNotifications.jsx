import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FaBullhorn,
  FaPaperPlane,
  FaUsers,
  FaStore,
  FaMotorcycle,
  FaCircleInfo,
  FaTriangleExclamation,
  FaTag
} from 'react-icons/fa6';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Form state
  const [targetRole, setTargetRole] = useState('all');
  const [type, setType] = useState('info');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchNotifications();
  }, [page]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/admin/notifications', {
        params: { page, limit: 10 },
        withCredentials: true
      });
      if (res.data?.success) {
        setNotifications(res.data.data.notifications);
        setTotalPages(res.data.data.pagination.totalPages);
        setTotalItems(res.data.data.pagination.total);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (!title || !message) return;
    try {
      setSubmitting(true);
      setSuccessMsg('');
      const res = await axios.post(
        '/api/admin/notifications/broadcast',
        { title, message, targetRole, type },
        { withCredentials: true }
      );
      if (res.data?.success) {
        setSuccessMsg('Broadcast dispatched successfully via live sockets and database log!');
        setTitle('');
        setMessage('');
        fetchNotifications();
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to dispatch broadcast');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      key: 'title',
      label: 'Broadcast Subject',
      render: (n) => (
        <div>
          <div className="font-semibold text-slate-900 dark:text-white text-xs">{n.title}</div>
          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{n.message}</p>
        </div>
      )
    },
    {
      key: 'targetRole',
      label: 'Target Audience',
      render: (n) => (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
          {n.targetRole === 'delivery_partner' && <FaMotorcycle className="text-blue-500" />}
          {n.targetRole === 'restaurant_owner' && <FaStore className="text-amber-500" />}
          {n.targetRole === 'customer' && <FaUsers className="text-emerald-500" />}
          {n.targetRole === 'all' && <FaBullhorn className="text-purple-500" />}
          <span>{n.targetRole?.replace(/_/g, ' ')}</span>
        </span>
      )
    },
    {
      key: 'type',
      label: 'Notice Category',
      render: (n) => <StatusBadge status={n.type || 'info'} />
    },
    {
      key: 'sentBy',
      label: 'Originator',
      render: (n) => (
        <span className="text-xs text-slate-600 dark:text-slate-300">
          {n.sentBy?.fullName || 'Super Admin'}
        </span>
      )
    },
    {
      key: 'createdAt',
      label: 'Broadcast Date',
      render: (n) => (
        <span className="text-xs text-slate-400">
          {new Date(n.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Broadcast Announcements & Push Alerts
        </h1>
        <p className="text-sm text-slate-500">
          Dispatch platform-wide notices, weather alerts, festival discounts, and policy memos
        </p>
      </div>

      {/* Broadcast Form Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1">
          Compose Global Push Announcement
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Transmitted instantaneously to active clients via WebSockets
        </p>

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSendBroadcast} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Target User Segment
              </label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="all">Broadcast to Entire Platform (Everyone)</option>
                <option value="customer">Customers Only</option>
                <option value="restaurant_owner">Restaurant Owners Only</option>
                <option value="delivery_partner">Delivery Fleet Riders Only</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Notice Category
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="info">General Information</option>
                <option value="promo">Promotional / Campaign</option>
                <option value="alert">Critical Platform Alert / Weather Notice</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Announcement Headline
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Heavy Rain Surge: Extended delivery windows in effect"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Detailed Message Body
            </label>
            <textarea
              required
              rows={3}
              placeholder="Provide complete details for users..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <div className="text-right">
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-orange-600 hover:bg-orange-700 text-white shadow-sm shadow-orange-500/20 inline-flex items-center gap-2 cursor-pointer transition disabled:opacity-50"
            >
              {submitting ? (
                <span>Dispatching...</span>
              ) : (
                <>
                  <FaPaperPlane className="text-xs" />
                  <span>Transmit Broadcast</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Broadcast Archive Table */}
      <div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
          Broadcast Archive & History
        </h3>
        <DataTable
          columns={columns}
          data={notifications}
          loading={loading}
          page={page}
          totalPages={totalPages}
          totalItems={totalItems}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
