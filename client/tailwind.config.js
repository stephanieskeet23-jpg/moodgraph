/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Japandi + British Heritage palette
        ivory: {
          50: '#FDFCFA',
          100: '#FAF8F5',
          200: '#F5F2ED',
          300: '#EBE6DE',
          400: '#DDD6C9',
        },
        racing: {
          50: '#E8EDEA',
          100: '#D1DBD5',
          200: '#A3B7AB',
          300: '#759381',
          400: '#4A6F57',
          500: '#1E4D2B', // British Racing Green
          600: '#183E23',
          700: '#122F1A',
          800: '#0C1F12',
          900: '#061009',
        },
        charcoal: {
          50: '#F5F5F4',
          100: '#E7E5E4',
          200: '#D6D3D1',
          300: '#A8A29E',
          400: '#78716C',
          500: '#57534E',
          600: '#44403C',
          700: '#292524',
          800: '#1C1917',
          900: '#0C0A09',
        },
        cognac: {
          50: '#FDF8F3',
          100: '#FAEDE0',
          200: '#F5D9BE',
          300: '#E9B88A',
          400: '#D99559',
          500: '#C67B3C',
          600: '#A66230',
          700: '#854D26',
          800: '#6B3E1F',
          900: '#4A2B15',
        },
        terracotta: {
          50: '#FDF6F3',
          100: '#FBEBE4',
          200: '#F5D4C5',
          300: '#E8B09A',
          400: '#D48B6F',
          500: '#BF6D4D',
          600: '#9E5438',
          700: '#7D422C',
          800: '#5C3121',
          900: '#3B2015',
        },
        sage: {
          50: '#F6F7F4',
          100: '#E9ECE4',
          200: '#D4DAC9',
          300: '#B5C0A5',
          400: '#95A37F',
          500: '#798760',
          600: '#5F6B4B',
          700: '#4A543B',
          800: '#3B432F',
          900: '#2D3325',
        },
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        body: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(28, 25, 23, 0.04)',
        'card': '0 1px 3px rgba(28, 25, 23, 0.06), 0 4px 12px rgba(28, 25, 23, 0.04)',
        'elevated': '0 4px 20px rgba(28, 25, 23, 0.08), 0 1px 4px rgba(28, 25, 23, 0.04)',
        'modal': '0 8px 40px rgba(28, 25, 23, 0.12), 0 2px 8px rgba(28, 25, 23, 0.06)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
