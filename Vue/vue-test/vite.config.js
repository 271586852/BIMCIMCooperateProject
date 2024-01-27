import { fileURLToPath, URL } from 'node:url'


import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  // 配置前端服务地址和端口
  server: {
    cors: true,
    host: '0.0.0.0',
    port: 5173,
    open:true,//自动打开
    // // 是否开启 https
    // https: false,
    proxy: { //配置跨域
      '/api': {
        target: 'http://localhost:80',// 请求后台接口
        changeOrigin: true,
        ws: true,
        pathRewrite: {
          '^/api': '', // 重写请求，将 /api 前缀移除
        },
      }
    }
  },
})
