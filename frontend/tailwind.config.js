/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    fontFamily: {
      sans: ['Fira Sans', 'sans-serif'],
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: '#E97F5E',
          50: '#FEF2EE',
          100: '#FCE5DE',
          200: '#F9CBBD',
          300: '#F5B19C',
          400: '#F1977B',
          500: '#E97F5E',
          600: '#D46647',
          700: '#B04E34',
          800: '#8C3722',
          900: '#682011',
        },
        secondary: {
          DEFAULT: '#59716F',
          50: '#F3F5F5',
          100: '#E7ECEB',
          200: '#CED8D7',
          300: '#B5C4C2',
          400: '#9CB0AE',
          500: '#7D9795',
          600: '#59716F',
          700: '#465A58',
          800: '#324241',
          900: '#1F2A2A',
        },
        neutral: {
          50: '#F7F7F6',
          100: '#EFEEEC',
          200: '#E0DEDB',
          300: '#D1CECA',
          400: '#B3B0AA',
          500: '#95918A',
          600: '#78746B',
          700: '#5D5A52',
          800: '#423F39',
          900: '#27251F',
        },
        gray: {
          50: '#F9F9F7',
          100: '#F2F2EF',
          200: '#E5E5DF',
          300: '#D7D7CF',
          400: '#BCBCB0',
          500: '#A0A090',
          600: '#808071',
          700: '#666659',
          800: '#49493F',
          900: '#2D2D25',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in-up': 'fadeInUp 0.8s ease-out forwards',
        'fade-in-down': 'fadeInDown 0.8s ease-out forwards',
        'fade-in-left': 'fadeInLeft 0.8s ease-out forwards',
        'fade-in-right': 'fadeInRight 0.8s ease-out forwards',
        'zoom-in': 'zoomIn 0.8s ease-out forwards',
        'bounce-in': 'bounceIn 0.8s ease-out forwards',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        fadeInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' }
        },
        fadeInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' }
        },
        zoomIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' }
        },
        bounceIn: {
          '0%': { opacity: '0', transform: 'scale(0.3)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)' }
        }
      }
    },
  },
  plugins: [],
} 