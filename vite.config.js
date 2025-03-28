import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import Stream from 'node:stream'
import browserify from 'browserify'
import { buffer } from 'node:stream/consumers'

// https://vite.dev/config/
export default defineConfig({
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext'
    }
  },
  build: {
    target: 'esnext',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: 'index.html',
      },
    }
  },
  plugins: [
    vue(),
    vueDevTools(),
    nodePolyfills(),
    ['@intlify/unplugin-vue-i18n/vite', {/* options */}]
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      stream:'Stream-browserify',
      util: 'util',
      crypto: 'crypto-browserify',
      buffer: 'buffer',
      process: 'process/browser',
    },
  }
})
