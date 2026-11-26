// vite.config.js (루트 경로에 추가해 두시면 안전합니다)
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});
