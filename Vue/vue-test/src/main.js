// import './assets/main.css'
import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import './assets/me.min.js'
import createStore  from './store/index.js'
import './assets/iconfont.css'    // 引入阿里云字体图标css
// import router from './router'
import { createPinia } from 'pinia'
// import axios from 'axios'

const pinia = createPinia()
const app = createApp(App)

// app.config.globalProperties.$axios = axios
// app.use(router)
app.use(pinia)
app.use(ElementPlus)
app.use(createStore)
app.mount('#app')
