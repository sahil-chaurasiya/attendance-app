import { useEffect, useState } from 'react';

const NOTICE_KEY = 'attendance_update_notice_v2_apr2026';

export default function UpdateNoticeModal() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem(NOTICE_KEY);
    if (!seen) {
      setVisible(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem(NOTICE_KEY, 'seen');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-4 sm:p-6">
      <div
        className="bg-surface-card border border-surface-border rounded-t-2xl sm:rounded-2xl w-full max-w-[95vw] sm:max-w-md md:max-w-lg p-4 sm:p-6 animate-slide-up"
        style={{
          paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 1.5rem)',
          maxHeight: 'min(90dvh, 700px)',
          overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-brand-500/20 flex items-center justify-center shrink-0">
            <span className="text-lg sm:text-xl">📋</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white font-display font-bold text-sm sm:text-base leading-tight">
              App Update
            </p>
            <p className="text-gray-400 text-[10px] sm:text-xs mt-0.5">
              April 2026
            </p>
          </div>
        </div>

        {/* Update items */}
        <div className="space-y-2.5 sm:space-y-3 mb-4 sm:mb-5">
          {/* Leave Requests */}
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg sm:rounded-xl p-3 sm:p-4">
            <div className="flex items-start gap-2 sm:gap-3">
              <span className="text-base sm:text-lg shrink-0">🏖️</span>
              <div>
                <p className="text-emerald-400 font-semibold text-xs sm:text-sm">
                  Leave requests
                </p>
                <p className="text-gray-300 text-[10px] sm:text-xs mt-1 leading-relaxed">
                  Leave requests can now be submitted from the{' '}
                  <span className="text-white font-semibold">Leave</span> tab.
                </p>
              </div>
            </div>
          </div>

          {/* Checkout */}
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg sm:rounded-xl p-3 sm:p-4">
            <div className="flex items-start gap-2 sm:gap-3">
              <span className="text-base sm:text-lg shrink-0">⏱️</span>
              <div>
                <p className="text-red-400 font-semibold text-xs sm:text-sm">
                  Checkout required
                </p>
                <p className="text-gray-300 text-[10px] sm:text-xs mt-1 leading-relaxed">
                  Checkout is required to record attendance. Days without a checkout
                  will not be counted as present. Automatic checkout has been removed.
                </p>
              </div>
            </div>
          </div>

          {/* Late threshold */}
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg sm:rounded-xl p-3 sm:p-4">
            <div className="flex items-start gap-2 sm:gap-3">
              <span className="text-base sm:text-lg shrink-0">🕒</span>
              <div>
                <p className="text-amber-400 font-semibold text-xs sm:text-sm">
                  Late arrival time updated
                </p>
                <p className="text-gray-300 text-[10px] sm:text-xs mt-1 leading-relaxed">
                  The late arrival threshold is now{' '}
                  <span className="text-white font-semibold">10:45 AM</span>{' '}
                  (Monday through Friday). Previously it was 11:00 AM.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={handleClose}
          className="w-full py-2.5 sm:py-3 rounded-xl bg-brand-500 hover:bg-brand-600 active:scale-95 text-white font-semibold text-xs sm:text-sm transition-all touch-manipulation"
        >
          Got it
        </button>
      </div>
    </div>
  );
}