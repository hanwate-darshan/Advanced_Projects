import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import adminApi from '../api';
import { FaShieldHalved, FaLock, FaEnvelope, FaEye, FaEyeSlash, FaArrowRight } from 'react-icons/fa6';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if already authenticated as admin
    adminApi.get('/api/admin/auth/me')
      .then(res => {
        const user = res.data?.data || res.data?.user;
        if (res.data?.success && user?.role === 'admin') {
          navigate('/admin', { replace: true });
        }
      })
      .catch(() => {});
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await adminApi.post('/api/admin/auth/login', { email, password });

      if (res.data?.success) {
        navigate('/admin', { replace: true });
      } else {
        setError(res.data?.message || 'Login failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid admin credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo Card Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 shadow-xl shadow-orange-500/20 text-white mb-4">
            <FaShieldHalved className="text-2xl" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Hungry Operations Hub
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Sign in with authorized administrative privileges
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Admin Email
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@hungry.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Enter Admin Portal</span>
                  <FaArrowRight className="text-xs" />
                </>
              )}
            </button>
          </form>

          {/* Quick-fill helper */}
          <div className="mt-6 pt-5 border-t border-slate-800 text-center">
            <button
              type="button"
              onClick={() => {
                setEmail('admin@hungry.com');
                setPassword('admin123');
              }}
              className="text-xs text-orange-400 hover:text-orange-300 font-medium transition cursor-pointer"
            >
              Autofill Default Credentials (admin@hungry.com / admin123)
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-slate-500 mt-6">
          Hungry Platform Operations • Restricted Access Only
        </p>
      </div>
    </div>
  );
}
