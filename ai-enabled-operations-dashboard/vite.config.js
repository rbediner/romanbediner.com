import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // The dashboard is served from /ai-enabled-operations-dashboard/ inside the main site.
  base: '/ai-enabled-operations-dashboard/',
  server: {
    allowedHosts: true,
  },
});
