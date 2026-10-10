import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FaGear,
  FaCheck,
  FaTriangleExclamation,
  FaLocationDot,
  FaPercent,
  FaReceipt,
  FaMotorcycle,
  FaShieldHalved,
  FaUserShield,
  FaUser,
  FaPhone,
  FaLock,
  FaEnvelope
} from 'react-icons/fa6';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    deliveryRadiusKm: 15,
    defaultCommissionRate: 15,
    platformFee: 5,
    deliveryFee: 30,
    maintenanceMode: false,
    minOrderValue: 0
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Admin Profile & Credentials
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    mobile: '',
    password: ''
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState('');

  useEffect(() => {
    fetchSettings();
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get('/api/admin/auth/me', { withCredentials: true });
      if (res.data?.success && res.data.data) {
        setProfile({
          fullName: res.data.data.fullName || '',
          email: res.data.data.email || '',
          mobile: res.data.data.mobile || '',
          password: ''
        });
      }
    } catch (err) {
      console.error('Failed to load admin profile:', err);
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileError('');
    try {
      setProfileSaving(true);
      setProfileSuccess(false);
      const payload = {
        fullName: profile.fullName,
        email: profile.email,
        mobile: profile.mobile
      };
      if (profile.password && profile.password.trim()) {
        payload.password = profile.password.trim();
      }
      const res = await axios.patch('/api/admin/auth/profile', payload, { withCredentials: true });
      if (res.data?.success) {
        setProfileSuccess(true);
        setProfile(prev => ({ ...prev, password: '' }));
        setTimeout(() => setProfileSuccess(false), 4000);
      }
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to update admin profile');
    } finally {
      setProfileSaving(false);
    }
  };

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/admin/settings', { withCredentials: true });
      if (res.data?.success && res.data.data) {
        setSettings(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setSavedSuccess(false);
      const res = await axios.patch('/api/admin/settings', settings, { withCredentials: true });
      if (res.data?.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3500);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Platform Architecture & Settings
        </h1>
        <p className="text-sm text-slate-500">
          Configure dynamic hyper-local delivery radii, commission splits, fixed fees, and maintenance mode
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <FaCheck />
          <span>Platform settings updated successfully across active dispatch clusters!</span>
        </div>
      )}

      {settings.maintenanceMode && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 flex items-center gap-3">
          <FaTriangleExclamation className="text-xl text-amber-500 flex-shrink-0" />
          <div className="text-xs">
            <span className="font-bold">Maintenance Mode is Active: </span>
            Customer checkout is restricted to safeguard in-flight operations during infrastructure updates.
          </div>
        </div>
      )}

      {/* Admin Account Profile & Credentials Form */}
      <form onSubmit={handleProfileSave} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400">
              <FaUserShield className="text-sm" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Admin Account & Credentials
              </h2>
              <p className="text-xs text-slate-500">
                Update your SuperAdmin Full Name, Email, Mobile number, and Password
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            Role: SuperAdmin
          </span>
        </div>

        {profileSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-fade-in">
            <FaCheck />
            <span>Admin profile and credentials updated successfully!</span>
          </div>
        )}

        {profileError && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs font-semibold flex items-center gap-2 animate-fade-in">
            <FaTriangleExclamation />
            <span>{profileError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <FaUser className="text-[11px] text-slate-400" />
              Admin Full Name
            </label>
            <input
              type="text"
              required
              value={profile.fullName}
              onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
              placeholder="e.g. Hungry SuperAdmin"
              className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <FaEnvelope className="text-[11px] text-slate-400" />
              Admin Login Email
            </label>
            <input
              type="email"
              required
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              placeholder="e.g. admin@hungry.com"
              className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <FaPhone className="text-[11px] text-slate-400" />
              Mobile Number
            </label>
            <input
              type="tel"
              value={profile.mobile}
              onChange={(e) => setProfile({ ...profile, mobile: e.target.value })}
              placeholder="e.g. 9999999999"
              className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <FaLock className="text-[11px] text-slate-400" />
              New Password (Optional)
            </label>
            <input
              type="password"
              value={profile.password}
              onChange={(e) => setProfile({ ...profile, password: e.target.value })}
              placeholder="Leave blank to keep unchanged"
              className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
            />
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={profileSaving}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-slate-900 dark:bg-orange-600 hover:bg-slate-800 dark:hover:bg-orange-700 shadow-md transition cursor-pointer disabled:opacity-50"
          >
            {profileSaving ? 'Updating...' : 'Update Admin Credentials'}
          </button>
        </div>
      </form>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Hyper-local Dispatch Settings */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400">
              <FaLocationDot className="text-sm" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Dispatch & Hyper-Local Geo Radius
              </h2>
              <p className="text-xs text-slate-500">
                Controls automatic delivery partner proximity matching
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Maximum Dispatch Radius (km)
              </label>
              <input
                type="number"
                min="1"
                max="100"
                step="0.5"
                required
                value={settings.deliveryRadiusKm}
                onChange={(e) => setSettings({ ...settings, deliveryRadiusKm: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Orders are broadcast only to riders within {settings.deliveryRadiusKm} km of restaurant.
              </span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Minimum Cart Checkout Threshold (₹)
              </label>
              <input
                type="number"
                min="0"
                value={settings.minOrderValue}
                onChange={(e) => setSettings({ ...settings, minOrderValue: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Minimum bill required before customer can submit an order (0 = disabled).
              </span>
            </div>
          </div>
        </div>

        {/* Tariffs & Monetization */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <FaPercent className="text-sm" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Platform Economics & Monetization Tariffs
              </h2>
              <p className="text-xs text-slate-500">
                Default baseline cuts applied to customer carts and store billings
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Default Commission Take (%)
              </label>
              <input
                type="number"
                min="0"
                max="50"
                step="0.5"
                required
                value={settings.defaultCommissionRate}
                onChange={(e) => setSettings({ ...settings, defaultCommissionRate: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Baseline commission unless overridden per store.
              </span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Platform Service Charge (₹)
              </label>
              <input
                type="number"
                min="0"
                required
                value={settings.platformFee}
                onChange={(e) => setSettings({ ...settings, platformFee: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Fixed technology convenience fee per checkout.
              </span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Standard Delivery Charge (₹)
              </label>
              <input
                type="number"
                min="0"
                required
                value={settings.deliveryFee}
                onChange={(e) => setSettings({ ...settings, deliveryFee: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Standard delivery cost applied to order.
              </span>
            </div>
          </div>
        </div>

        {/* System Operations & Maintenance Toggle */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="p-2 rounded-lg bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
              <FaShieldHalved className="text-sm" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Platform Availability & Maintenance Mode
              </h2>
              <p className="text-xs text-slate-500">
                Emergency kill-switch to pause new order ingestion
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                Enable Maintenance Mode
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                When active, storefront displays maintenance banner and stops payment processing.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}
              className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ease-in-out ${
                settings.maintenanceMode ? 'bg-rose-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                  settings.maintenanceMode ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 shadow-md shadow-orange-500/20 transition cursor-pointer disabled:opacity-50"
          >
            {saving ? 'Applying Settings...' : 'Save Platform Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
