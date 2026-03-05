/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // JBS 2026 Rebrand Palette
        jbs: {
          // Primary Palette
          black: '#000000',
          charcoal: '#3E3832',
          gray: '#B8B8B8',
          cream: '#F0E8E0',
          // Secondary Palette
          brown: '#885830',
          sage: '#788078',
          blue: '#00A0E0',       // Primary accent — CTAs, logo highlight
          'light-blue': '#C0D8F0',
          gold: '#C0A870',
          beige: '#D8D0C8',
          'light-cream': '#EDE5DD',
          // Functional
          dark: '#1A1A1A',       // Hero / dark sections background
          white: '#FFFFFF',
        },
      },
      fontFamily: {
        heading: ['"Barlow Condensed"', 'sans-serif'],
        body: ['Roboto', 'sans-serif'],
      },
      animation: {
        'slide-up': 'slideUp 0.5s ease-out',
        'fade-in': 'fadeIn 0.6s ease-out',
        'scale-in': 'scaleIn 0.4s ease-out',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
