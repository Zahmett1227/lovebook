/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Georgia', 'Cambria', '"Times New Roman"', 'Times', 'serif'],
      },
      colors: {
        cream: {
          50: '#fdfaf5',
          100: '#faf3e7',
          200: '#f5e6d0',
          300: '#ecd3b0',
        },
      },
      boxShadow: {
        book: '0 20px 60px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.1)',
      },
    },
  },
  plugins: [],
}


