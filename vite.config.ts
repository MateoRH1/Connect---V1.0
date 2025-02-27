import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      '/ml-api': {
        target: 'https://api.mercadolibre.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ml-api/, ''),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', {
              message: err.message,
              stack: err.stack,
              cause: err.cause
            });
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            // Copy authorization header
            if (req.headers.authorization) {
              proxyReq.setHeader('Authorization', req.headers.authorization);
            }

            // Add required headers for MercadoLibre API
            proxyReq.setHeader('Accept', 'application/json');
            proxyReq.setHeader('Content-Type', 'application/json');

            // Log request for debugging
            console.log('proxy request', {
              method: req.method,
              url: req.url,
              headers: proxyReq.getHeaders()
            });
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            // Log response for debugging
            console.log('proxy response', {
              method: req.method,
              url: req.url,
              status: proxyRes.statusCode,
              headers: proxyRes.headers
            });
          });
        },
      },
    },
  },
});
