/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'], // Ensures Tailwind scans the correct files
  theme: {
    extend: {
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'], // Custom font family
      },
      colors: {
        brand: {
          blue: '#95C11E', // Nested 'brand' object for clarity
        },
      },
      animation: {
        'scroll-x': 'scroll-x 40s linear infinite', // Custom animation utility
      },
      keyframes: {
        'scroll-x': {
          from: { transform: 'translateX(0)' }, // Keyframe definition
          to: { transform: 'translateX(-100%)' },
        },
      },
    },
  },
  plugins: [], // Empty plugins array; add plugins here if needed
};
