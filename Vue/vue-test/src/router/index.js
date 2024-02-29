import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter) // 1. 调用路由对象

// 配置路由规则并对外暴露路由对象，外部才能使用
const router = new VueRouter({
    /*mode: 'history',*/
    mode: 'hash',
    routes:[]
  })
   
  export default router 