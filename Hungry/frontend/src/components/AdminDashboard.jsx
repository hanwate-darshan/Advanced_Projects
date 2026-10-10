import React, { useState, useEffect } from 'react';
import Nav from './Nav';
import Footer from './ui/Footer';
import axios from 'axios';
import { serverUrl } from '../App';
import {
  FaShieldHalved,
  FaStore,
  FaMotorcycle,
  FaReceipt,
  FaMoneyBillTrendUp,
  FaCheck,
  FaXmark,
  FaUserSlash,
  FaUserCheck,
  FaLocationDot,
  FaGear,
  FaUtensils,
  FaPen,
  FaEye,
  FaCircleExclamation,
  FaRotateRight,
  FaCoins
} from 'react-icons/fa6';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import scooterImg from '../assets/scooter.png';
import homeImg from '../assets/home.png';
import shopImg from '../assets/shop.png';

const riderMarkerIcon = new L.Icon({
  iconUrl: scooterImg,
  iconSize: [36, 36],
  iconAnchor: [18, 36]
});
const customerMarkerIcon = new L.Icon({
  iconUrl: homeImg,
  iconSize: [36, 36],
  iconAnchor: [18, 36]
});
const shopMarkerIcon = new L.Icon({
  iconUrl: shopImg,
  iconSize: [36, 36],
  iconAnchor: [18, 36]
});

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'approvals' | 'restaurants' | 'radar' | 'orders' | 'settings'
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  // Approvals State
  const [owners, setOwners] = useState([]);
  const [riders, setRiders] = useState([]);
  const [approvalsLoading, setApprovalsLoading] = useState(false);

  // Restaurants State
  const [restaurants, setRestaurants] = useState([]);
  const [selectedShop, setSelectedShop] = useState(null);
  const [menuItems, setMenuItems] = useState([]);

  // Live Radar State
  const [liveDeliveries, setLiveDeliveries] = useState({ activeOrders: [], activeRiders: [] });

  // Orders State
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Settings State
  const [settings, setSettings] = useState({
    deliveryRadiusKm: 15,
    defaultCommissionRate: 15,
    platformFee: 5,
    deliveryFee: 30,
    maintenanceMode: false
  });
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'approvals') fetchApprovals();
    if (activeTab === 'restaurants') fetchRestaurants();
    if (activeTab === 'radar') fetchLiveRadar();
    if (activeTab === 'orders') fetchOrders();
    if (activeTab === 'settings') fetchSettings();
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${serverUrl}/api/admin/dashboard/stats`, { withCredentials: true });
      if (res.data?.success) {
        setStats(res.data.data);
      }
    } catch (e) {
      console.error('Failed to load admin stats:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchApprovals = async () => {
    try {
      setApprovalsLoading(true);
      const [ownersRes, ridersRes] = await Promise.all([
        axios.get(`${serverUrl}/api/admin/owners`, { params: { approvalStatus: 'pending' }, withCredentials: true }),
        axios.get(`${serverUrl}/api/admin/riders`, { params: { approvalStatus: 'pending' }, withCredentials: true })
      ]);
      setOwners(ownersRes.data?.data?.owners || []);
      setRiders(ridersRes.data?.data?.riders || []);
    } catch (e) {
      console.error(e);
    } finally {
      setApprovalsLoading(false);
    }
  };

  const fetchRestaurants = async () => {
    try {
      const res = await axios.get(`${serverUrl}/api/admin/restaurants`, { withCredentials: true });
      setRestaurants(res.data?.data?.restaurants || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchLiveRadar = async () => {
    try {
      const res = await axios.get(`${serverUrl}/api/admin/deliveries/live`, { withCredentials: true });
      if (res.data?.success) {
        setLiveDeliveries(res.data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${serverUrl}/api/admin/orders`, { withCredentials: true });
      setOrders(res.data?.data?.orders || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await axios.get(`${serverUrl}/api/admin/settings`, { withCredentials: true });
      if (res.data?.data) {
        setSettings(res.data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleApproveOwner = async (ownerId, action) => {
    try {
      await axios.patch(`${serverUrl}/api/admin/owners/${ownerId}/approve`, { action }, { withCredentials: true });
      fetchApprovals();
      fetchStats();
    } catch (e) {
      alert(e.response?.data?.message || 'Error updating owner');
    }
  };

  const handleApproveRider = async (riderId, action) => {
    try {
      await axios.patch(`${serverUrl}/api/admin/riders/${riderId}/approve`, { action }, { withCredentials: true });
      fetchApprovals();
      fetchStats();
    } catch (e) {
      alert(e.response?.data?.message || 'Error updating rider');
    }
  };

  const handleToggleShop = async (shop) => {
    try {
      const newStatus = shop.status === 'suspended' ? 'active' : 'suspended';
      await axios.patch(`${serverUrl}/api/admin/restaurants/${shop._id}/status`, { status: newStatus }, { withCredentials: true });
      fetchRestaurants();
      fetchStats();
    } catch (e) {
      alert('Error updating shop status');
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      setSettingsSaving(true);
      setSettingsSuccess(false);
      await axios.patch(`${serverUrl}/api/admin/settings`, settings, { withCredentials: true });
      setSettingsSuccess(true);
      setTimeout(() => setSettingsSuccess(false), 3000);
    } catch (e) {
      alert('Error saving settings');
    } finally {
      setSettingsSaving(false);
    }
  };

  const counts = stats?.counts || {};
  const revenue = stats?.revenue || {};
  const pending = stats?.pending || {};
  const recentOrders = stats?.recentOrders || [];

  const pendingTotal = (pending.restaurantOwners || 0) + (pending.deliveryRiders || 0);

  return (
    <div className='w-full min-h-screen bg-blinkit-bg flex flex-col items-center'>
      <Nav />

      <div className='w-full max-w-6xl flex flex-col items-center gap-6 px-4 sm:px-6 pb-6 pt-24 sm:pt-28 flex-1'>
        {/* Welcome Title */}
        <h1 className='page-header text-2xl sm:text-3xl text-center leading-snug animate-fade-up'>
          <span className='w-12 h-12 grid place-items-center rounded-2xl bg-[linear-gradient(135deg,#F95B23,#D53A0B)] text-white shadow-glow shrink-0'>
            <FaShieldHalved size={20} />
          </span>
          <span>Hungry <span className='text-blinkit-green'>Platform Operations Hub</span></span>
        </h1>

        {/* Tab Navigation (Blinkit style pills) */}
        <div className='flex items-center gap-2 overflow-x-auto max-w-full pb-1 px-1'>
          {[
            { id: 'overview', label: 'Overview & KPIs', icon: FaReceipt },
            { id: 'approvals', label: `Pending Approvals ${pendingTotal > 0 ? `(${pendingTotal})` : ''}`, icon: FaStore, badge: pendingTotal > 0 },
            { id: 'restaurants', label: 'Restaurants & Menus', icon: FaUtensils },
            { id: 'radar', label: 'Live Deliveries Radar', icon: FaLocationDot },
            { id: 'orders', label: 'All Orders', icon: FaReceipt },
            { id: 'settings', label: 'Platform Settings', icon: FaGear }
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap ${
                  active
                    ? 'bg-blinkit-green text-white shadow-glow'
                    : 'bg-white text-blinkit-text-secondary hover:text-blinkit-green hover:border-blinkit-green/40 border border-blinkit-border shadow-soft'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className='w-2 h-2 rounded-full bg-blinkit-yellow animate-pulse' />
                )}
              </button>
            );
          })}
        </div>

        {/* ================= TAB 1: OVERVIEW ================= */}
        {activeTab === 'overview' && (
          <div className='w-full flex flex-col gap-6 animate-fade-up'>
            {/* Top Stat Cards Grid */}
            <div className='grid grid-cols-2 lg:grid-cols-4 gap-4 w-full'>
              <div className='card !rounded-2xl p-5 shadow-card bg-white border border-blinkit-border flex flex-col justify-between'>
                <div className='flex items-center justify-between'>
                  <span className='text-xs font-bold text-blinkit-text-muted uppercase'>Total Orders</span>
                  <div className='w-9 h-9 rounded-xl bg-blinkit-green-soft text-blinkit-green grid place-items-center'>
                    <FaReceipt size={16} />
                  </div>
                </div>
                <div className='mt-3'>
                  <span className='text-2xl sm:text-3xl font-extrabold text-blinkit-text'>{counts.totalOrders || 0}</span>
                  <p className='text-[11px] text-blinkit-green font-semibold mt-0.5'>{counts.activeOrders || 0} currently active</p>
                </div>
              </div>

              <div className='card !rounded-2xl p-5 shadow-card bg-white border border-blinkit-border flex flex-col justify-between'>
                <div className='flex items-center justify-between'>
                  <span className='text-xs font-bold text-blinkit-text-muted uppercase'>Platform GMV</span>
                  <div className='w-9 h-9 rounded-xl bg-amber-50 text-amber-600 grid place-items-center'>
                    <FaMoneyBillTrendUp size={16} />
                  </div>
                </div>
                <div className='mt-3'>
                  <span className='text-2xl sm:text-3xl font-extrabold text-blinkit-text'>₹{revenue.totalGmv || 0}</span>
                  <p className='text-[11px] text-amber-600 font-semibold mt-0.5'>Net cut: ₹{revenue.platformNet || 0}</p>
                </div>
              </div>

              <div className='card !rounded-2xl p-5 shadow-card bg-white border border-blinkit-border flex flex-col justify-between'>
                <div className='flex items-center justify-between'>
                  <span className='text-xs font-bold text-blinkit-text-muted uppercase'>Active Shops</span>
                  <div className='w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 grid place-items-center'>
                    <FaStore size={16} />
                  </div>
                </div>
                <div className='mt-3'>
                  <span className='text-2xl sm:text-3xl font-extrabold text-blinkit-text'>{counts.shops || 0}</span>
                  <p className='text-[11px] text-emerald-600 font-semibold mt-0.5'>{counts.owners || 0} Registered owners</p>
                </div>
              </div>

              <div className='card !rounded-2xl p-5 shadow-card bg-white border border-blinkit-border flex flex-col justify-between'>
                <div className='flex items-center justify-between'>
                  <span className='text-xs font-bold text-blinkit-text-muted uppercase'>Delivery Fleet</span>
                  <div className='w-9 h-9 rounded-xl bg-blue-50 text-blue-600 grid place-items-center'>
                    <FaMotorcycle size={16} />
                  </div>
                </div>
                <div className='mt-3'>
                  <span className='text-2xl sm:text-3xl font-extrabold text-blinkit-text'>{counts.riders || 0}</span>
                  <p className='text-[11px] text-blue-600 font-semibold mt-0.5'>{counts.customers || 0} Registered diners</p>
                </div>
              </div>
            </div>

            {/* Pending Actions Alert Box */}
            {pendingTotal > 0 && (
              <div className='card !rounded-2xl p-4 bg-amber-50/60 border border-amber-200/80 shadow-soft flex flex-col sm:flex-row items-center justify-between gap-3'>
                <div className='flex items-center gap-3'>
                  <FaCircleExclamation className='text-amber-600 text-xl flex-shrink-0' />
                  <div>
                    <h4 className='text-sm font-bold text-amber-900'>Action Required: Pending Applications</h4>
                    <p className='text-xs text-amber-700'>
                      {pending.restaurantOwners > 0 && `${pending.restaurantOwners} Restaurant Owner(s) `}
                      {pending.deliveryRiders > 0 && `${pending.deliveryRiders} Rider Partner(s) `}
                      waiting for verification.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('approvals')}
                  className='btn btn-primary !py-2 !px-4 text-xs shrink-0 cursor-pointer'
                >
                  Review Applications
                </button>
              </div>
            )}

            {/* Recent Live Orders Table */}
            <div className='card !rounded-3xl p-6 bg-white border border-blinkit-border shadow-card overflow-hidden'>
              <div className='flex items-center justify-between pb-4 border-b border-blinkit-border-light mb-4'>
                <div>
                  <h3 className='font-display text-lg font-bold text-blinkit-text'>Live Orders Feed</h3>
                  <p className='text-xs text-blinkit-text-muted'>Recent transactions across the Hungry platform</p>
                </div>
                <button
                  onClick={fetchStats}
                  className='btn btn-outline !py-1.5 !px-3 text-xs flex items-center gap-1.5 cursor-pointer'
                >
                  <FaRotateRight size={12} className={loading ? 'animate-spin' : ''} />
                  <span>Refresh</span>
                </button>
              </div>

              <div className='overflow-x-auto'>
                <table className='w-full text-left text-xs'>
                  <thead className='text-blinkit-text-muted uppercase font-bold border-b border-blinkit-border-light'>
                    <tr>
                      <th className='pb-3'>Order ID</th>
                      <th className='pb-3'>Customer</th>
                      <th className='pb-3'>Restaurant</th>
                      <th className='pb-3'>Amount</th>
                      <th className='pb-3'>Payment</th>
                      <th className='pb-3'>Status</th>
                      <th className='pb-3'>Time</th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-blinkit-border-light'>
                    {recentOrders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className='py-8 text-center text-blinkit-text-muted'>
                          No recent orders found.
                        </td>
                      </tr>
                    ) : (
                      recentOrders.map(ord => (
                        <tr key={ord._id} className='hover:bg-blinkit-green-soft/20'>
                          <td className='py-3 font-mono font-bold text-blinkit-text'>
                            #{ord._id.slice(-6).toUpperCase()}
                          </td>
                          <td className='py-3 font-semibold text-blinkit-text'>{ord.user?.fullName || 'Guest'}</td>
                          <td className='py-3 text-blinkit-text-secondary'>
                            {ord.shop?.name || ord.shopOrders?.[0]?.shop?.name || 'Restaurant'}
                          </td>
                          <td className='py-3 font-bold text-blinkit-text'>₹{ord.totalAmount}</td>
                          <td className='py-3 uppercase font-medium text-blinkit-text-muted'>
                            {ord.paymentMethod || 'COD'}
                          </td>
                          <td className='py-3'>
                            <span className='chip bg-blinkit-green-soft text-blinkit-green-dark text-[11px] font-bold capitalize'>
                              {ord.status || ord.shopOrders?.[0]?.status || 'pending'}
                            </span>
                          </td>
                          <td className='py-3 text-blinkit-text-muted'>
                            {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: APPROVALS ================= */}
        {activeTab === 'approvals' && (
          <div className='w-full flex flex-col gap-6 animate-fade-up'>
            {/* Owners Section */}
            <div className='card !rounded-3xl p-6 bg-white border border-blinkit-border shadow-card'>
              <div className='pb-4 border-b border-blinkit-border-light mb-4'>
                <h3 className='font-display text-lg font-bold text-blinkit-text flex items-center gap-2'>
                  <FaStore className='text-blinkit-green' />
                  <span>Pending Restaurant Owners ({owners.length})</span>
                </h3>
                <p className='text-xs text-blinkit-text-muted'>Review and authorize store listing permissions</p>
              </div>

              {approvalsLoading ? (
                <div className='py-8 text-center text-xs text-blinkit-text-muted'>Loading pending owners...</div>
              ) : owners.length === 0 ? (
                <div className='py-8 text-center text-xs text-blinkit-text-muted'>
                  No pending restaurant owner applications at this time.
                </div>
              ) : (
                <div className='space-y-3'>
                  {owners.map(owner => (
                    <div key={owner._id} className='p-4 rounded-2xl bg-blinkit-bg border border-blinkit-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3'>
                      <div>
                        <h4 className='font-bold text-blinkit-text text-sm'>{owner.fullName}</h4>
                        <p className='text-xs text-blinkit-text-secondary'>{owner.email} • {owner.mobile || 'No phone'}</p>
                        {owner.shop && (
                          <p className='text-xs text-blinkit-green font-semibold mt-1'>Shop: {owner.shop.name} ({owner.shop.city})</p>
                        )}
                      </div>
                      <div className='flex items-center gap-2'>
                        <button
                          onClick={() => handleApproveOwner(owner._id, 'approved')}
                          className='btn btn-primary !py-1.5 !px-3 text-xs flex items-center gap-1 cursor-pointer'
                        >
                          <FaCheck size={12} />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => handleApproveOwner(owner._id, 'rejected')}
                          className='px-3 py-1.5 rounded-full text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 transition cursor-pointer'
                        >
                          <FaXmark size={12} />
                          <span>Reject</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Riders Section */}
            <div className='card !rounded-3xl p-6 bg-white border border-blinkit-border shadow-card'>
              <div className='pb-4 border-b border-blinkit-border-light mb-4'>
                <h3 className='font-display text-lg font-bold text-blinkit-text flex items-center gap-2'>
                  <FaMotorcycle className='text-blue-600' />
                  <span>Pending Delivery Riders ({riders.length})</span>
                </h3>
                <p className='text-xs text-blinkit-text-muted'>Verify driver partner applications for order dispatch</p>
              </div>

              {approvalsLoading ? (
                <div className='py-8 text-center text-xs text-blinkit-text-muted'>Loading pending riders...</div>
              ) : riders.length === 0 ? (
                <div className='py-8 text-center text-xs text-blinkit-text-muted'>
                  No pending delivery rider applications at this time.
                </div>
              ) : (
                <div className='space-y-3'>
                  {riders.map(rider => (
                    <div key={rider._id} className='p-4 rounded-2xl bg-blinkit-bg border border-blinkit-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3'>
                      <div>
                        <h4 className='font-bold text-blinkit-text text-sm'>{rider.fullName}</h4>
                        <p className='text-xs text-blinkit-text-secondary'>{rider.email} • {rider.mobile || 'No phone'}</p>
                      </div>
                      <div className='flex items-center gap-2'>
                        <button
                          onClick={() => handleApproveRider(rider._id, 'approved')}
                          className='btn btn-primary !py-1.5 !px-3 text-xs flex items-center gap-1 cursor-pointer'
                        >
                          <FaCheck size={12} />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => handleApproveRider(rider._id, 'rejected')}
                          className='px-3 py-1.5 rounded-full text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 transition cursor-pointer'
                        >
                          <FaXmark size={12} />
                          <span>Reject</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 3: RESTAURANTS ================= */}
        {activeTab === 'restaurants' && (
          <div className='w-full card !rounded-3xl p-6 bg-white border border-blinkit-border shadow-card animate-fade-up'>
            <div className='flex items-center justify-between pb-4 border-b border-blinkit-border-light mb-4'>
              <div>
                <h3 className='font-display text-lg font-bold text-blinkit-text'>Registered Restaurants</h3>
                <p className='text-xs text-blinkit-text-muted'>Manage restaurant statuses, commissions, and menus</p>
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {restaurants.map(shop => (
                <div key={shop._id} className='p-4 rounded-2xl border border-blinkit-border bg-blinkit-bg/40 flex items-center justify-between gap-3'>
                  <div className='flex items-center gap-3'>
                    <div className='w-12 h-12 rounded-xl bg-blinkit-green-soft overflow-hidden flex items-center justify-center shrink-0'>
                      {shop.image ? (
                        <img src={shop.image} alt={shop.name} className='w-full h-full object-cover' />
                      ) : (
                        <FaStore className='text-blinkit-green' />
                      )}
                    </div>
                    <div>
                      <h4 className='font-bold text-blinkit-text text-sm'>{shop.name}</h4>
                      <p className='text-xs text-blinkit-text-secondary'>{shop.city} • Commission: {shop.commissionRate ?? 15}%</p>
                      <span className={`chip mt-1 text-[10px] font-bold ${shop.status === 'suspended' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700'}`}>
                        {shop.status || 'active'}
                      </span>
                    </div>
                  </div>

                  <div className='flex items-center gap-1.5'>
                    <button
                      onClick={() => handleToggleShop(shop)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                        shop.status === 'suspended' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {shop.status === 'suspended' ? 'Activate' : 'Suspend'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 4: LIVE RADAR GIS ================= */}
        {activeTab === 'radar' && (
          <div className='w-full card !rounded-3xl p-6 bg-white border border-blinkit-border shadow-card animate-fade-up'>
            <div className='flex items-center justify-between pb-4 border-b border-blinkit-border-light mb-4'>
              <div>
                <h3 className='font-display text-lg font-bold text-blinkit-text flex items-center gap-2'>
                  <span className='w-2.5 h-2.5 rounded-full bg-blinkit-green animate-ping' />
                  <span>Live Dispatch Radar (GIS)</span>
                </h3>
                <p className='text-xs text-blinkit-text-muted'>
                  Real-time Leaflet tracking of active riders ({liveDeliveries.activeRiders?.length || 0}) and in-flight orders ({liveDeliveries.activeOrders?.length || 0})
                </p>
              </div>
              <button onClick={fetchLiveRadar} className='btn btn-outline !py-1.5 !px-3 text-xs cursor-pointer'>
                Refresh Radar
              </button>
            </div>

            <div className='w-full h-[450px] rounded-2xl overflow-hidden border border-blinkit-border relative z-0'>
              <MapContainer
                center={[18.5204, 73.8567]}
                zoom={12}
                className='w-full h-full'
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {liveDeliveries.activeRiders?.map(rider => {
                  const coords = rider.location?.coordinates;
                  if (!coords || coords.length !== 2 || (coords[0] === 0 && coords[1] === 0)) return null;
                  return (
                    <Marker key={rider._id} position={[coords[1], coords[0]]} icon={riderMarkerIcon}>
                      <Popup>
                        <div className='text-xs'>
                          <strong>{rider.fullName}</strong>
                          <p>{rider.mobile}</p>
                          <span className='text-blinkit-green font-bold uppercase'>{rider.riderStatus || 'Available'}</span>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}

                {liveDeliveries.activeOrders?.map(ord => {
                  const custCoords = ord.deliveryAddress?.coordinates;
                  if (!custCoords || custCoords.length !== 2 || custCoords[0] === 0) return null;
                  return (
                    <Marker key={ord._id} position={[custCoords[1], custCoords[0]]} icon={customerMarkerIcon}>
                      <Popup>
                        <div className='text-xs'>
                          <strong>Order #{ord._id.slice(-6).toUpperCase()}</strong>
                          <p>Customer: {ord.user?.fullName}</p>
                          <p>₹{ord.totalAmount}</p>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>
            </div>
          </div>
        )}

        {/* ================= TAB 5: ALL ORDERS ================= */}
        {activeTab === 'orders' && (
          <div className='w-full card !rounded-3xl p-6 bg-white border border-blinkit-border shadow-card animate-fade-up'>
            <div className='flex items-center justify-between pb-4 border-b border-blinkit-border-light mb-4'>
              <div>
                <h3 className='font-display text-lg font-bold text-blinkit-text'>Orders Master Log</h3>
                <p className='text-xs text-blinkit-text-muted'>Complete order lifecycle history across Hungry</p>
              </div>
              <button onClick={fetchOrders} className='btn btn-outline !py-1.5 !px-3 text-xs cursor-pointer'>
                Refresh
              </button>
            </div>

            <div className='overflow-x-auto'>
              <table className='w-full text-left text-xs'>
                <thead className='text-blinkit-text-muted uppercase font-bold border-b border-blinkit-border-light'>
                  <tr>
                    <th className='pb-3'>Order ID</th>
                    <th className='pb-3'>Customer</th>
                    <th className='pb-3'>Restaurant</th>
                    <th className='pb-3'>Amount</th>
                    <th className='pb-3'>Payment</th>
                    <th className='pb-3'>Status</th>
                    <th className='pb-3'>Date</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-blinkit-border-light'>
                  {orders.map(ord => (
                    <tr key={ord._id} className='hover:bg-blinkit-green-soft/20'>
                      <td className='py-3 font-mono font-bold text-blinkit-text'>
                        #{ord._id.slice(-6).toUpperCase()}
                      </td>
                      <td className='py-3 font-semibold text-blinkit-text'>{ord.user?.fullName || 'Guest'}</td>
                      <td className='py-3 text-blinkit-text-secondary'>
                        {ord.shop?.name || ord.shopOrders?.[0]?.shop?.name || 'Restaurant'}
                      </td>
                      <td className='py-3 font-bold text-blinkit-text'>₹{ord.totalAmount}</td>
                      <td className='py-3 uppercase font-medium text-blinkit-text-muted'>
                        {ord.paymentMethod || 'COD'}
                      </td>
                      <td className='py-3'>
                        <span className='chip bg-blinkit-green-soft text-blinkit-green-dark text-[11px] font-bold capitalize'>
                          {ord.status || ord.shopOrders?.[0]?.status || 'pending'}
                        </span>
                      </td>
                      <td className='py-3 text-blinkit-text-muted'>
                        {new Date(ord.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB 6: SETTINGS ================= */}
        {activeTab === 'settings' && (
          <div className='w-full max-w-2xl card !rounded-3xl p-6 sm:p-8 bg-white border border-blinkit-border shadow-card animate-fade-up'>
            <div className='pb-4 border-b border-blinkit-border-light mb-5'>
              <h3 className='font-display text-lg font-bold text-blinkit-text flex items-center gap-2'>
                <FaGear className='text-blinkit-green' />
                <span>Hyper-Local Platform Settings</span>
              </h3>
              <p className='text-xs text-blinkit-text-muted'>Configure dynamic delivery radius and fee structures</p>
            </div>

            {settingsSuccess && (
              <div className='mb-4 p-3 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold'>
                Settings saved successfully! Delivery radius and tariffs updated.
              </div>
            )}

            <form onSubmit={handleSaveSettings} className='space-y-4 text-xs'>
              <div>
                <label className='block font-bold text-blinkit-text mb-1'>
                  Dynamic Delivery Dispatch Radius (km)
                </label>
                <input
                  type='number'
                  min='1'
                  max='50'
                  step='0.5'
                  value={settings.deliveryRadiusKm}
                  onChange={e => setSettings({ ...settings, deliveryRadiusKm: Number(e.target.value) })}
                  className='w-full p-3 rounded-2xl border border-blinkit-border bg-blinkit-bg font-semibold text-sm outline-0 focus:border-blinkit-green'
                />
                <span className='text-[11px] text-blinkit-text-muted mt-1 block'>
                  Riders are automatically matched within {settings.deliveryRadiusKm} km of restaurant.
                </span>
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <div>
                  <label className='block font-bold text-blinkit-text mb-1'>Default Commission Rate (%)</label>
                  <input
                    type='number'
                    min='0'
                    max='50'
                    value={settings.defaultCommissionRate}
                    onChange={e => setSettings({ ...settings, defaultCommissionRate: Number(e.target.value) })}
                    className='w-full p-3 rounded-2xl border border-blinkit-border bg-blinkit-bg font-semibold text-sm outline-0 focus:border-blinkit-green'
                  />
                </div>
                <div>
                  <label className='block font-bold text-blinkit-text mb-1'>Platform Convenience Fee (₹)</label>
                  <input
                    type='number'
                    min='0'
                    value={settings.platformFee}
                    onChange={e => setSettings({ ...settings, platformFee: Number(e.target.value) })}
                    className='w-full p-3 rounded-2xl border border-blinkit-border bg-blinkit-bg font-semibold text-sm outline-0 focus:border-blinkit-green'
                  />
                </div>
              </div>

              <div className='p-4 rounded-2xl bg-blinkit-bg border border-blinkit-border flex items-center justify-between mt-2'>
                <div>
                  <h4 className='font-bold text-blinkit-text text-sm'>Platform Maintenance Mode</h4>
                  <p className='text-xs text-blinkit-text-muted'>Temporarily restrict new customer checkouts</p>
                </div>
                <button
                  type='button'
                  onClick={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition cursor-pointer ${
                    settings.maintenanceMode ? 'bg-red-500 text-white' : 'bg-blinkit-border text-blinkit-text-secondary'
                  }`}
                >
                  {settings.maintenanceMode ? 'ENABLED (Paused)' : 'DISABLED (Live)'}
                </button>
              </div>

              <div className='pt-3 text-right'>
                <button
                  type='submit'
                  disabled={settingsSaving}
                  className='btn btn-primary !py-3 !px-6 text-sm cursor-pointer'
                >
                  {settingsSaving ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
