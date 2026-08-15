import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
	  enviroment: 'jsdom',
	  globals: true,
	  setupFiles: './src/setupTests.ts',
  }
});
