import { useEffect, useState } from 'react';

const NOTICE_KEY = 'attendance_update_notice_v2_apr2026';

export default function UpdateNoticeModal() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem(NOTICE_KEY);
    if (!seen) setVisible(true);
  }, []);

  const handleClose = () => {
    localStorage.setItem(NOTICE_KEY, 'seen');
    setVisible(false);
  };

  if (!visible) return null;

  const updates = [
    {
      icon: '🏖️',
      color: 'emerald',
      title: 'Leave requests',
      desc: (
        <>Leave requests can now be submitted from the{' '}<span className="text-white font-semibold">Leave</span> tab.</>
      ),
    },
    {
      icon: '⏱️',
      color: 'red',
      title: 'Checkout required',
      desc: 'Checkout is required to record attendance. Days without a checkout will not be counted as present. Automatic checkout has been removed.',
    },
    {
      icon: '🕒',
      color: 'amber',
      title: 'Late arrival time updated',
      desc: (
        <>The late arrival threshold is now{' '}<span className="text-white font-semibold">11:00 AM</span>{' '}(Monday through Friday). Previously it was 10:45 AM.</>
      ),
    },
  ];

  const colorMap = {
    emerald: { bg: 'bg-emerald-500/[0.07]', border: 'border-emerald-500/20', text: 'text-emerald-400' },
    red:     { bg: 'bg-red-500/[0.07]',     border: 'border-red-500/20',     text: 'text-red-400'     },
    amber:   { bg: 'bg-amber-500/[0.07]',   border: 'border-amber-500/20',   text: 'text-amber-400'   },
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-[100] flex items-end sm:items-center justify-center p-4 sm:p-6">
      <div
        className="bg-[#0f0f0f] border border-white/[0.08] rounded-t-3xl sm:rounded-2xl w-full max-w-[95vw] sm:max-w-md md:max-w-lg animate-slide-up shadow-elevated"
        style={{
          paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 1.5rem)',
          maxHeight: 'min(90dvh, 700px)',
          overflowY: 'auto',
          backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.025) 0%, transparent 60%)',
        }}
      >
        <div className="p-5 sm:p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-5 sm:mb-6">
            <div className="w-10 h-10 rounded-xl bg-brand-500/15 border border-brand-500/20 flex items-center justify-center shrink-0">
              <span className="text-lg">📋</span>
            </div>
            <div>
              <p className="text-white font-display font-bold text-base leading-tight">What's New</p>
              <p className="text-gray-500 text-xs mt-0.5 font-mono">April 2026</p>
            </div>
          </div>

          {/* Update items */}
          <div className="space-y-2.5 sm:space-y-3 mb-5 sm:mb-6">
            {updates.map(({ icon, color, title, desc }) => {
              const c = colorMap[color];
              return (
                <div key={title} className={`${c.bg} border ${c.border} rounded-xl p-3.5 sm:p-4`}>
                  <div className="flex items-start gap-3">
                    <span className="text-base sm:text-lg shrink-0 mt-0.5">{icon}</span>
                    <div>
                      <p className={`${c.text} font-semibold text-xs sm:text-sm font-display`}>{title}</p>
                      <p className="text-gray-400 text-[11px] sm:text-xs mt-1 leading-relaxed">{desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CTA */}
          <button
            onClick={handleClose}
            className="btn-primary w-full py-3 text-sm"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}