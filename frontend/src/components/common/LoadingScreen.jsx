export default function LoadingScreen() {
  return (
    <div className="min-h-dvh bg-surface flex items-center justify-center relative overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(245,197,24,0.04) 0%, transparent 70%)' }} />
      </div>

      <div className="flex flex-col items-center gap-6 animate-fade-in">
        {/* Logo with rings */}
        <div className="relative">
          {/* Outer pulsing ring */}
          <div className="absolute inset-0 rounded-2xl border border-brand-500/20 scale-[1.15] animate-ping" style={{ animationDuration: '2s' }} />
          {/* Middle ring */}
          <div className="absolute inset-0 rounded-2xl border border-brand-500/10 scale-[1.08]" />
          {/* Logo */}
          <div className="w-16 h-16 rounded-2xl overflow-hidden relative"
            style={{ boxShadow: '0 0 0 1px rgba(245,197,24,0.15), 0 8px 32px rgba(0,0,0,0.6)' }}>
            <img src="/icon-192.png" alt="Logo" className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Loading dots */}
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-1 h-1 rounded-full bg-brand-500/60"
              style={{ animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
