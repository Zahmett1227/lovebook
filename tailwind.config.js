/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        editorial: ['Playfair Display', 'Georgia', 'serif'],
        body: ['Source Sans 3', 'system-ui', 'sans-serif'],
      },
      colors: {
        lb: {
          page: 'var(--lb-page)',
          canvas: 'var(--lb-canvas)',
          surface: 'var(--lb-surface)',
          elevated: 'var(--lb-elevated)',
          muted: 'var(--lb-muted)',
          subtext: 'var(--lb-subtext)',
          text: 'var(--lb-text)',
          accent: 'var(--lb-accent)',
          accent2: 'var(--lb-accent2)',
          border: 'var(--lb-border)',
          danger: 'var(--lb-danger)',
          ring: 'var(--lb-ring)',
        },
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
        book: '0 24px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(227,176,92,0.12)',
        editorial: '0 20px 50px rgba(0,0,0,0.45), 0 0 40px rgba(199,107,138,0.08)',
        glow: '0 0 32px rgba(227, 176, 92, 0.15)',
      },
    },
  },
  plugins: [],
}
