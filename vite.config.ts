import { defineConfig } from 'vite'
import { dirname, relative } from 'node:path'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import tailwindcss from '@tailwindcss/vite'

import packageJson from './package.json'
import { isDev, port, r } from './scripts/utils'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  root: r('src'), // 开发服务器启动和构建时的基础目录
  resolve: {
    alias: {
      '@/': `${r('src')}/`,
    },
  },
  define: {
    __DEV__: isDev,
    __NAME__: JSON.stringify(packageJson.name),
    __VERSION__: JSON.stringify(packageJson.version),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
  plugins: [
    vue(),
    tailwindcss(),
    AutoImport({
      imports: [
        'vue',
        {
          'webextension-polyfill': [['=', 'browser']],
        },
      ],
    }),
    {
      name: 'assets-rewrite',
      enforce: 'post',
      apply: 'build',
      transformIndexHtml(html, { path }) {
        return html.replace(
          /"\/assets\//g,
          `"${relative(dirname(path), '/assets')}/`,
        )
      },
    },
  ],
  optimizeDeps: {
    include: ['vue', 'webextension-polyfill'],
  },
  base: command === 'serve' ? `http://localhost:${port}/` : '/dist/',
  server: {
    port,
    hmr: {
      host: 'localhost',
    },
    origin: `http://localhost:${port}`,
    proxy: {},
  },
  build: {
    watch: isDev ? {} : undefined,
    outDir: r('extension/dist'),
    emptyOutDir: false,
    sourcemap: isDev ? 'inline' : false,
    rollupOptions: {
      input: {
        popup: r('src/popup/index.html'),
        newtab: r('src/newtab/index.html'),
      },
    },
  },
}))
