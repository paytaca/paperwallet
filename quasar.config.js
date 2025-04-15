import { defineConfig } from '#q-app/wrappers'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import path from 'path'

export default defineConfig(() => {
  return {
    boot: [
    ],
    css: ['app.scss'],
    extras: [
      'roboto-font',
      'material-icons',
    ],
    preFetch: true,
    build: {
      target: {
        browser: [ 'es2022', 'firefox115', 'chrome115', 'safari14' ],
        node: 'node20'
      },
      chainWebpack(cfg) {
        // Ensure images are properly handled
        cfg.module
          .rule('images')
          .test(/\.(png|jpe?g|gif|svg)$/)
          .use('url-loader')
          .loader('url-loader')
          .options({
            limit: 10240, // Images above this size will be copied as separate files
            name: 'assets/[name].[hash:8].[ext]', // Ensure proper file name and hash
          })
          .end();
      },
      vite: {
        build: {
          target: 'esnext',
          assets: {
            dirs: ['src/assets']
          },
        },

        // Add polyfills for Node.js modules
        resolve: {
          alias: {
            stream: 'stream-browserify',
            util: 'util/',
            crypto: 'crypto-browserify',
            buffer: 'buffer/',
            process: 'process/browser',
            events: 'events/',
            assert: 'assert/',
            'readable-stream': 'readable-stream',
            '@': path.resolve(__dirname, 'src'),
          },
        },
        define: {
          'process.env': {},
        },
        optimizeDeps: {
          include: [
            'buffer',
            'stream-browserify',
            'process',
            'util',
            'crypto-browserify',
            'assert',
            'events',
            'readable-stream',
            'elliptic',
            'bn.js',
            'cipher-base',
            'browserify-aes',
            'hash-base',
            'md5.js',
            'evp_bytestokey'
          ],
          esbuildOptions: {
            define: {
              global: 'globalThis',
              'process.env': '{}',
              'process.version': '"v20.0.0"',
            },
          },
        },

        plugins: [
          nodePolyfills({
            protocolImports: true
          }),
        ],
      },

      vueRouterMode: 'hash',
    
      vitePlugins: [
        nodePolyfills(),
        ['vite-plugin-checker', {
          eslint: {
            lintCommand: 'eslint -c ./eslint.config.js "./src*/**/*.{js,mjs,cjs,vue}"',
            useFlatConfig: true
          }
        }, { server: false }]
      ],

      polyfillModulePreload: true
    },
    devServer: {
      open: true
    },
    framework: {
      config: {},
      plugins: []
    },
    animations: [],
    ssr: {
      prodPort: 3000,
      middlewares: ['render'],
      pwa: false
    },
    pwa: {
      workboxMode: 'GenerateSW'
    },
    cordova: {},
    capacitor: {
      hideSplashscreen: true
    },
    electron: {
      preloadScripts: ['electron-preload'],
      inspectPort: 5858,
      bundler: 'builder',
      builder: {
        appId: 'paytaca-paperwallet',
        extraFiles: [
          'src/assets/**/*'
        ],
        mac: {
          target: 'dmg',
          category: 'public.app-category.utilities'
        },
        linux: {
          target: ['AppImage', 'deb'],
          category: 'Utility',
          maintainer: 'Your Name <you@example.com>',
          synopsis: 'Paytaca Paper Wallet',
          description: 'An Electron app for generating and printing BCH wallets.',
        }
      }
    },
    bex: {
      extraScripts: []
    },
  }
})
