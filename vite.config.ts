import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    // Güvenlik: GEMINI_API_KEY sadece geliştirme modunda ve
    // sadece VITE_ prefix'li değişken olarak frontend'e girer.
    // Production'da API key Vercel serverless function'da kalır.
    define: mode === 'development' ? {
      'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    } : {},
    server: {
      port: 3000,
      hmr: process.env.DISABLE_HMR !== 'true',
      // Dev'de Vite, /api/* isteklerini backend proxy'ye yönlendirir
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
        },
      },
    },
  };
});
