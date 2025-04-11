<!--
 * @FileDescription: MegaEarth API入口，包括其初始化与事件监听
 * @LastEditTime: 1.20
 -->

<template>
  <div id="container">
    <div id="player"></div>

    <!-- 图层控件 -->
    <LayerManager :api="api" />

    <!-- 右侧小图标 -->
    <PageControls ref="ref_inside" :api="api" />

    <!-- bim模型操作按钮 -->
    <BimControl :api="api" />

    <el-button type="info" :icon="icon" circle @click="toggleFps" :style="{ color: buttonColor }"
      style="z-index: 9999; bottom: 20px; right: 20px; position: fixed; background-color: transparent; border: none; font-size: 24px; width: 50px; height: 50px;"></el-button>
  </div>
</template>

<script setup>
// 引入子组件
import PageControls from "./PageControls.vue";
import LayerManager from "./LayerManager.vue";
import BimControl from "./BimControl.vue";

import { onMounted, ref, watch, computed, shallowRef } from "vue";
import { useStore } from "vuex";
import { ElMessage, ElNotification } from "element-plus";
import { useBimStore } from '../store/bim';
import { storeToRefs } from 'pinia';
import {
  TurnOff,
  Open,
} from '@element-plus/icons-vue'
import "/src/assets/me.min.js";




// 从vuex数据仓库里面取数据
const store = useStore();

// 从bimstore数据仓库里面取数据
const Bimstore = useBimStore()
const { GouLidbid, NotGLmeta } = storeToRefs(Bimstore)

const ref_inside = ref(null); // 子组件

const vuexUrl = computed(() => store.state.vuexUrl); // api初始化url
const vuexWsPort = computed(() => store.state.vuexWsPort); //api初始化wsport


const layers = computed(() => store.state.EntityObjects);


console.log("Mega实体树EntityObjects", layers);
console.log("Mega.vue--url", vuexUrl.value);
console.log("Mega.vue--wsPort", vuexWsPort.value);

// 测试数据
const layers222 = [
  {
    id: "3F5B8DEC29FBF93197ECC1291124F13F",
    name: "terrain",
    url: "http:/localhost:3000/DEM/layer.json",
    type: "Tileset",
    overlays: [
      {
        type: "tms",
        name: "DOM",
        url: "http:/localhost:3000/DOM",
        index: 1,
        headers: {},
        style: "",
        opacity: 1,
        id: "8FB23535CF16F496D0B5A6D99797A1FE",
        layer: "",
        format: "image/png",
        tilingScheme: "Geographic",
        tilesetId: "3F5B8DEC29FBF93197ECC1291124F13F"
      },
      {
        type: "tms",
        name: "DEM",
        url: "http:/localhost:3000/DOM",
        index: 1,
        headers: {},
        style: "",
        opacity: 1,
        id: "8FB23535CF16F496D0B5A6D99797A1FE",
        layer: "",
        format: "image/png",
        tilingScheme: "Geographic",
        tilesetId: "3F5B8DEC29FBF93197ECC1291124F13F"
      }
    ]
  },

  {
    id: "44A350FF6303ABF4B3A1A04B9B990614",
    name: "深大地形",
    url: "/Game/map/Terrain",
    type: "Level",
    overlays: []
  },

  {
    id: "243F9DC4B82C3D074CC5F4B571D828C4",
    name: "深大道路",
    url: "/Game/map/Road",
    type: "Level",
    overlays: []
  }
];


// 初始化api
const api = new me.MegaEarthApi({
  url: 'localhost:4003', //  客户端所在主机ip，若是本机连接可填 localhost
  wsPort: '2336', //  选填，客户端开启的通信端口，默认为 2333
  container: "player" //  挂载视频的div ID
});


// 获取系统状态，直接返回状态，而不是Promise，
// 状态为true时，api才可调用，也可通过下面的api.on事件监听
const resReady = api.ready(); //true / false
console.log("Mega-ready:", resReady);

// 1.事件监听器
api.on("open", () => {
  console.log("系统完成加载，此时api可调用");
});
api.on("error", e => {
  console.log("系统错误", e);
});
api.on("close", e => {
  console.log("系统关闭", e);
});

// 2.三维系统内置的交互事件监听器
// 开启事件
api.control.enableLeftMouseClick(true);  //开启鼠标左键点击查询
api.control.enableCameraChanged(true);   //
api.control.enableStudioKeyFrameChanged(true);
if (api.control.enableLeftMouseClick(true)) {
  console.log("点击事件开启成功");
}
if (api.control.enableCameraChanged(true)) {
  console.log("相机移动事件开启成功");
}
if (api.control.enableStudioKeyFrameChanged(true))
  console.log("录播室关键帧事件开启成功");


