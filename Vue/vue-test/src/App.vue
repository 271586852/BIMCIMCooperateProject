<template>
  <div class="container">
    <TopNavigation class="top-nevigator" />
    <Mega id="maga" />
    <!-- 用户中心 -->
    <User @updateFormData="updateFormData" />
  </div>
</template>

<script setup>
import TopNavigation from "./components/TopNavigation.vue";
import { onMounted, ref, provide, reactive, computed } from "vue";
import Mega from "./components/Mega.vue";
import User from "./components/User.vue";

import { useStore, mapMutations } from "vuex";

//--用户中心
const dataFromUserCom = ref(null) // 用于接收从 UserCom 传递的数据

const updateFormData = (formData) => {
  // 在 User组件触发自定义事件时，接收传递的数据
  dataFromUserCom.value = formData;
  // 在这里接收子组件传递的数据
  console.log('Received Form Data in Parent:', formData)

}

// 加载Mega
const store = useStore();
const LoadMega = computed(() => store.state.LoadMega);





</script>

<style>
.container {
  display: block;
  overflow-x: hidden;
  /* align-items: center; */
  /* margin-top: 10%; */
  /*height: 100vh; 设置容器高度为视口的高度 */
  /* background-color: aliceblue; */

}

.top-nevigator {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  margin: 0%;
  z-index: 999;
}

#mega {
  z-index: 10;
}
</style>