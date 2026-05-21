/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#fffde7',
          100: '#fff9c4',
          200: '#fff59d',
          300: '#fff176',
          400: '#ffee58',
          500: '#F5C518',
          600: '#e6b800',
          700: '#c9a000',
          800: '#a88400',
          900: '#7a6000',
        },
        surface: {
          DEFAULT: '#080808',
          card:    '#0f0f0f',
          border:  'rgba(255,255,255,0.06)',
          hover:   '#141414',
        },
      },
      fontFamily: {
        sans:    ['DM Sans', 'sans-serif'],
        display: ['Syne', 'sans-serif'],
        mono:    ['DM Mono', 'ui-monospace', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-up':   'slideUpFade 0.4s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in':    'fadeIn 0.3s ease-out both',
        'scale-in':   'scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) both',
        'spin-slow':  'spin 3s linear infinite',
        'float':      'float 4s ease-in-out infinite',
        'shimmer':    'shimmer 2.5s linear infinite',
      },
      keyframes: {
        slideUpFade: { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        fadeIn:      { from: { opacity: 0 }, to: { opacity: 1 } },
        scaleIn:     { from: { opacity: 0, transform: 'scale(0.96)' }, to: { opacity: 1, transform: 'scale(1)' } },
        float:       { '0%, 100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-6px)' } },
        shimmer:     { from: { backgroundPosition: '-200% center' }, to: { backgroundPosition: '200% center' } },
      },
      boxShadow: {
        'glow':     '0 0 0 1px rgba(245,197,24,0.3), 0 4px 16px rgba(245,197,24,0.2)',
        'glow-lg':  '0 0 0 1px rgba(245,197,24,0.5), 0 4px 32px rgba(245,197,24,0.3)',
        'card':     '0 1px 1px rgba(0,0,0,0.5), 0 8px 32px rgba(0,0,0,0.4)',
        'elevated': '0 2px 2px rgba(0,0,0,0.4), 0 16px 48px rgba(0,0,0,0.5)',
        'inner-glow': 'inset 0 1px 0 rgba(255,255,255,0.04)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-gold': 'linear-gradient(135deg, #F5C518 0%, #e6b800 50%, #F5C518 100%)',
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
};
