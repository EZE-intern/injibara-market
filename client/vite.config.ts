import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const CLOUDFLARE_WORKER_API_URL = 'https://injibara-market-api.inji-mark.workers.dev/api';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const hasRenderUrl =
    (process.env.VITE_API_BASE_URL && process.env.VITE_API_BASE_URL.includes('render.com')) ||
    (env.VITE_API_BASE_URL && env.VITE_API_BASE_URL.includes('render.com'));

  return {
    define: hasRenderUrl
      ? {
          'import.meta.env.VITE_API_BASE_URL': JSON.stringify(CLOUDFLARE_WORKER_API_URL),
        }
      : {},
    plugins: [react(), tailwindcss()],
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: './src/setupTests.ts',
    },
  };
});

