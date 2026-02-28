import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  return {
    /**
     * ENVIRONMENT AWARE BASE PATH
     * * The return value changes dynamically based on the build mode:
     * - Lively Wallpaper requires relative paths ('./') because it runs locally via the file:// protocol.
     * - The Browser Extension uses the default absolute path ('/').
     */
    base: mode === 'lively' ? './' : '/',
    plugins: [react(), tailwindcss()],
  };
});
