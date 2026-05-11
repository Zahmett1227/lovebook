/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Cormorant Garamond', 'Georgia', 'Cambria', '"Times New Roman"', 'Times', 'serif'],
        editorial: ['Fraunces', 'Cormorant Garamond', 'Georgia', 'serif'],
        body: ['DM Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        cream: {
          50: '#fdfaf5',
          100: '#faf3e7',
          200: '#f5e6d0',
          300: '#ecd3b0',
        },
        rosepaper: {
          50: '#fff8f8',
          100: '#fcefed',
          200: '#f4d8d2',
          300: '#e9bdb4',
        },
      },
      boxShadow: {
        book: '0 20px 60px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.1)',
        editorial: '0 16px 40px rgba(96, 62, 66, 0.14), 0 2px 10px rgba(96, 62, 66, 0.08)',
      },
    },
  },
  plugins: [],
}


