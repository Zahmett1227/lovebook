import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// server.host: aynı Wi‑Fi’deki telefondan `http://<bilgisayar-ip>:5173` ile erişim için.
// Üretimde HTTPS kullanın; Firebase Auth için barındırma alanınızı Firebase Console → Authentication → Settings → Authorized domains listesine ekleyin.
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    strictPort: false,
  },
  preview: {
    host: true,
    port: 4173,
    strictPort: false,
  },
})
