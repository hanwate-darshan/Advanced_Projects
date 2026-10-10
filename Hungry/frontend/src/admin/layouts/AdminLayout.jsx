import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import adminApi from '../api';
import {
  FaChartPie,
  FaUsers,
  FaStore,
  FaMotorcycle,
  FaUtensils,
  FaLocationDot,
  FaReceipt,
  FaCreditCard,
  FaMoneyBillTrendUp,
  FaCircleExclamation,
  FaTicket,
  FaBullhorn,
  FaBrain,
  FaGear,
  FaClockRotateLeft,
  FaBars,
  FaXmark,
  FaArrowRightFromBracket,
  FaShieldHalved,
  FaBell
} from 'react-icons/fa6';

const navSections = [
  {
    title: 'Overview',
    items: [
      { name: 'Dashboard', path: '/admin', icon: FaChartPie, end: true }
    ]
  },
  {
    title: 'User Management',
    items: [
      { name: 'Customers', path: '/admin/customers', icon: FaUsers },
      { name: 'Restaurant Owners', path: '/admin/owners', icon: FaStore },
      { name: 'Delivery Riders', path: '/admin/riders', icon: FaMotorcycle }
    ]
  },
  {
    title: 'Operations',
    items: [
      { name: 'Restaurants & Menus', path: '/admin/restaurants', icon: FaUtensils },
      { name: 'Live Deliveries', path: '/admin/live-deliveries', icon: FaLocationDot },
      { name: 'Orders Control', path: '/admin/orders', icon: FaReceipt }
    ]
  },
  {
    title: 'Finance',
    items: [
      { name: 'Transactions', path: '/admin/payments', icon: FaCreditCard },
      { name: 'Revenue & Payouts', path: '/admin/revenue', icon: FaMoneyBillTrendUp }
    ]
  },
  {
    title: 'Support & Marketing',
    items: [
      { name: 'Complaints', path: '/admin/complaints', icon: FaCircleExclamation },
      { name: 'Coupons & Promos', path: '/admin/coupons', icon: FaTicket },
      { name: 'Broadcast Push', path: '/admin/notifications', icon: FaBullhorn }
    ]
  },
  {
    title: 'System & Intelligence',
    items: [
      { name: 'AI Insights & Analytics', path: '/admin/analytics', icon: FaBrain },
      { name: 'Platform Settings', path: '/admin/settings', icon: FaGear },
      { name: 'Audit / Activity Logs', path: '/admin/logs', icon: FaClockRotateLeft }
    ]
  }
];

export default function AdminLayout() {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    checkAdminAuth();
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const checkAdminAuth = async () => {
    try {
      const res = await adminApi.get('/api/admin/auth/me');
      const user = res.data?.data || res.data?.user;
      if (res.data?.success && user?.role === 'admin') {
        setAdmin(user);
      } else {
        navigate('/admin/login', { replace: true });
      }
    } catch (err) {
      navigate('/admin/login', { replace: true });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await adminApi.post('/api/admin/auth/logout');
    } catch (e) {
      // ignore
    } finally {
      navigate('/admin/login', { replace: true });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium text-slate-400">Verifying Admin Access...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Main Layout Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Logo & Brand */}
          <div className="h-16 px-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
                <FaShieldHalved className="text-lg" />
              </div>
              <div>
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                  Hungry
                </span>
                <span className="ml-1.5 text-xs font-semibold px-1.5 py-0.5 rounded bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800">
                  OPS
                </span>
              </div>
            </div>

            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              <FaXmark className="text-lg" />
            </button>
          </div>

          {/* Navigation Links Scrollable */}
          <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
            {navSections.map((section) => (
              <div key={section.title}>
                <h3 className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                  {section.title}
                </h3>
                <ul className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <li key={item.path}>
                        <NavLink
                          to={item.path}
                          end={item.end}
                          className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                              isActive
                                ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/30'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                            }`
                          }
                        >
                          <Icon className="text-base flex-shrink-0" />
                          <span className="truncate">{item.name}</span>
                        </NavLink>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>

          {/* Admin User Footer Card */}
          <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 flex items-center justify-between">
              <div className="min-w-0 pr-2">
                <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                  {admin?.fullName || 'Super Admin'}
                </p>
                <p className="text-[11px] text-slate-400 truncate">
                  {admin?.email || 'admin@hungry.com'}
                </p>
              </div>
              <button
                onClick={handleLogout}
                title="Logout"
                className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
              >
                <FaArrowRightFromBracket className="text-sm" />
              </button>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Top Bar */}
          <header className="h-16 px-4 sm:px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 z-30">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <FaBars className="text-lg" />
              </button>
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 hidden sm:inline">
                  System Live & Operational
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <NavLink
                to="/admin/complaints"
                className="relative p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                title="Complaints"
              >
                <FaBell className="text-base" />
              </NavLink>

              <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-800 flex items-center justify-center text-xs font-bold text-orange-600 dark:text-orange-400">
                  {admin?.fullName ? admin.fullName.charAt(0).toUpperCase() : 'A'}
                </div>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 hidden md:inline">
                  {admin?.fullName || 'Admin'}
                </span>
              </div>
            </div>
          </header>

          {/* Page View */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
