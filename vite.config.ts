import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Polyfill an toàn cho process.env để tránh lỗi thư viện cũ
    'process.env': {}
  }
});