/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#3b82f6',
          dark: '#2563eb',
          light: '#eff6ff',
        },
        success: {
          DEFAULT: '#22c55e',
          light: '#f0fdf4',
        },
        warning: {
          DEFAULT: '#f59e0b',
          light: '#fffbeb',
        },
        danger: {
          DEFAULT: '#ef4444',
          light: '#fef2f2',
        },
        gray: {
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
      },
      borderRadius: {
        DEFAULT: '6px',
        sm: '4px',
        lg: '10px',
        full: '9999px',
      },
      boxShadow: {
        sm: '0 1px 2px rgba(0,0,0,0.08)',
        DEFAULT: '0 1px 3px rgba(0,0,0,0.12)',
        md: '0 4px 6px rgba(0,0,0,0.1)',
        lg: '0 8px 24px rgba(0,0,0,0.18)',
      },
    },
  },
  plugins: [],
};
