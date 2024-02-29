 <!--
 * @FileDescription: 顶部导航栏菜单
 * @LastEditTime: 1.20
 -->

<template>
  <!----------------------- 顶部导航栏 ----------------------------->
  <div class="contain">
    <el-menu :default-active="activeIndex" class="el-menu-demo" mode="horizontal" background-color="rgb(33,37,41)"
      text-color="#fff" active-text-color="#ffd04b" @select="handleSelect" :ellipsis="false">
      <el-sub-menu index="1">
        <template #title>
          <el-icon>
            <MapLocation />
          </el-icon>
          <span>获取信息</span>
        </template>
        <el-menu-item class="menu-text" index="1-1" @click="open1">鼠标位置</el-menu-item>
        <el-menu-item class="menu-text" index="1-2" @click="open2">视窗范围</el-menu-item>
      </el-sub-menu>
      <el-menu-item index="2" @click="layerControl">
        <el-icon>
          <icon-menu />
        </el-icon>
        <span>图层管理</span>
      </el-menu-item>
      <el-menu-item index="3" @click="showAddDropdown">
        <el-icon>
          <i class="iconfont icon-tuceng" />
        </el-icon>
        <span>瓦片管理</span>
      </el-menu-item>
      <el-menu-item index="8" @click="showUpload">
        <el-icon>
          <i class="iconfont icon-tuceng" />
        </el-icon>
        <span>上传瓦片</span>
      </el-menu-item>
      <el-menu-item index="4" @click="showTerrainInfo">
        <el-icon>
          <el-icon>
            <Reading />
          </el-icon>
        </el-icon>
        <span>框选瓦片</span>
      </el-menu-item>
      <el-sub-menu index="5">
        <template #title>
          <el-icon>
            <Refresh />
          </el-icon>
          <span>shp转换</span>
        </template>
        <el-menu-item index="5-1" @click="shpTogeojson">shp转geojson</el-menu-item>
        <el-menu-item index="5-2" @click="shpToxyz">shp转xyz</el-menu-item>
        <el-menu-item index="5-3" @click="xyzTransform">xyz转换</el-menu-item>
        <el-menu-item index="5-4" @click="shpEdit">shp编辑</el-menu-item>
      </el-sub-menu>
      <el-menu-item index="7" @click="showbim">
        <el-icon>
          <el-icon>
            <Reading />
          </el-icon>
        </el-icon>
        <span>BIM模型操作</span>
      </el-menu-item>
      <!-- <el-sub-menu index="4">
        <template #title>
          <el-icon>
            <icon-menu />
          </el-icon>
          <span>瓦片管理</span>
        </template>
        <el-menu-item index="4-1">新增Tileset</el-menu-item>
        <el-menu-item index="4-2">修改Tileset</el-menu-item>
        <el-sub-menu index="4-3">
          <template #title>影像数据集</template>
          <el-menu-item index="4-3-1">新增数据集</el-menu-item>
          <el-menu-item index="4-3-2">更改数据集</el-menu-item>
        </el-sub-menu>
      </el-sub-menu>-->

      <div class="flex-grow" />
      <el-menu-item index="8" @click="clickUser">
        <el-icon>
          <User />
        </el-icon>
        <span>用户中心</span>
      </el-menu-item>
      <el-menu-item index="9">
        <el-icon>
          <Tools />
        </el-icon>
        <span>设置</span>
      </el-menu-item>
    </el-menu>

    <!----------------------- 右侧信息框 --------------------------------------------->
    <div class="el-notification right"
      style="top: 50px; z-index: 2024; width: 330px; display: flex; padding: 14px 26px 14px 13px; border-radius: 8px; position: fixed; flex-direction: column;"
      v-show="isDivVisible">
      <h2 class="el-notification__title"
        style="font-weight:700; font-size:16px; line-height: 24px; color: black; margin: 0; width: 100%;">鼠标点击经纬度</h2>
      <div class="el-notification__content">
        <i style="color: teal;">
          <p>经度：{{ location[0] }}</p>
          <p>纬度：{{ location[1] }}</p>
          <p>高度：{{ location[2] }}</p>
        </i>
      </div>
      <!-- 窗口右上角关闭按钮svg -->
      <i class="el-icon el-notification__closeBtn" @click="isDivVisible = false">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
          <path fill="currentColor"
            d="M764.288 214.592 512 466.88 259.712 214.592a31.936 31.936 0 0 0-45.12 45.12L466.752 512 214.528 764.224a31.936 31.936 0 1 0 45.12 45.184L512 557.184l252.288 252.288a31.936 31.936 0 0 0 45.12-45.12L557.12 512.064l252.288-252.352a31.936 31.936 0 1 0-45.12-45.184z" />
        </svg>
      </i>
    </div>
    <!----------------------- 右侧信息框 --------------------------------------------->

    <!-- 视图范围信息窗口 -->
    <div class="el-notification right"
      style="top: 190px; z-index: 2024; width: 330px; display: flex; padding: 14px 26px 14px 13px; border-radius: 8px; position: fixed; flex-direction: column;"
      v-show="ViewDivVisible">
      <h2 class="el-notification__title"
        style="font-weight:700; font-size:16px; line-height: 24px; color: black; margin: 0; width: 100%;">可视区域的范围</h2>
      <div class="el-notification__content">
        <i style="color: teal;">
          <p>west: {{ viewRectangle.west }}</p>
          <p>south: {{ viewRectangle.south }}</p>
          <p>east: {{ viewRectangle.east }}</p>
          <p>north: {{ viewRectangle.north }}</p>
        </i>
      </div>
      <!-- 窗口右上角关闭按钮svg -->
      <i class="el-icon el-notification__closeBtn" @click="ViewDivVisible = false">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
          <path fill="currentColor"
            d="M764.288 214.592 512 466.88 259.712 214.592a31.936 31.936 0 0 0-45.12 45.12L466.752 512 214.528 764.224a31.936 31.936 0 1 0 45.12 45.184L512 557.184l252.288 252.288a31.936 31.936 0 0 0 45.12-45.12L557.12 512.064l252.288-252.352a31.936 31.936 0 1 0-45.12-45.184z" />
        </svg>
      </i>
    </div>

    <!-- 计算框选区域瓦片信息 -->
    <TileCaculate style="float: right;" ref="refTile" />
    
    <!-- 上传tif -->
    <TopDiv />




  </div>
