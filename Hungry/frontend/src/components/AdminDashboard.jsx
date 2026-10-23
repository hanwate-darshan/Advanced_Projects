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
  FaCoins,
  FaPlus,
  FaTrash,
  FaArrowLeft,
  FaLeaf,
  FaWandMagicSparkles
} from 'react-icons/fa6';
import { categories } from '../category';
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

  // Restaurants & Menus State
  const [restaurants, setRestaurants] = useState([]);
  const [selectedShop, setSelectedShop] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loadingMenu, setLoadingMenu] = useState(false);
  const [restaurantSearch, setRestaurantSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [addingItem, setAddingItem] = useState(false);
  const [newItemForm, setNewItemForm] = useState({
    name: '',
    category: 'Snacks',
    price: '',
    foodType: 'veg',
    description: '',
    image: null
  });
  const [generatingDesc, setGeneratingDesc] = useState(false);

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
      const ownersList = ownersRes.data?.data?.owners || (Array.isArray(ownersRes.data?.data) ? ownersRes.data.data : ownersRes.data?.owners || []);
      const ridersList = ridersRes.data?.data?.riders || (Array.isArray(ridersRes.data?.data) ? ridersRes.data.data : ridersRes.data?.riders || []);
      setOwners(ownersList);
      setRiders(ridersList);
    } catch (e) {
      console.error(e);
    } finally {
      setApprovalsLoading(false);
    }
  };

  const fetchRestaurants = async () => {
    try {
      const res = await axios.get(`${serverUrl}/api/admin/restaurants`, { withCredentials: true });
      const list = res.data?.data?.restaurants || (Array.isArray(res.data?.data) ? res.data.data : res.data?.restaurants || []);
      setRestaurants(list);
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
      const list = res.data?.data?.orders || (Array.isArray(res.data?.data) ? res.data.data : res.data?.orders || []);
      setOrders(list);
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
      await axios.patch(`${serverUrl}/api/admin/owners/${ownerId}/approval`, { approvalStatus: action }, { withCredentials: true });
      fetchApprovals();
      fetchStats();
    } catch (e) {
      alert(e.response?.data?.message || 'Error updating owner');
    }
  };

  const handleApproveRider = async (riderId, action) => {
    try {
      await axios.patch(`${serverUrl}/api/admin/riders/${riderId}/approval`, { approvalStatus: action }, { withCredentials: true });
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

  const fetchMenuItems = async (shopId) => {
    try {
      setLoadingMenu(true);
      const res = await axios.get(`${serverUrl}/api/admin/restaurants/${shopId}/items`, { withCredentials: true });
      const items = res.data?.data || res.data?.items || (Array.isArray(res.data) ? res.data : []);
      setMenuItems(items);
    } catch (e) {
      console.error('Failed to load menu items:', e);
      setMenuItems([]);
    } finally {
      setLoadingMenu(false);
    }
  };

  const handleSelectShop = (shop) => {
    setSelectedShop(shop);
    fetchMenuItems(shop._id);
  };

  const handleToggleItemAvailable = async (itemId, currentVal) => {
    try {
      await axios.patch(`${serverUrl}/api/admin/items/${itemId}/status`, { isAvailable: !currentVal }, { withCredentials: true });
      if (selectedShop) fetchMenuItems(selectedShop._id);
    } catch (e) {
      alert('Error updating item availability');
    }
  };

  const handleToggleItemApproved = async (itemId, currentVal) => {
    try {
      await axios.patch(`${serverUrl}/api/admin/items/${itemId}/status`, { isApproved: !currentVal }, { withCredentials: true });
      if (selectedShop) fetchMenuItems(selectedShop._id);
    } catch (e) {
      alert('Error updating item approval');
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this menu item?')) return;
    try {
      await axios.delete(`${serverUrl}/api/admin/items/${itemId}`, { withCredentials: true });
      if (selectedShop) fetchMenuItems(selectedShop._id);
    } catch (e) {
      alert('Error deleting item');
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!selectedShop) return;
    try {
      setAddingItem(true);
      const formData = new FormData();
      formData.append('name', newItemForm.name);
      formData.append('category', newItemForm.category);
      formData.append('price', newItemForm.price);
      formData.append('foodType', newItemForm.foodType);
      formData.append('description', newItemForm.description);
      if (newItemForm.image) {
        formData.append('image', newItemForm.image);
      }
      await axios.post(`${serverUrl}/api/admin/restaurants/${selectedShop._id}/items`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      });
      setShowAddModal(false);
      setNewItemForm({ name: '', category: 'Snacks', price: '', foodType: 'veg', description: '', image: null });
      fetchMenuItems(selectedShop._id);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add item');
    } finally {
      setAddingItem(false);
    }
  };

  const handleGenerateAiDesc = async () => {
    if (!newItemForm.name?.trim()) {
      alert('Please enter an item name first so AI can write a description!');
      return;
    }
    try {
      setGeneratingDesc(true);
      const res = await axios.post(
        `${serverUrl}/api/recommendations/generate-description`,
        {
          name: newItemForm.name,
          category: newItemForm.category,
          foodType: newItemForm.foodType
        },
        { withCredentials: true }
      );
      if (res.data?.description) {
        setNewItemForm(prev => ({ ...prev, description: res.data.description }));
      }
    } catch (e) {
      alert('Failed to generate description with AI');
    } finally {
      setGeneratingDesc(false);
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

        {/* ================= TAB 3: RESTAURANTS & MENU MANAGEMENT ================= */}
        {activeTab === 'restaurants' && (
          <div className='w-full card !rounded-3xl p-6 bg-white border border-blinkit-border shadow-card animate-fade-up'>
            {!selectedShop ? (
              <>
                <div className='flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-blinkit-border-light mb-4 gap-3'>
                  <div>
                    <h3 className='font-display text-lg font-bold text-blinkit-text'>Registered Restaurants ({restaurants.length})</h3>
                    <p className='text-xs text-blinkit-text-muted'>Manage restaurant statuses, commissions, and full menu items</p>
                  </div>
                  <div className='w-full sm:w-64'>
                    <input
                      type='text'
                      placeholder='Search by name or city...'
                      value={restaurantSearch}
                      onChange={e => setRestaurantSearch(e.target.value)}
                      className='w-full px-3 py-1.5 rounded-xl border border-blinkit-border bg-blinkit-bg text-xs outline-0 focus:border-blinkit-green'
                    />
                  </div>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  {restaurants
                    .filter(shop =>
                      shop.name?.toLowerCase().includes(restaurantSearch.toLowerCase()) ||
                      shop.city?.toLowerCase().includes(restaurantSearch.toLowerCase())
                    )
                    .map(shop => (
                      <div key={shop._id} className='p-4 rounded-2xl border border-blinkit-border bg-blinkit-bg/40 flex flex-col justify-between gap-3 hover:border-blinkit-green/40 transition'>
                        <div className='flex items-start gap-3'>
                          <div className='w-14 h-14 rounded-xl bg-blinkit-green-soft overflow-hidden flex items-center justify-center shrink-0 border border-blinkit-border'>
                            {shop.image ? (
                              <img src={shop.image} alt={shop.name} className='w-full h-full object-cover' />
                            ) : (
                              <FaStore className='text-blinkit-green text-xl' />
                            )}
                          </div>
                          <div className='flex-1 min-w-0'>
                            <h4 className='font-bold text-blinkit-text text-sm truncate'>{shop.name}</h4>
                            <p className='text-xs text-blinkit-text-secondary truncate'>{shop.address || shop.city} • Commission: {shop.commissionRate ?? 15}%</p>
                            <div className='flex items-center gap-2 mt-1'>
                              <span className={`chip text-[10px] font-bold ${shop.status === 'suspended' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700'}`}>
                                {shop.status || 'active'}
                              </span>
                              {shop.owner?.fullName && (
                                <span className='text-[10px] text-blinkit-text-muted'>Owner: {shop.owner.fullName}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className='flex items-center justify-end gap-2 pt-2 border-t border-blinkit-border-light'>
                          <button
                            onClick={() => handleSelectShop(shop)}
                            className='btn btn-primary !py-1.5 !px-3 text-xs flex items-center gap-1.5 cursor-pointer'
                          >
                            <FaUtensils size={11} />
                            <span>Manage Menu</span>
                          </button>
                          <button
                            onClick={() => handleToggleShop(shop)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                              shop.status === 'suspended' ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' : 'bg-red-100 text-red-800 hover:bg-red-200'
                            }`}
                          >
                            {shop.status === 'suspended' ? 'Activate' : 'Suspend'}
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </>
            ) : (
              /* Selected Restaurant Menu Management */
              <div>
                <div className='flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-blinkit-border-light mb-5 gap-3'>
                  <div className='flex items-center gap-3'>
                    <button
                      onClick={() => setSelectedShop(null)}
                      className='p-2 rounded-xl bg-blinkit-bg hover:bg-blinkit-green-soft text-blinkit-text transition cursor-pointer border border-blinkit-border'
                      title='Back to all restaurants'
                    >
                      <FaArrowLeft size={14} />
                    </button>
                    <div>
                      <h3 className='font-display text-lg font-bold text-blinkit-text flex items-center gap-2'>
                        <span>{selectedShop.name}</span>
                        <span className={`chip text-[10px] font-bold ${selectedShop.status === 'suspended' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700'}`}>
                          {selectedShop.status || 'active'}
                        </span>
                      </h3>
                      <p className='text-xs text-blinkit-text-muted'>
                        {selectedShop.city} • Commission: {selectedShop.commissionRate ?? 15}% • {menuItems.length} items
                      </p>
                    </div>
                  </div>

                  <div className='flex items-center gap-2'>
                    <button
                      onClick={() => setShowAddModal(true)}
                      className='btn btn-primary !py-2 !px-4 text-xs flex items-center gap-1.5 cursor-pointer shadow-sm'
                    >
                      <FaPlus size={12} />
                      <span>Add Menu Item</span>
                    </button>
                  </div>
                </div>

                {loadingMenu ? (
                  <div className='py-16 text-center text-xs text-blinkit-text-muted'>
                    <FaRotateRight className='animate-spin mx-auto text-xl mb-2 text-blinkit-green' />
                    <span>Loading restaurant menu...</span>
                  </div>
                ) : menuItems.length === 0 ? (
                  <div className='py-12 text-center text-xs text-blinkit-text-muted bg-blinkit-bg rounded-2xl border border-blinkit-border p-6'>
                    <FaUtensils className='mx-auto text-3xl mb-2 text-blinkit-text-muted/40' />
                    <p className='font-bold text-blinkit-text text-sm mb-1'>No food items in this menu yet</p>
                    <p className='mb-4'>Add menu items directly so customers can order from this restaurant.</p>
                    <button
                      onClick={() => setShowAddModal(true)}
                      className='btn btn-primary !py-2 !px-4 text-xs inline-flex items-center gap-1.5 cursor-pointer'
                    >
                      <FaPlus size={11} />
                      <span>Add First Item</span>
                    </button>
                  </div>
                ) : (
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                    {menuItems.map(item => (
                      <div
                        key={item._id}
                        className='p-4 rounded-2xl border border-blinkit-border bg-blinkit-bg/40 flex flex-col justify-between gap-3 hover:border-blinkit-green/40 transition'
                      >
                        <div className='flex items-start gap-3'>
                          <div className='w-16 h-16 rounded-xl bg-white overflow-hidden flex items-center justify-center shrink-0 border border-blinkit-border'>
                            {item.image ? (
                              <img src={item.image} alt={item.name} className='w-full h-full object-cover' />
                            ) : (
                              <FaUtensils className='text-blinkit-text-muted' />
                            )}
                          </div>
                          <div className='flex-1 min-w-0'>
                            <div className='flex items-center gap-1.5 mb-1'>
                              {/* Veg / Non-Veg Indicator */}
                              <span
                                className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center shrink-0 ${
                                  item.foodType === 'veg' ? 'border-emerald-600' : 'border-red-600'
                                }`}
                                title={item.foodType === 'veg' ? 'Vegetarian' : 'Non-Vegetarian'}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    item.foodType === 'veg' ? 'bg-emerald-600' : 'bg-red-600'
                                  }`}
                                />
                              </span>
                              <h4 className='font-bold text-blinkit-text text-sm truncate'>{item.name}</h4>
                            </div>
                            <span className='chip text-[10px] bg-white border border-blinkit-border text-blinkit-text-secondary'>
                              {item.category || 'General'}
                            </span>
                            <p className='font-display font-bold text-blinkit-green text-sm mt-1'>
                              ₹{item.price}
                            </p>
                            {item.description && (
                              <p className='text-[11px] text-blinkit-text-muted line-clamp-2 mt-1'>
                                {item.description}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Item Moderation Controls */}
                        <div className='pt-2 border-t border-blinkit-border-light flex items-center justify-between gap-2 text-xs'>
                          <div className='flex items-center gap-1.5'>
                            {/* Stock Toggle */}
                            <button
                              onClick={() => handleToggleItemAvailable(item._id, item.isAvailable)}
                              className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition cursor-pointer ${
                                item.isAvailable !== false
                                  ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                  : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
                              }`}
                              title='Toggle stock availability'
                            >
                              {item.isAvailable !== false ? 'In Stock' : 'Out of Stock'}
                            </button>

                            {/* Approval Toggle */}
                            <button
                              onClick={() => handleToggleItemApproved(item._id, item.isApproved !== false)}
                              className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition cursor-pointer ${
                                item.isApproved !== false
                                  ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                              }`}
                              title='Toggle admin approval'
                            >
                              {item.isApproved !== false ? 'Approved' : 'Hidden'}
                            </button>
                          </div>

                          {/* Delete Item */}
                          <button
                            onClick={() => handleDeleteItem(item._id)}
                            className='p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition cursor-pointer'
                            title='Delete Menu Item'
                          >
                            <FaTrash size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Add Menu Item Modal */}
            {showAddModal && selectedShop && (
              <div className='fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4'>
                <div className='bg-white rounded-3xl p-6 w-full max-w-lg border border-blinkit-border shadow-2xl animate-fade-up max-h-[90vh] overflow-y-auto'>
                  <div className='flex items-center justify-between pb-3 border-b border-blinkit-border-light mb-4'>
                    <div>
                      <h4 className='font-display font-bold text-base text-blinkit-text'>Add Menu Item</h4>
                      <p className='text-xs text-blinkit-text-muted'>Add new item to {selectedShop.name}</p>
                    </div>
                    <button
                      onClick={() => setShowAddModal(false)}
                      className='p-1.5 rounded-xl hover:bg-blinkit-bg text-blinkit-text-muted cursor-pointer'
                    >
                      <FaXmark size={16} />
                    </button>
                  </div>

                  <form onSubmit={handleAddItem} className='space-y-3.5 text-xs'>
                    <div>
                      <label className='block font-bold text-blinkit-text mb-1'>Item Name *</label>
                      <input
                        type='text'
                        required
                        placeholder='e.g., Paneer Butter Masala'
                        value={newItemForm.name}
                        onChange={e => setNewItemForm({ ...newItemForm, name: e.target.value })}
                        className='w-full p-2.5 rounded-xl border border-blinkit-border bg-blinkit-bg font-medium text-xs outline-0 focus:border-blinkit-green'
                      />
                    </div>

                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                      <div>
                        <label className='block font-bold text-blinkit-text mb-1'>Category *</label>
                        <select
                          value={newItemForm.category}
                          onChange={e => setNewItemForm({ ...newItemForm, category: e.target.value })}
                          className='w-full p-2.5 rounded-xl border border-blinkit-border bg-blinkit-bg font-medium text-xs outline-0 focus:border-blinkit-green'
                        >
                          {categories
                            .filter(c => c.category !== 'All')
                            .map(c => (
                              <option key={c.category} value={c.category}>
                                {c.category}
                              </option>
                            ))}
                        </select>
                      </div>

                      <div>
                        <label className='block font-bold text-blinkit-text mb-1'>Price (₹) *</label>
                        <input
                          type='number'
                          required
                          min='1'
                          placeholder='e.g., 220'
                          value={newItemForm.price}
                          onChange={e => setNewItemForm({ ...newItemForm, price: e.target.value })}
                          className='w-full p-2.5 rounded-xl border border-blinkit-border bg-blinkit-bg font-medium text-xs outline-0 focus:border-blinkit-green'
                        />
                      </div>
                    </div>

                    <div>
                      <label className='block font-bold text-blinkit-text mb-1'>Food Type *</label>
                      <div className='flex items-center gap-4 pt-1'>
                        <label className='flex items-center gap-2 cursor-pointer font-semibold'>
                          <input
                            type='radio'
                            name='foodType'
                            value='veg'
                            checked={newItemForm.foodType === 'veg'}
                            onChange={() => setNewItemForm({ ...newItemForm, foodType: 'veg' })}
                            className='accent-emerald-600'
                          />
                          <span className='text-emerald-700 font-bold'>Vegetarian</span>
                        </label>
                        <label className='flex items-center gap-2 cursor-pointer font-semibold'>
                          <input
                            type='radio'
                            name='foodType'
                            value='non_veg'
                            checked={newItemForm.foodType === 'non_veg'}
                            onChange={() => setNewItemForm({ ...newItemForm, foodType: 'non_veg' })}
                            className='accent-red-600'
                          />
                          <span className='text-red-700 font-bold'>Non-Vegetarian</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <div className='flex items-center justify-between mb-1'>
                        <label className='block font-bold text-blinkit-text'>Description</label>
                        <button
                          type='button'
                          onClick={handleGenerateAiDesc}
                          disabled={generatingDesc}
                          className='inline-flex items-center gap-1 text-[11px] font-bold text-blinkit-green hover:text-blinkit-green-dark transition cursor-pointer disabled:opacity-50'
                          title='Generate description using Hungry AI'
                        >
                          <FaWandMagicSparkles size={11} className={generatingDesc ? 'animate-spin' : ''} />
                          <span>{generatingDesc ? 'Generating...' : '✨ Write with AI'}</span>
                        </button>
                      </div>
                      <textarea
                        rows='2'
                        placeholder='Brief description of ingredients or taste...'
                        value={newItemForm.description}
                        onChange={e => setNewItemForm({ ...newItemForm, description: e.target.value })}
                        className='w-full p-2.5 rounded-xl border border-blinkit-border bg-blinkit-bg font-medium text-xs outline-0 focus:border-blinkit-green'
                      />
                    </div>

                    <div>
                      <label className='block font-bold text-blinkit-text mb-1'>Item Image (Optional)</label>
                      <input
                        type='file'
                        accept='image/*'
                        onChange={e => setNewItemForm({ ...newItemForm, image: e.target.files[0] })}
                        className='w-full text-xs text-blinkit-text-secondary file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blinkit-green-soft file:text-blinkit-green-dark hover:file:bg-blinkit-green/20 cursor-pointer'
                      />
                    </div>

                    <div className='flex items-center justify-end gap-2 pt-3 border-t border-blinkit-border-light'>
                      <button
                        type='button'
                        onClick={() => setShowAddModal(false)}
                        className='px-4 py-2 rounded-xl text-xs font-semibold text-blinkit-text-secondary hover:bg-blinkit-bg transition cursor-pointer'
                      >
                        Cancel
                      </button>
                      <button
                        type='submit'
                        disabled={addingItem}
                        className='btn btn-primary !py-2 !px-5 text-xs cursor-pointer'
                      >
                        {addingItem ? 'Adding Item...' : 'Add Item'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
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
