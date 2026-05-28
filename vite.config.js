import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load environment variables
  const env = loadEnv(mode, process.cwd(), '');
  const backendUrl = env.VITE_API_URL;

  return {
    base: "/",
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: backendUrl,
          changeOrigin: true,
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        },
        '/storage': {
          target: backendUrl,
          changeOrigin: true,
        },
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            // React-related core libraries
            react: ['react', 'react-dom', 'react-router-dom'],

            // UI libraries
            headlessui: ['@headlessui/react'],
            toastify: ['react-toastify'],

            // Other potential large libraries can be added here
          },
        },
      },
      chunkSizeWarningLimit: 1500, // still optional, for larger chunks
    },
    ssr: {
      noExternal: ['@headlessui/react', 'react-toastify'], // avoid "use client" warnings
    },
  };
});
