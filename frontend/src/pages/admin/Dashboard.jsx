import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Spinner from '../../components/common/Spinner';
import StatusBadge from '../../components/common/StatusBadge';

const fmt = (d) => d ? new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : '—';

function StatCard({ label, value, sub, accent }) {
  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-1.5 animate-fade-in relative overflow-hidden"
      style={{
        background: '#0f0f0f',
        backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.025) 0%, transparent 60%)',
        border: `1px solid ${accent}18`,
        boxShadow: `0 1px 0 rgba(255,255,255,0.03) inset, 0 8px 24px rgba(0,0,0,0.3)`,
      }}
    >
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${accent}20, transparent)` }} />
      <p className="text-[10px] text-gray-600 uppercase tracking-[0.1em] font-medium">{label}</p>
      <p className="text-3xl font-display font-bold" style={{ color: accent }}>{value ?? '—'}</p>
      {sub && <p className="text-[10px] text-gray-700">{sub}</p>}
    </div>
  );
}

export default function AdminDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = useCallback(async () => {
    try {
      const { data } = await api.get('/admin/dashboard');
      setDashboard(data.dashboard);
    } catch { toast.error('Failed to load dashboard'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchDashboard();
    const t = setInterval(fetchDashboard, 60000);
    return () => clearInterval(t);
  }, [fetchDashboard]);

  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <Spinner size="lg" className="text-brand-500" />
    </div>
  );

  const attendancePct = dashboard?.totalEmployees > 0
    ? Math.round((dashboard.checkedIn / dashboard.totalEmployees) * 100) : 0;

  return (
    <div className="p-5 md:p-8 max-w-5xl mx-auto space-y-5 animate-fade-in">
      {/* Header */}
      <div className="animate-slide-up">
        <h1 className="page-title">Dashboard</h1>
        <p className="text-gray-600 text-sm mt-1 font-mono">{today}</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 stagger">
        <StatCard label="Total Employees" value={dashboard?.totalEmployees} accent="#F5C518" />
        <StatCard label="Present Today"   value={dashboard?.present}        accent="#34d399" />
        <StatCard label="Late Today"      value={dashboard?.late}           accent="#fbbf24" />
        <StatCard label="Absent Today"    value={dashboard?.absent}         accent="#f87171" />
      </div>

      {/* Attendance rate bar */}
      <div
        className="rounded-2xl p-5 relative overflow-hidden animate-fade-in"
        style={{
          background: '#0f0f0f',
          backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.025) 0%, transparent 60%)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />
        <div className="flex items-center justify-between mb-4">
          <p className="section-title">Today's Attendance Rate</p>
          <span className="font-display font-bold text-2xl text-gradient">{attendancePct}%</span>
        </div>
        {/* Progress bar */}
        <div className="relative w-full h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <div
            className="absolute left-0 top-0 h-full rounded-full transition-all duration-1000"
            style={{
              width: `${attendancePct}%`,
              background: 'linear-gradient(90deg, #F5C518, #e6b800)',
              boxShadow: '0 0 8px rgba(245,197,24,0.4)',
            }}
          />
        </div>
        <div className="flex justify-between mt-2 text-[11px] text-gray-600">
          <span>{dashboard?.checkedIn ?? 0} checked in</span>
          <span>{dashboard?.totalEmployees ?? 0} total</span>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Live feed - 2 cols */}
        <div
          className="md:col-span-2 rounded-2xl p-5 relative overflow-hidden"
          style={{
            background: '#0f0f0f',
            backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.025) 0%, transparent 60%)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/6 to-transparent" />
          <div className="flex items-center gap-2 mb-4">
            <span className="glow-dot" />
            <p className="section-title">Live Check-in Feed</p>
          </div>

          {!dashboard?.liveFeed?.length ? (
            <div className="text-center py-10">
              <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center mx-auto mb-3">
                <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-600 text-sm">No check-ins yet today</p>
            </div>
          ) : (
            <div className="space-y-0.5">
              {dashboard.liveFeed.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-3 transition-colors"
                  style={{ borderBottom: i < dashboard.liveFeed.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-black flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #F5C518, #e6b800)', fontFamily: 'Syne, sans-serif' }}
                    >
                      {item.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-200">{item.name}</p>
                      <p className="text-[11px] text-gray-600">{item.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={item.status} />
                    <p className="text-[10px] text-gray-600 mt-1 font-mono">{fmt(item.checkInTime)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Avg work hours */}
        <div
          className="rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden"
          style={{
            background: '#0f0f0f',
            backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.025) 0%, transparent 60%)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/6 to-transparent" />
          <div>
            <p className="label mb-3">Avg Work Hours</p>
            <p className="font-display font-bold text-5xl text-white leading-none">{dashboard?.avgWorkHours || 0}</p>
            <p className="text-gray-600 text-sm mt-1">hours today</p>
          </div>
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center mt-4"
            style={{ background: 'rgba(245,197,24,0.08)', border: '1px solid rgba(245,197,24,0.15)' }}
          >
            <svg className="w-6 h-6 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
