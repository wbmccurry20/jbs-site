/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      // 🎨 BRAND COLORS - Easy to update when you get client's brand guide
      // Just replace the hex values below with your client's colors
      colors: {
        // Professional construction palette with modern twist
        construction: {
          primary: '#FF6B35',     // Bold safety orange - CTA buttons, key highlights
          secondary: '#004E89',   // Deep professional blue - headers, trust elements  
          accent: '#FFB81C',      // Bright construction yellow - badges, emphasis
          dark: '#1A1A2E',        // Almost black - main text, dark backgrounds
          light: '#F5F5F5',       // Off-white - page backgrounds
          steel: '#4B5563',       // Darker steel gray (gray-600) - better readability
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
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
