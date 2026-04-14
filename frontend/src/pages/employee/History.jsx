import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import StatusBadge from '../../components/common/StatusBadge';
import Spinner from '../../components/common/Spinner';
import { notifySundayHoliday } from '../../services/notifications';

const fmt = (d) => d ? new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' }) : '—';
const fmtH = (h) => { if (!h) return '—'; const hrs = Math.floor(h); const min = Math.round((h - hrs) * 60); return `${hrs}h ${min}m`; };

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const DATA_START = new Date('2026-04-01T00:00:00+05:30');

// Count Mon–Sat working days elapsed in a month, capped at today
const countWorkingDays = (month, year) => {
  const nowIST = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  nowIST.setHours(23, 59, 59, 999);

  const monthStart = new Date(year, month - 1, 1);
  const monthEnd   = new Date(year, month, 0);

  const effectiveStart = monthStart < DATA_START ? DATA_START : monthStart;
  const effectiveEnd   = monthEnd < nowIST ? monthEnd : nowIST;

  if (effectiveStart > effectiveEnd) return 0;

  let count = 0;
  const cur = new Date(effectiveStart);
  cur.setHours(0, 0, 0, 0);
  while (cur <= effectiveEnd) {
    if (cur.getDay() !== 0) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
};

// A record is "fully attended" only if BOTH check-in AND check-out exist
const isFullyAttended = (record) => record && record.checkInTime && record.checkOutTime;

// Build a calendar grid for the given month/year
function buildCalendarGrid(month, year, records) {
  const nowIST = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  nowIST.setHours(23, 59, 59, 999);

  const firstDay = new Date(year, month - 1, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month, 0).getDate();

  const byDate = {};
  for (const r of records) {
    byDate[r.date] = r;
  }

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month - 1, d);
    const dateStr = `${year}-${String(month).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const isSunday = date.getDay() === 0;
    const isPast = date <= nowIST;
    const isToday = date.toDateString() === nowIST.toDateString();
    const isBeforeStart = date < DATA_START;
    const record = byDate[dateStr] || null;

    // Determine display status
    // A day is present/late ONLY if BOTH check-in and check-out exist
    // A day with check-in but no check-out = absent (record still stored)
    let status = null;
    if (isBeforeStart) {
      status = 'na';
    } else if (isSunday && isPast) {
      status = 'sunday';
    } else if (isFullyAttended(record)) {
      status = record.status; // 'present' or 'late'
    } else if (record?.checkInTime && !record?.checkOutTime && !isToday) {
      // Checked in but no checkout on a past day = absent
      status = 'absent';
    } else if (isPast && !isToday && !isSunday) {
      status = 'absent';
    } else if (isToday && !isFullyAttended(record)) {
      status = 'today';
    }

    days.push({ d, dateStr, date, isSunday, isPast, isToday, isBeforeStart, record, status });
  }

  return days;
}

// Day cell colors — absent is RED
function getDayStyle(status, isToday) {
  if (status === 'na')      return 'bg-surface-border/20 text-gray-700';
  if (status === 'sunday')  return 'bg-brand-600/15 border border-brand-600/30 text-brand-600';
  if (status === 'present') return 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300';
  if (status === 'late')    return 'bg-amber-500/15 border border-amber-500/30 text-amber-300';
  if (status === 'absent')  return 'bg-red-500/20 border border-red-500/40 text-red-400';
  if (status === 'today')   return isToday ? 'bg-brand-500/15 border border-brand-500/40 text-brand-300 ring-1 ring-brand-500/50' : '';
  return 'bg-surface-card text-gray-400';
}

function getDayDot(status) {
  if (status === 'sunday')  return 'bg-brand-600';
  if (status === 'present') return 'bg-emerald-400';
  if (status === 'late')    return 'bg-amber-400';
  if (status === 'absent')  return 'bg-red-400';
  return null;
}

// Modal for day detail
function DayDetailModal({ day, onClose }) {
  if (!day) return null;
  const { d, dateStr, isSunday, isBeforeStart, record, status } = day;

  const dateLabel = new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  const noCheckout = record?.checkInTime && !record?.checkOutTime;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="bg-surface-card border border-surface-border rounded-t-2xl sm:rounded-2xl w-full sm:max-w-sm p-6 animate-slide-up overflow-y-auto" style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 1.5rem)', maxHeight: '85dvh' }} onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-white font-display font-bold text-lg">{dateLabel}</p>
            {isSunday && <p className="text-brand-600 text-xs mt-0.5">☀️ Sunday Holiday</p>}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-surface-hover transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {isBeforeStart ? (
          <p className="text-gray-400 text-sm text-center py-4">No data before app launch (Apr 2026)</p>
        ) : isSunday ? (
          <div className="space-y-3">
            <div className="bg-brand-600/10 border border-brand-600/20 rounded-xl p-4 text-center">
              <p className="text-3xl mb-2">🌟</p>
              <p className="text-brand-600 font-semibold">Sunday Rest Day</p>
              <p className="text-gray-400 text-xs mt-1">Automatically marked as present</p>
            </div>
          </div>
        ) : status === 'absent' ? (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
            <p className="text-3xl mb-2">😔</p>
            <p className="text-red-400 font-semibold">Absent</p>
            {noCheckout ? (
              <>
                <p className="text-gray-400 text-xs mt-1">Checked in but did not check out</p>
                <div className="mt-3 bg-surface-DEFAULT rounded-lg p-3">
                  <p className="text-[10px] text-gray-500 mb-0.5">CHECK IN (recorded)</p>
                  <p className="font-mono text-sm font-semibold text-emerald-400">{fmt(record.checkInTime)}</p>
                </div>
                <p className="text-red-300 text-xs mt-2 font-medium">⚠️ No checkout = Marked Absent</p>
              </>
            ) : (
              <p className="text-gray-400 text-xs mt-1">No check-in recorded</p>
            )}
          </div>
        ) : isFullyAttended(record) ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <StatusBadge status={record.status} />
            </div>
            <div className="grid grid-cols-3 gap-3 text-center bg-surface-DEFAULT rounded-xl p-4">
              <div>
                <p className="text-[10px] text-gray-500 mb-1">CHECK IN</p>
                <p className="font-mono text-sm font-semibold text-emerald-400">{fmt(record.checkInTime)}</p>
              </div>
              <div className="border-x border-surface-border">
                <p className="text-[10px] text-gray-500 mb-1">CHECK OUT</p>
                <p className="font-mono text-sm font-semibold text-amber-400">{fmt(record.checkOutTime)}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 mb-1">HOURS</p>
                <p className="font-mono text-sm font-semibold text-brand-500">{fmtH(record.workHours)}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-400 text-sm">No record for this day</p>
          </div>
        )}

        <button onClick={onClose} className="mt-4 w-full py-2.5 rounded-xl bg-surface-hover text-gray-300 text-sm font-medium hover:bg-surface-border transition-colors">
          Close
        </button>
      </div>
    </div>
  );
}

const getValidYears = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let y = 2026; y <= currentYear; y++) years.push(y);
  return years;
};

export default function EmployeeHistory() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear]   = useState(now.getFullYear());
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [view, setView] = useState('calendar'); // 'calendar' | 'list'
  const [sundayNotified, setSundayNotified] = useState(false);

  const handleYearChange = (newYear) => {
    setYear(Number(newYear));
    if (Number(newYear) === 2026 && month < 4) setMonth(4);
  };

  const handleMonthChange = (newMonth) => {
    if (year === 2026 && Number(newMonth) < 4) return;
    setMonth(Number(newMonth));
  };

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const lastDay = new Date(year, month, 0).getDate();
        const { data } = await api.get('/attendance/history', { params: { month, year, limit: lastDay } });
        setRecords(data.attendance);
      } catch {
        toast.error('Failed to load history');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [month, year]);

  useEffect(() => {
    const today = new Date();
    const isSundayToday = today.getDay() === 0;
    const isCurrentMonth = today.getMonth() + 1 === month && today.getFullYear() === year;
    if (isSundayToday && isCurrentMonth && !sundayNotified) {
      notifySundayHoliday();
      setSundayNotified(true);
    }
  }, [month, year, sundayNotified]);

  const calendarDays = buildCalendarGrid(month, year, records);

  // Count only fully completed days (check-in + check-out) as present/late
  const present = records.filter(r => isFullyAttended(r) && r.status === 'present').length;
  const late    = records.filter(r => isFullyAttended(r) && r.status === 'late').length;
  const withFullAttendance = present + late;

  const nowIST = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const passedSundays = calendarDays.filter(d => d && d.isSunday && d.isPast && !d.isBeforeStart).length;

  const workingDays = countWorkingDays(month, year);
  const absent = Math.max(0, workingDays - withFullAttendance);
  const validYears = getValidYears();

  return (
    <div className="min-h-full bg-surface px-4 pt-6 pb-8 max-w-md mx-auto space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="page-title">Attendance History</h1>
        <div className="flex items-center gap-1 bg-surface-card border border-surface-border rounded-xl p-1">
          <button
            onClick={() => setView('calendar')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${view === 'calendar' ? 'bg-brand-500/20 text-brand-500' : 'text-gray-400 hover:text-gray-200'}`}
          >
            📅 Calendar
          </button>
          <button
            onClick={() => setView('list')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${view === 'list' ? 'bg-brand-500/20 text-brand-500' : 'text-gray-400 hover:text-gray-200'}`}
          >
            📋 List
          </button>
        </div>
      </div>

      {/* Month/Year selector */}
      <div className="flex gap-3">
        <select value={month} onChange={e => handleMonthChange(e.target.value)} className="input flex-1">
          {MONTHS.map((m, i) => {
            const isDisabled = year === 2026 && i + 1 < 4;
            return <option key={i} value={i + 1} disabled={isDisabled}>{m}</option>;
          })}
        </select>
        <select value={year} onChange={e => handleYearChange(e.target.value)} className="input w-28">
          {validYears.map(y => <option key={y}>{y}</option>)}
        </select>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-2">
        <div className="stat-card text-center p-3">
          <p className="text-xl font-display font-bold text-emerald-400">{present}</p>
          <p className="text-[10px] text-gray-400">Present</p>
        </div>
        <div className="stat-card text-center p-3">
          <p className="text-xl font-display font-bold text-amber-400">{late}</p>
          <p className="text-[10px] text-gray-400">Late</p>
        </div>
        <div className="stat-card text-center p-3">
          <p className="text-xl font-display font-bold text-red-400">{absent}</p>
          <p className="text-[10px] text-gray-400">Absent</p>
        </div>
        <div className="stat-card text-center p-3">
          <p className="text-xl font-display font-bold text-brand-600">{passedSundays}</p>
          <p className="text-[10px] text-gray-400">Sundays</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Spinner size="lg" /></div>
      ) : view === 'calendar' ? (
        /* ── Calendar View ── */
        <div className="card p-4 space-y-3">
          <p className="text-sm font-semibold text-gray-300 text-center">{MONTHS[month - 1]} {year}</p>

          <div className="grid grid-cols-7 gap-1 mb-1">
            {DAY_NAMES.map(d => (
              <div key={d} className={`text-center text-[10px] font-bold py-1 ${d === 'Sun' ? 'text-brand-600' : 'text-gray-500'}`}>
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, i) => {
              if (!day) return <div key={`empty-${i}`} />;
              const styleClass = getDayStyle(day.status, day.isToday);
              const dot = getDayDot(day.status);
              const isClickable = !day.isBeforeStart;

              return (
                <button
                  key={day.dateStr}
                  onClick={() => isClickable && setSelectedDay(day)}
                  className={`relative aspect-square rounded-xl flex flex-col items-center justify-center transition-all duration-150
                    ${styleClass}
                    ${isClickable ? 'cursor-pointer hover:scale-105 active:scale-95' : 'cursor-default opacity-30'}
                    ${day.isToday ? 'ring-2 ring-brand-500/60' : ''}
                  `}
                >
                  <span className={`text-xs font-semibold leading-none ${day.isSunday ? 'text-brand-600' : ''}`}>
                    {day.d}
                  </span>
                  {dot && (
                    <span className={`w-1 h-1 rounded-full mt-0.5 ${dot}`} />
                  )}
                  {day.isToday && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-brand-400 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 pt-2 border-t border-surface-border">
            {[
              { color: 'bg-emerald-400', label: 'Present' },
              { color: 'bg-amber-400',   label: 'Late' },
              { color: 'bg-red-400',     label: 'Absent' },
              { color: 'bg-brand-600',  label: 'Sunday' },
              { color: 'bg-brand-400',   label: 'Today' },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${color}`} />
                <span className="text-[10px] text-gray-400">{label}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* ── List View ── */
        <div className="space-y-3">
          {records.length === 0 ? (
            <div className="card p-10 text-center">
              <p className="text-4xl mb-3">📋</p>
              <p className="text-gray-400">No records for {MONTHS[month - 1]} {year}</p>
            </div>
          ) : (
            records.map((r) => {
              const attended = isFullyAttended(r);
              const noCheckout = r.checkInTime && !r.checkOutTime;
              return (
                <div key={r._id} className={`card p-4 animate-slide-up ${!attended ? 'border border-red-500/20' : ''}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-white text-sm">
                        {new Date(r.date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </p>
                      {noCheckout && <p className="text-xs text-red-400 mt-0.5">⚠️ No checkout — marked absent</p>}
                    </div>
                    <StatusBadge status={attended ? r.status : 'absent'} />
                  </div>

                  {r.checkInTime && (
                    <div className="grid grid-cols-3 gap-2 text-center bg-surface-DEFAULT rounded-xl p-3">
                      <div>
                        <p className="text-[10px] text-gray-500 mb-0.5">IN</p>
                        <p className="font-mono text-xs font-semibold text-emerald-400">{fmt(r.checkInTime)}</p>
                      </div>
                      <div className="border-x border-surface-border">
                        <p className="text-[10px] text-gray-500 mb-0.5">OUT</p>
                        <p className={`font-mono text-xs font-semibold ${r.checkOutTime ? 'text-amber-400' : 'text-red-400'}`}>{fmt(r.checkOutTime)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500 mb-0.5">HOURS</p>
                        <p className="font-mono text-xs font-semibold text-brand-500">{fmtH(r.workHours)}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Day detail modal */}
      {selectedDay && <DayDetailModal day={selectedDay} onClose={() => setSelectedDay(null)} />}
    </div>
  );
}