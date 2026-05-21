import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import Spinner from '../components/common/Spinner';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { toast.error('Please fill all fields'); return; }
    setLoading(true);
    try {
      const data = await login(email.trim(), password);
      toast.success(`Welcome back, ${data.user.name.split(' ')[0]}!`);
      navigate(data.user.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-surface flex flex-col items-center justify-center p-5 relative overflow-hidden">
      {/* Ambient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-[-20%] right-[-15%] w-[500px] h-[500px] rounded-full opacity-60"
          style={{ background: 'radial-gradient(circle, rgba(245,197,24,0.06) 0%, transparent 65%)' }}
        />
        <div
          className="absolute bottom-[-15%] left-[-10%] w-[400px] h-[400px] rounded-full opacity-40"
          style={{ background: 'radial-gradient(circle, rgba(245,197,24,0.04) 0%, transparent 65%)' }}
        />
        {/* Subtle grid lines */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '80px 80px',
          }}
        />
      </div>

      <div className="w-full max-w-[360px] animate-slide-up relative">
        {/* Logo section */}
        <div className="text-center mb-10">
          <div className="inline-flex relative mb-6 animate-float">
            {/* Glow ring */}
            <div
              className="absolute inset-[-6px] rounded-[22px]"
              style={{ background: 'radial-gradient(circle, rgba(245,197,24,0.12) 0%, transparent 70%)' }}
            />
            <div
              className="w-20 h-20 rounded-2xl overflow-hidden relative"
              style={{ boxShadow: '0 0 0 1px rgba(245,197,24,0.15), 0 0 0 4px rgba(245,197,24,0.05), 0 16px 40px rgba(0,0,0,0.7)' }}
            >
              <img src="/icon-192.png" alt="To Fly Media" className="w-full h-full object-cover" />
            </div>
          </div>
          <p className="text-gray-600 text-sm tracking-wide">Sign in to your workspace</p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-6 relative overflow-hidden"
          style={{
            background: '#0f0f0f',
            backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 60%)',
            border: '1px solid rgba(255,255,255,0.07)',
            boxShadow: '0 1px 0 rgba(255,255,255,0.04) inset, 0 24px 64px rgba(0,0,0,0.6)',
          }}
        >
          {/* Top edge highlight */}
          <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="label">Email address</label>
              <input
                type="email"
                className="input"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                disabled={loading}
              />
            </div>

            <div className="space-y-1.5">
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  className="input pr-11"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-300 transition-colors p-1 rounded-lg"
                >
                  {showPw ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2 py-3.5"
            >
              {loading ? (
                <><Spinner size="sm" className="text-black" /> Signing in…</>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
