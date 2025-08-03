// vite.config.ts
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import topLevelAwait from "vite-plugin-top-level-await";
import wasm from "vite-plugin-wasm";
import { VitePWA } from "vite-plugin-pwa";
import fs from "fs";
import path from "path";
import { readFileSync } from 'fs';

// Read version from package.json for cache busting
const packageJson = JSON.parse(readFileSync('./package.json', 'utf-8'));
const appVersion = packageJson.version || '0.0.0';
const buildTimestamp = Date.now();

export default defineConfig(({ command }) => {
  const isDev = command === 'serve';
  const isLocalHttps = process.env.VITE_LOCAL_HTTPS === 'true';

  const getHttpsConfig = () => {
    if (!isDev || !isLocalHttps) return {};
    
    const keyPath = path.resolve('./dev-key.pem');
    const certPath = path.resolve('./dev.pem');

    try {
      if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
        return {
          https: {
            key: fs.readFileSync(keyPath),
            cert: fs.readFileSync(certPath),
          }
        };
      }
    } catch (error) {
      console.warn('⚠️  Error reading HTTPS certificates. Using HTTP.');
    }

    return {};
  };

  return {
    plugins: [
      react(),
      wasm(),
      topLevelAwait(),
      VitePWA({
        registerType: "autoUpdate",
        devOptions: {
          enabled: isDev
        },
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
        workbox: {
          skipWaiting: true,
          clientsClaim: true,
          cleanupOutdatedCaches: true,
          // Add version to force cache update
          cacheId: `bytebeasts-v${appVersion}-${buildTimestamp}`,
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 MiB
          globPatterns: ["**/*.{js,css,ico,png,svg,woff,woff2,ttf,eot,jpeg,jpg}"],
          // Exclude HTML from precaching to always get fresh version
          navigateFallback: null,
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: "CacheFirst",
              options: {
                cacheName: "google-fonts-cache",
                expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: "CacheFirst",
              options: {
                cacheName: "gstatic-fonts-cache",
                expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
            {
              urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
              handler: "StaleWhileRevalidate",
              options: {
                cacheName: "images",
                expiration: { maxEntries: 60, maxAgeSeconds: 30 * 24 * 60 * 60 },
              },
            },
            {
              urlPattern: /\.(?:js|css)$/,
              handler: "NetworkFirst",
              options: {
                cacheName: "static-resources",
                networkTimeoutSeconds: 3,
                expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 }, // 1 hour only
              },
            },
            {
              urlPattern: /^\/(index\.html)?$/,
              handler: "NetworkFirst",
              options: {
                cacheName: "html-cache",
                networkTimeoutSeconds: 3,
              },
            },
            {
              urlPattern: /\.(?:mp3|wav|ogg)$/,
              handler: "CacheFirst",
              options: {
                cacheName: "audio-cache",
                expiration: { maxEntries: 20, maxAgeSeconds: 7 * 24 * 60 * 60 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
            {
              urlPattern: /^https:\/\/api\./,
              handler: "NetworkFirst",
              options: {
                cacheName: "api-cache",
                networkTimeoutSeconds: 10,
                expiration: { maxEntries: 50, maxAgeSeconds: 5 * 60 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
            {
              urlPattern: /.*/,
              handler: "StaleWhileRevalidate",
              options: {
                cacheName: "fallback-cache",
                expiration: { maxEntries: 50, maxAgeSeconds: 24 * 60 * 60 },
              },
            },
          ],
        },
        manifest: {
          name: "Byte Beasts Tamagotchi",
          short_name: "Byte Beasts",
          description: "Take care of your Beasts",
          theme_color: "#000",
          background_color: "#000",
          display: "standalone",
          orientation: "portrait",
          icons: [
            {
              src: "", // Reemplaza con la ruta real
              sizes: "192x192",
              type: "image/png",
              purpose: "any maskable"
            },
            {
              src: "", // Reemplaza con la ruta real
              sizes: "192x192",
              type: "image/png",
              purpose: "any"
            }
          ],
          screenshots: [
            { src: "", sizes: "822x1664", type: "image/png" },
            { src: "", sizes: "822x1664", type: "image/png" },
            { src: "", sizes: "822x1664", type: "image/png" },
            { src: "", sizes: "822x1664", type: "image/png" }
          ],
        }
      })
    ],
    server: {
      port: 3002,
      ...getHttpsConfig(),
      ...(isDev && {
        host: true,
        cors: true,
      }),
      // Allow Cloudflare tunnel hosts
      allowedHosts: [
        'localhost',
        '127.0.0.1',
        '.trycloudflare.com',
        '.vercel.app'
      ],
    },
    define: {
      global: 'globalThis',
      'import.meta.env.VITE_APP_VERSION': JSON.stringify(appVersion),
      'import.meta.env.VITE_BUILD_TIME': JSON.stringify(buildTimestamp),
    },
    optimizeDeps: {
      include: ['buffer'],
    },
  };
});