api.onEvent(e => {
  // console.log("onEvent事件", e.type, e.data); // 事件类型、事件反馈结果

  if (e.type === "LeftMouseClick") {
    // 点击事件反馈，需要在api.control处开启点击事件
    store.commit("updateLocation", e.data.location);

    console.log("点击查询构件信息");
    console.log(e.data.entity) // entity相关
    console.log(e.data.entity.id) // 目前仅支持Tileset数据id的查询
    console.log(e.data.entity.meta) // 所点击的Bim构件信息，是个字符串，需要调用JSON.parse()解析，要完成该查询对数据组织形式有要求
    // 解析 e.data.entity.meta 字符串，获取 dbId 的值
    let meta = JSON.parse(e.data.entity.meta);
    console.log(meta) //
    Bimstore.GouLidbid = meta.dbId;
    Bimstore.NotGLmeta = meta;
    console.log("Bimstore.GouLidbid", Bimstore.GouLidbid);
    console.log("Bimstore.NotGLmeta", Bimstore.NotGLmeta);
    console.log(e.data.entity.userData) // 所点击的Tileset数据所携带的userData
  }

  if (e.type === "CameraChanged") {
    // 相机移动事件反馈，需要在api.control处开启相机移动事件
    //console.log("当前相机参数:", e.data.camera); // 当前相机参数，详见api.camera.get()
    store.commit("updateViewRectangle", e.data.viewRectangle);
  }

  if (e.type === "StudioKeyFrameChanged") {
    // 录播室关键帧监听事件反馈，需要在api.control处开启该事件
    // 每个轨道的每个点都视为一个关键帧，所以由webgl转化而来的studio，每播放一个点位就会有五个回调信息，
    // e.data.keyFrame.trackName 分别对应 cameraLongitude cameraLatitude cameraHeight CameraPitch cameraYaw
    // 为了保证播放一个关键帧只有一个回调执行可以加个判断条件
    if (e.data.keyFrame.trackName === "cameraLongitude") {
      console.log("帧:", e.data.keyFrame);
    }
  }

  if (e.type === "Measurement") {
    if (e.data.type === 0 && e.data.area != 0) {
      ElNotification({
        title: "面积测量结果",
        message: `${e.data.area}平方米`,
        position: "bottom-left",
        duration: 5000
      });
    }
    if (e.data.type === 1 && e.data.distance != 0) {
      ElNotification({
        title: "三角测量结果",
        message: `两点距离:${e.data.distance}米;<br />水平距离:${e.data.horizontal}米;<br />垂直距离:${e.data.vertical}米`,
        position: "bottom-left",
        duration: 5000,
        dangerouslyUseHTMLString: true
      });
    }
    // 量测事件反馈，需要在api.measureHandler处开启量测
    console.log(" 0-面积测量 1-三角测量:", e.data.type); // 0-面积测量 1-三角测量
    console.log("面积测量：（平方米）", e.data.area); // 面积测量时有值，单位：平方米

    console.log("三角测量-两点距离:", e.data.distance); // 三角测量时有值，两点距离，单位：米
    console.log("三角测量-水平距离:", e.data.horizontal); // 三角测量时有值，两点间水平距离，单位：米
    console.log("三角测量-垂直距离:", e.data.vertical); // 三角测量时有值，两点间垂直距离，单位：米
  }


  if (e.type === 'DrawResult') { // 绘制事件反馈，需要在api.drawHandler处开启绘制
    console.log('绘制点串，包含经度纬度高度', e.data.lngLatAlts) // 绘制点串，包含经度纬度高度
    ref_inside.value.successMsg(`已成功绘制${e.data.lngLatAlts.length}个点`);
    store.commit("updateSelectTileInfo", e.data.lngLatAlts);
  }
});

//初始相机位置
const cameraoptions = {
  position: [116.43159920000855, 39.90999999999742, 100],
  rotation: [80, -10, 0],
  flytime: 3,//设置飞行时间
};
//设置初始相机位置
api.camera
  .set(cameraoptions)
  .then(res => {

  })
  .catch(error => {
    console.log("error", error, error.code);
  });

//设置天气
const weather1 = "PartlyCloudy";
console.log("天气", weather1);
api.weather.set(weather1);

//设置时间
let time = 11.5;
api.weather.setTime(time);

// 使用 shallowRef 而不是 ref
const icon = shallowRef(TurnOff); // 假设这是打开时的图标
console.log("icon", icon.value);
const buttonColor = ref('white');

// const toggleFps = () => {
//   icon.value = icon.value === Open ? TurnOff : Open;
//   console.log('icon', icon.value);
// };


const toggleFps = async () => {
  try {
    const res = await api.toggleFps();
    console.log('帧率信息:', res); // 处理结果
    icon.value = icon.value === TurnOff ? Open : TurnOff;
    buttonColor.value = icon.value === TurnOff ? 'white' : '#79bbff';
    console.log('icon', icon.value);
  } catch (error) {
    console.error('切换帧率显示失败:', error);
  }
};

// 假设有一个按钮，用户点击时调用 toggleFps 方法
const fpsToggleButton = ref(null);

// 点击按钮时调用 toggleFps 方法
fpsToggleButton.value = () => toggleFps();


// 输出图层
// 获取entity实体树相关信息
api.entityTree.get().then(entityTree => {
  console.log("实体树entityTree", entityTree);
  // console.log('entityTree的所有属性:', Object.keys(entityTree));
  store.commit("updateEntityObjects", entityTree);
});

// 获取指定图层上的overlay
api.tileset.overlay
  .get({
    tilesetId: "3D06E16EF083CDE71A4919F0F499EB02"
  })
  .then(overlays => {
    //console.log('overlays11', overlays)
  });


</script>

<style src="@/style/MegaCSS.css" scoped></style>
