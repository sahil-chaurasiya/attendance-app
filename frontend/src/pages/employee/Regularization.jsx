import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';

// ─── Constants ────────────────────────────────────────────────────────────────

const REQUEST_TYPES = [
  { value: 'missing_checkin',   label: 'Missing Check-In',         needsIn: true,  needsOut: false },
  { value: 'missing_checkout',  label: 'Missing Check-Out',        needsIn: false, needsOut: true  },
  { value: 'both',              label: 'Fix Both In & Out',        needsIn: true,  needsOut: true  },
  { value: 'absent_correction', label: 'Marked Absent (Was Present)', needsIn: true,  needsOut: true  },
];

const STATUS_STYLES = {
  pending:  'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30',
  approved: 'bg-green-500/15 text-green-400 border border-green-500/30',
  rejected: 'bg-red-500/15 text-red-400 border border-red-500/30',
};

const fmt = (dateStr) =>
  dateStr ? new Date(dateStr).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—';

const fmtDate = (d) =>
  d ? new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : '—';

const TYPE_LABEL = Object.fromEntries(REQUEST_TYPES.map(t => [t.value, t.label]));

// ─── Sub-components ───────────────────────────────────────────────────────────

function RequestCard({ req, onCancel }) {
  const [cancelling, setCancelling] = useState(false);

  const handleCancel = async () => {
    if (!confirm('Cancel this request?')) return;
    setCancelling(true);
    try { await onCancel(req._id); } finally { setCancelling(false); }
  };

  return (
    <div className="bg-surface-card border border-surface-border rounded-2xl p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-gray-200">{fmtDate(req.date)}</p>
          <p className="text-xs text-gray-500 mt-0.5">{TYPE_LABEL[req.requestType] || req.requestType}</p>
        </div>
        <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${STATUS_STYLES[req.status]}`}>
          {req.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        {req.requestedCheckIn && (
          <div className="bg-surface rounded-xl p-2.5">
            <p className="text-gray-500 mb-0.5">Requested In</p>
            <p className="text-gray-200 font-medium">{fmt(req.requestedCheckIn)}</p>
          </div>
        )}
        {req.requestedCheckOut && (
          <div className="bg-surface rounded-xl p-2.5">
            <p className="text-gray-500 mb-0.5">Requested Out</p>
            <p className="text-gray-200 font-medium">{fmt(req.requestedCheckOut)}</p>
          </div>
        )}
      </div>

      <div className="bg-surface rounded-xl p-2.5 text-xs">
        <p className="text-gray-500 mb-0.5">Reason</p>
        <p className="text-gray-300">{req.reason}</p>
      </div>

      {req.adminNote && (
        <div className="bg-surface rounded-xl p-2.5 text-xs border border-surface-border">
          <p className="text-gray-500 mb-0.5">Admin Note</p>
          <p className="text-gray-300">{req.adminNote}</p>
        </div>
      )}

      {req.status === 'pending' && (
        <button
          onClick={handleCancel}
          disabled={cancelling}
          className="w-full text-xs text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-500/60 rounded-xl py-2 transition-all duration-200 disabled:opacity-50"
        >
          {cancelling ? 'Cancelling…' : 'Cancel Request'}
        </button>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function EmployeeRegularization() {
  const [requests, setRequests]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState('');
  const [filterStatus, setFilter]   = useState('all');

  // Form state
  const [form, setForm] = useState({
    date: '',
    requestType: '',
    checkInTime: '',
    checkOutTime: '',
    reason: '',
  });

  const selectedType = REQUEST_TYPES.find(t => t.value === form.requestType);

  const fetchRequests = useCallback(async () => {
    try {
      const { data } = await api.get('/regularization/my-requests');
      setRequests(data.requests || []);
    } catch {
      setError('Failed to load requests');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const handleSubmit = async () => {
    setError('');
    if (!form.date || !form.requestType || !form.reason.trim()) {
      setError('Date, request type and reason are required');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/regularization/request', {
        date:         form.date,
        requestType:  form.requestType,
        checkInTime:  form.checkInTime  || undefined,
        checkOutTime: form.checkOutTime || undefined,
        reason:       form.reason.trim(),
      });
      setSuccess('Request submitted! Admin will review it soon.');
      setShowForm(false);
      setForm({ date: '', requestType: '', checkInTime: '', checkOutTime: '', reason: '' });
      fetchRequests();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (id) => {
    await api.delete(`/regularization/${id}`);
    fetchRequests();
  };

  const filtered = filterStatus === 'all' ? requests : requests.filter(r => r.status === filterStatus);

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-display font-bold text-white">Regularization</h1>
          <p className="text-xs text-gray-500 mt-0.5">Fix incorrect or missing attendance</p>
        </div>
        <button
          onClick={() => { setShowForm(v => !v); setError(''); }}
          className="btn-primary text-sm px-4 py-2"
        >
          {showForm ? 'Cancel' : '+ New Request'}
        </button>
      </div>

      {/* Flash messages */}
      {success && (
        <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm rounded-2xl px-4 py-3 flex items-center justify-between">
          {success}
          <button onClick={() => setSuccess('')} className="text-green-300 hover:text-green-100 ml-2">✕</button>
        </div>
      )}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-2xl px-4 py-3 flex items-center justify-between">
          {error}
          <button onClick={() => setError('')} className="text-red-300 hover:text-red-100 ml-2">✕</button>
        </div>
      )}

      {/* ── New Request Form ── */}
      {showForm && (
        <div className="bg-surface-card border border-surface-border rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-200">New Regularization Request</h2>

          {/* Date */}
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Date to Correct</label>
            <input
              type="date"
              max={today}
              value={form.date}
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              className="input w-full"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">What needs fixing?</label>
            <div className="grid grid-cols-1 gap-2">
              {REQUEST_TYPES.map(t => (
                <button
                  key={t.value}
                  onClick={() => setForm(f => ({ ...f, requestType: t.value, checkInTime: '', checkOutTime: '' }))}
                  className={`text-left text-sm px-3 py-2.5 rounded-xl border transition-all duration-200
                    ${form.requestType === t.value
                      ? 'bg-brand-500/15 border-brand-500/50 text-brand-400'
                      : 'border-surface-border text-gray-400 hover:border-gray-500 hover:text-gray-200'}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Time inputs — shown only when relevant */}
          {selectedType?.needsIn && (
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">
                {form.requestType === 'both' || form.requestType === 'both' ? 'Check-In Time' : 'Correct Check-In Time'}
              </label>
              <input
                type="time"
                value={form.checkInTime}
                onChange={e => setForm(f => ({ ...f, checkInTime: e.target.value }))}
                className="input w-full"
              />
            </div>
          )}

          {selectedType?.needsOut && (
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">
                {form.requestType === 'both' ? 'Check-Out Time' : 'Correct Check-Out Time'}
              </label>
              <input
                type="time"
                value={form.checkOutTime}
                onChange={e => setForm(f => ({ ...f, checkOutTime: e.target.value }))}
                className="input w-full"
              />
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Reason <span className="text-gray-600">(be specific)</span></label>
            <textarea
              rows={3}
              placeholder="e.g. Forgot to check out before leaving for an emergency meeting…"
              value={form.reason}
              onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
              className="input w-full resize-none"
              maxLength={500}
            />
            <p className="text-right text-[10px] text-gray-600 mt-1">{form.reason.length}/500</p>
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="btn-primary w-full py-2.5 text-sm disabled:opacity-50"
          >
            {submitting ? 'Submitting…' : 'Submit Request'}
          </button>
        </div>
      )}

      {/* ── Filter bar ── */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {['all', 'pending', 'approved', 'rejected'].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full border transition-all duration-200 capitalize
              ${filterStatus === s
                ? 'bg-brand-500/20 border-brand-500/50 text-brand-400'
                : 'border-surface-border text-gray-500 hover:text-gray-300'}`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* ── List ── */}
      {loading ? (
        <div className="text-center text-gray-500 py-12 text-sm">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 space-y-2">
          <div className="text-4xl">📋</div>
          <p className="text-gray-500 text-sm">No requests found</p>
          {filterStatus !== 'all' && (
            <button onClick={() => setFilter('all')} className="text-brand-500 text-xs hover:underline">Show all</button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(r => (
            <RequestCard key={r._id} req={r} onCancel={handleCancel} />
          ))}
        </div>
      )}
    </div>
  );
}