</template>

<style src="@/style/TopNavigationCSS.css"  scoped></style>

<script lang="ts" setup>
// 引入组件
import TileCaculate from "./TileCaculate.vue";
import TopDiv from "./TopDiv.vue";
import axios from 'axios';
import { useBimStore } from "../store/bim";

import { reactive, ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
import {
  ElMessage,
  ElDrawer,
  ElMessageBox,
  ElNotification
} from "element-plus";
import { useStore } from "vuex";
import {
  Document,
  Menu as IconMenu,
  Location,
  Setting,
  MapLocation,
  Tools,
  User,
  Close,
  Reading,
  Refresh,
  OfficeBuilding
} from "@element-plus/icons-vue";
import { storeToRefs } from "pinia";

let lastClicked = ref("");
const activeIndex = ref("");
let MouseClick = ref(false);
const dialogFormVisible = ref(false);
const isDivVisible = ref(false);
const ViewDivVisible = ref(false);
const draggable = ref(false);
const formLabelWidth = "140px";

const refTile = ref<any>(null);

//从vuex数据仓库里面取数据
const store = useStore();

let longitude = ref(null);
let latitude = ref(null);
let height = ref(null);
const AreaMeasureStatus = computed(() => store.state.AreaMeasureStatus);
const EntityObjects = computed(() => store.state.EntityObjects);
console.log("top-------EntityObjects", EntityObjects);

console.log("AreaMeasureStatus", AreaMeasureStatus.value);

//从vuex中调用函数
// function showAddDropdown() {
//   store.dispatch("toggleDropdown");
// }
function showAddDropdown() {
  store.commit("toggleDropdown", true);
}

// 定义顶部导航栏按钮点击事件处理函数
const handleSelect = (key: string, keyPath: string[]) => {
  if (lastClicked.value === key) {
    activeIndex.value = activeIndex.value ? "" : key; // 如果当前点击的菜单项是最后一次点击的菜单项，那么就切换选中状态
  } else {
    activeIndex.value = key; // 否则，就选中这个菜单项
  }
  if (key === "1-1") {
    if (isDivVisible.value === true) {
      // isDivVisible.value = false
    } else {
      isDivVisible.value = true; // 如果当前点击的菜单项是 "1-1"，那么就将 isDivVisible 设置为 true
      ElMessage("鼠标左键点击地图获取信息.");
    }
  } else {
    // isDivVisible.value = false; // 否则，就将 isDivVisible 设置为 false
  }
  if (key === "1-2") {
    if (ViewDivVisible.value === true) {
      // ViewDivVisible.value = false
    } else {
      ViewDivVisible.value = true; // 如果当前点击的菜单项是 "1-1"，那么就将 isDivVisible 设置为 true
      ElMessage("缩放地球获取视窗范围信息.");
    }
  } else {
    // ViewDivVisible.value = false; // 否则，就将 isDivVisible 设置为 false
  }
  if (key === "2-1-2") {
    // store.commit("updateAreaMeasureStatus", true);
    // console.log("AreaMeasureStatus修改后：", AreaMeasureStatus.value);
  }
  if (key === "3") {
  }
  if (key === "4") {
    // store.commit("toggleDropdown", true);
  }
  if (key === "5") {

  }
  lastClicked.value = key; // 更新最后一次点击的菜单项
  console.log(key, keyPath);
};

const printResult = computed(() => store.state.printResult);
const Mouseposition_status = computed(() => store.state.Mouseposition_status);
const location = computed(() => store.state.location);
const viewRectangle = computed(() => store.state.viewRectangle);
const vuexUrl = computed(() => store.state.vuexUrl);
const vuexWsPort = computed(() => store.state.vuexWsPort);
const userVisible = computed(() => store.state.userVisible); // 用户信息窗口
const LayerControlVisible = computed(() => store.state.LayerControlVisible); // 图层控制窗口
const uploadDivVisible = computed(() => store.state.UploadDivVisible); // 上传tif

console.log("vuexUrl: ", vuexUrl.value);
console.log("vuexWsPort: ", vuexWsPort.value);


// longitude = location.value.longitude;
// latitude = location.value.latitude;
// height = location.value.height;


// -------点击用户中心
const clickUser = () => {
  dialogFormVisible.value = false

  store.commit("updateUserVisible", true);
}

// --点击图层管理
const layerControl = () => {
  store.commit("updateLayerControlVisible", !LayerControlVisible.value);
}

// 显示框选瓦片信息
const showTerrainInfo = () => {
  // ElMessageBox({
  //   title: "对应瓦片",
  //   message: 'msg',
  //   type: "success",
  //   showClose: true,
  //   confirmButtonText: "确定"
  // });
  // refTile.value.calculateTilesForLevels();
  refTile.value.showInfoFunction();
}

// 显示上传瓦片
const showUpload =()=>{
  store.commit("updateUploadDivVisible",!uploadDivVisible.value);
}

// const gridData = computed(() => store.state.gridData);
console.log("west", viewRectangle.value.west);
console.log("location.longitude", location.value.longitude);
const locationMessage = computed(
  () =>
    `经度：${location.value.longitude}；纬度：${location.value.latitude}；高度：${location.value.height}；`
);
const viewRectangleMessage = computed(
  () =>
    `west：${viewRectangle.value.west}；south：${viewRectangle.value.south}；east：${viewRectangle.value.east}；north：${viewRectangle.value.north}；`
);

const open1 = () => {
  // ElNotification({
  //   title: "鼠标点击经纬度",
  //   message: h("i", { style: "color: teal" }, locationMessage.value),
  //   offset: 50,
  //   duration: 0 //不会自动关闭
  // });
};
const open2 = () => {
  // ElNotification({
  //   title: "可视区域的经纬度",
  //   message: h("i", { style: "color: teal" }, viewRectangleMessage.value),
  //   offset: 50,
  //   duration: 0 //不会自动关闭
  // });
};
//--------用户中心 修改 url 与 Wsport
// onMounted(() => {
//   dialogFormVisible.value = true;
// }); //组件挂载到 DOM 后，对话框就会显示出来
const form = ref({
  url: vuexUrl.value,
  wsPort: vuexWsPort.value
});
const HostChange = () => {
  console.log("HostChange");
  store.commit("updateVuexUrl", form.value.url);
  store.commit("updateVuexWsPort", form.value.wsPort);
  console.log("vuexUrl: ", vuexUrl.value);
  console.log("vuexWsPort: ", vuexWsPort.value);
  dialogFormVisible.value = false;
};

const MousePosition = () => {
  console.log("地图选点开始start");
  MouseClick.value = true;
  // printResult.value = "鼠标左键点击图像获取信息."//只读属性无法这样修改
  // 修改 printResult 的值
  store.commit("setPrintResult", "鼠标左键点击图像获取信息3333.");
  store.commit("setMouseposition_status", "true");
  // 调用 printResult 函数
  console.log(printResult.value);
  console.log(Mouseposition_status.value);
};

// -----------------------
const moveWhthMouseMethod = (ev: MouseEvent) => {
  let div = document.getElementsByClassName("moveWithMouse");
  if (div.length > 0) {
    let element = div[0] as HTMLElement;
    element.style.left = ev.pageX + 30 + "px";
    element.style.top = ev.pageY + "px";
  }
};

onMounted(() => {
  window.addEventListener("mousemove", moveWhthMouseMethod);
});

onBeforeUnmount(() => {
  window.removeEventListener("mousemove", moveWhthMouseMethod);
});

const gridData11 = [
  {
    date: location.value.longitude,
    name: location.value.latitude,
    address: location.value.height
  }
];
const gridData12 = [
  {
    west: viewRectangle.value.west,
    south: viewRectangle.value.south,
    east: viewRectangle.value.east,
    north: viewRectangle.value.north
  }
];
const location22 = [
  {
    date: "2022-01-01",
    name: "Location Name",
    address: "Location Address"
  }
]; // console.log(location22);
// console.log(location22[0]);
// console.log(location22[0].address);

// --------图层展示--------
const updateVisible = (id, visible) => {
  store.commit("updateVisible", { id, visible });
  console.log("点击勾选后EntityObject", EntityObjects.value);
};
const EntityObjects222 = [
  {
    id: "3F5B8DEC29FBF93197ECC1291124F13F",
    pid: "-1",
    name: "terrain",
    type: "Tileset",
    visible: true,
    userData: "",
    url: "http:/localhost:3000/DEM/layer.json",
    headers: {}
  },
  {
    id: "44A350FF6303ABF4B3A1A04B9B990614",
    pid: "-1",
    name: "深大地形",
    type: "Level",
    visible: false,
    userData: "",
    url: "/Game/map/Terrain",
    localOriginShift: {
      translation: [0, 0, 0],
      rotation: [0, 0, 0],
      scale3D: [1, 1, 1]
    },
    localToEarthLonLatH: [113.92, 22.52, 2245]
  },
  {
    id: "243F9DC4B82C3D074CC5F4B571D828C4",
    pid: "-1",
    name: "深大道路",
    type: "Level",
    visible: false,
    userData: "",
    url: "/Game/map/Road",
    localOriginShift: {
      translation: [0, 0, 0],
      rotation: [0, 0, 0],
      scale3D: [1, 1, 1]
    },
    localToEarthLonLatH: [113.92, 22.52, 2245]
  }
];

const drawer = ref(false);
const drawer2 = ref(false);
const direction = ref("rtl");
const radio1 = ref("Option 1");
const handleClose = (done: () => void) => {
  ElMessageBox.confirm("Are you sure you want to close this?")
    .then(() => {
      done();
    })
    .catch(() => {
      // catch error
    });
};
function cancelClick() {
  drawer2.value = false;
}
function confirmClick() {
  ElMessageBox.confirm(`Are you confirm to chose ${radio1.value} ?`)
    .then(() => {
      drawer2.value = false;
    })
    .catch(() => {
      // catch error
    });
}


function shpTogeojson() {
  const url_geojson = 'http://127.0.0.1:4888/convert-geojson';  // ✅ 更新URL
  let shp_file_path = "C:\\Users\\RISC\\Desktop\\Code\\shp2geojson\\test\\test_line.shp"

  const selectedFilePath = window.prompt('Please enter the file path for the SHP file:', shp_file_path);

  if (selectedFilePath) {
    if (!selectedFilePath.endsWith('.shp')) {
      ElMessageBox.alert('Please select a .shp file', 'Error');
      return; // 🚫 阻止非.shp文件
    }
    shp_file_path = selectedFilePath.replace(/\\/g, "\\\\");
  }

  const data_geojson = { shp_path: shp_file_path };

  axios.post(url_geojson, data_geojson)
    .then(response_geojson => {
      if (response_geojson.data) {
        ElMessageBox.alert(response_geojson.data, 'Response');
      }
    })
    .catch(error => {
      console.error(error);
    });
}


function shpToxyz() {
  const url_xyz = 'http://127.0.0.1:4888/convert-xyz';
  // let shp_file_path = 'C:\\Users\\RISC\\Desktop\\Code\\shp2geojson\\test\\test_line.shp';
  let shp_file_path = "C:\\Users\\RISC\\Desktop\\Code\\shp2geojson\\test\\test_line.shp"

  // Prompt user to select a file path
  const selectedFilePath = window.prompt('Please enter the file path for the SHP file:', shp_file_path);

  // Update shp_file_path if the user provided a new path
  if (selectedFilePath) {
    shp_file_path = selectedFilePath.replace(/\\/g, "\\\\");
  }

  const data_xyz = { shp_path: shp_file_path };

  // Send a POST request to the server with the SHP file path
  axios.post(url_xyz, data_xyz)
    .then(response_xyz => {
      // Handle the server's response
      if (response_xyz.data) {
        ElMessageBox.alert(response_xyz.data, 'Response');
      }
    })
    .catch(error => {
      // Handle any errors that occur during the request
      console.error(error);
    });
}


function xyzTransform() {
  const url_xyzTransform = 'http://127.0.0.1:4888/xyzTransform';
  let xyz_file_path = 'C:\\Users\\RISC\\Desktop\\Code\\shp2geojson\\test\\test_line.txt';

  // Prompt user to select a file path
  const selectedFilePath = window.prompt('Please enter the file path for the XYZ file:', xyz_file_path);

  if (selectedFilePath) {
    xyz_file_path = selectedFilePath;
  }

  const data_xyzTransform = { file_path: xyz_file_path };

  axios.post(url_xyzTransform, data_xyzTransform)
    .then(response_xyzTransform => {
      if (response_xyzTransform.data) {
        ElMessageBox.alert(response_xyzTransform.data, 'Response');
      }
    })
    .catch(error => {
      console.error(error);
    });
}

function shpEdit() {
  window.open('http://mapjs.bimant.com/');
}

const selectedObject = ref(null);

const selectObject = object => {
  selectedObject.value = object;
};

//---暴露数据


// bim模型按钮相关
const Bimstore = useBimStore()
const { isBim } = storeToRefs(Bimstore)
const showbim = () => {
  Bimstore.changeisBim()
  console.log("isbim状态",isBim.value)
}


</script>



<style scoped></style>
