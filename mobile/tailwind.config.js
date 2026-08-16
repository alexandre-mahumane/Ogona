/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#FF6900',
          soft: '#FFF7ED',
          muted: '#DDD4CC',
        },
        success: '#16A34A',
        ink: {
          DEFAULT: '#262626',
          secondary: '#525252',
          muted: '#737373',
          soft: '#A1A1A1',
          inverse: '#F5F5F5',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          border: '#E5E5E5',
          muted: '#F5F5F5',
        },
        danger: '#DC2626',
      },
      fontFamily: {
        inter: ['Inter_400Regular'],
        'inter-medium': ['Inter_500Medium'],
        'inter-semibold': ['Inter_600SemiBold'],
        manrope: ['Manrope_600SemiBold'],
        'manrope-bold': ['Manrope_700Bold'],
        oxygen: ['Oxygen_700Bold'],
      },
      fontSize: {
        h1: ['48px', { lineHeight: '56px' }],
        h2: ['32px', { lineHeight: '40px' }],
        h3: ['24px', { lineHeight: '32px' }],
        h4: ['20px', { lineHeight: '28px' }],
        h5: ['18px', { lineHeight: '24px' }],
        h6: ['16px', { lineHeight: '20px' }],
        'p-l': ['18px', { lineHeight: '24px' }],
        'p-m': ['16px', { lineHeight: '20px' }],
        'p-s': ['14px', { lineHeight: '18px' }],
        'p-xs': ['12px', { lineHeight: '16px' }],
        'label-l': ['18px', { lineHeight: '24px' }],
        'label-m': ['16px', { lineHeight: '20px' }],
        'label-s': ['14px', { lineHeight: '18px' }],
        'label-xs': ['12px', { lineHeight: '16px' }],
      },
      borderRadius: {
        input: '12px',
        button: '16px',
      },
    },
  },
  plugins: [],
};
