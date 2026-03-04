import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",

        // Brand primary — Bleu Confiance (original)
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          DEFAULT: '#1A56DB',
          700: '#1A56DB',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },

        // Success — Emerald
        success: {
          50: '#ecfdf5',
          100: '#d1fae5',
          500: '#10b981',
          DEFAULT: '#059669',
          700: '#047857',
        },

        // Warning — Orange Action/Conversion
        warning: {
          50: '#fff7ed',
          100: '#ffedd5',
          500: '#f97316',
          DEFAULT: '#EA580C',
          700: '#c2410c',
        },

        // Alert — Rouge Alerte (original)
        alert: {
          50: '#fef2f2',
          100: '#fee2e2',
          500: '#ef4444',
          DEFAULT: '#DC2626',
          700: '#b91c1c',
        },

        // Sidebar — Deep Slate/Navy
        sidebar: {
          DEFAULT: '#0F172A',
          900: '#0F172A',
          800: '#1E293B',
          700: '#334155',
          600: '#475569',
          border: 'rgba(255,255,255,0.06)',
          text: '#CBD5E1',
          muted: '#64748B',
          active: 'rgba(59,130,246,0.15)',
          hover: 'rgba(255,255,255,0.05)',
        },

        // Indigo accent
        indigo: {
          50: '#eef2ff',
          100: '#e0e7ff',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          DEFAULT: '#4338ca',
          700: '#4338ca',
        },
      },

      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        display: ['var(--font-plus-jakarta)', 'Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },

      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },

      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.06)',
        'card-md': '0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.05)',
        'card-lg': '0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -4px rgba(0,0,0,0.04)',
        'glow': '0 0 20px rgba(59,130,246,0.35)',
        'glow-sm': '0 0 8px rgba(59,130,246,0.25)',
        'inner-lg': 'inset 0 2px 8px rgba(0,0,0,0.12)',
        'sidebar': '4px 0 24px rgba(0,0,0,0.25)',
      },

      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #1d4ed8 0%, #4338ca 100%)',
        'gradient-sidebar': 'linear-gradient(180deg, #0F172A 0%, #101827 100%)',
        'gradient-card-blue': 'linear-gradient(135deg, #EFF6FF 0%, #F0F9FF 100%)',
        'gradient-card-emerald': 'linear-gradient(135deg, #ECFDF5 0%, #F0FDF4 100%)',
        'gradient-card-amber': 'linear-gradient(135deg, #FFFBEB 0%, #FFF7ED 100%)',
        'gradient-card-red': 'linear-gradient(135deg, #FEF2F2 0%, #FFF1F2 100%)',
        'gradient-dark': 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
        'shimmer': 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%)',
      },

      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },

      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-in-left': {
          '0%': { opacity: '0', transform: 'translateX(-12px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 8px rgba(59,130,246,0.3)' },
          '50%': { boxShadow: '0 0 20px rgba(59,130,246,0.6)' },
        },
        shimmer: {
          from: { backgroundPosition: '-200% 0' },
          to: { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.4s ease forwards',
        'fade-in': 'fade-in 0.3s ease forwards',
        'slide-in-left': 'slide-in-left 0.35s ease forwards',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
        'float': 'float 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
export default config;