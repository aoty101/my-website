import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import { resolve } from 'path'

const pathResolve = (dir) => {
  return resolve(process.cwd(), dir)
}

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: [
      {
        find: '@',
        replacement: pathResolve('src'),
      },
    ],
  },
  plugins: [vue(), UnoCSS()],
  assetsInclude: ['**/*.glsl'],
})
