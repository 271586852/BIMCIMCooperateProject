<template>
  <!----------------------- 顶部导航栏 -->
  <div class="contain">
    <el-menu :default-active="activeIndex" class="el-menu-demo" mode="horizontal" background-color="rgb(33,37,41)"
      text-color="#fff" active-text-color="#ffd04b" @select="handleSelect" :ellipsis="false">
      <!-- <el-menu-item index="1">获取信息</el-menu-item> -->
      <el-sub-menu index="1">
        <template #title>
          <el-icon>
            <MapLocation />
          </el-icon>
          <span>获取信息</span>
        </template>
        <!-- <template #title>获取图像信息</template> -->

        <el-menu-item class="menu-text" index="1-1" @click="open1">鼠标位置</el-menu-item>
        <el-menu-item class="menu-text" index="1-2" @click="open2">视窗范围</el-menu-item>
      </el-sub-menu>
      <el-sub-menu index="2">
        <template #title>
          <el-icon>
            <i class="iconfont icon-ruler" />
          </el-icon>
          <span>地图测量</span>
        </template>
        <!-- <el-menu-item index="2-1">
          面积测量
        </el-menu-item>-->
        <!-- <el-menu-item index="2-2">item two</el-menu-item> -->
        <!-- <el-menu-item index="2-3">item three</el-menu-item> -->
        <el-sub-menu index="2-1">
          <template #title>面积测量</template>
          <el-menu-item index="2-1-1">输入范围</el-menu-item>
          <el-menu-item index="2-1-2">图中框选</el-menu-item>
        </el-sub-menu>
        <el-menu-item index="2-2">
          <template #title>三角测量</template>
          <!-- <el-menu-item index="2-2-1">图中标点</el-menu-item> -->
          <!-- <el-menu-item index="2-2-2">图中画线</el-menu-item> -->
        </el-menu-item>
      </el-sub-menu>
      <el-menu-item index="3" @click="drawer = true">
        <el-icon>
          <icon-menu />
        </el-icon>
        <span>图层管理</span>
      </el-menu-item>
      <el-menu-item index="4" @click="showAddDropdown">
        <el-icon>
          <i class="iconfont icon-tuceng" />
        </el-icon>
        <span>瓦片管理</span>
      </el-menu-item>
      <el-menu-item index="5" @click="showTerrainInfo">
        <el-icon>
          <el-icon>
            <Reading />
          </el-icon>
        </el-icon>
        <span>框选瓦片</span>
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
      <el-menu-item index="6" @click="clickUser">
        <el-icon>
          <User />
        </el-icon>
        <span>用户中心</span>
      </el-menu-item>
      <el-menu-item index="7">
        <el-icon>
          <Tools />
        </el-icon>
        <span>设置</span>
      </el-menu-item>
    </el-menu>
    <!----------------------- 右侧信息框 -->
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
      <i class="el-icon el-notification__closeBtn" @click="isDivVisible = false">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
          <path fill="currentColor"
            d="M764.288 214.592 512 466.88 259.712 214.592a31.936 31.936 0 0 0-45.12 45.12L466.752 512 214.528 764.224a31.936 31.936 0 1 0 45.12 45.184L512 557.184l252.288 252.288a31.936 31.936 0 0 0 45.12-45.12L557.12 512.064l252.288-252.352a31.936 31.936 0 1 0-45.12-45.184z" />
        </svg>
      </i>
    </div>
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
      <i class="el-icon el-notification__closeBtn" @click="ViewDivVisible = false">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
          <path fill="currentColor"
            d="M764.288 214.592 512 466.88 259.712 214.592a31.936 31.936 0 0 0-45.12 45.12L466.752 512 214.528 764.224a31.936 31.936 0 1 0 45.12 45.184L512 557.184l252.288 252.288a31.936 31.936 0 0 0 45.12-45.12L557.12 512.064l252.288-252.352a31.936 31.936 0 1 0-45.12-45.184z" />
        </svg>
      </i>
    </div>
    <!----------------------- 用户中心 -->
    <el-dialog v-model="dialogFormVisible" title="User Setting" width="30%">
      <el-form :model="form">
        <el-form-item label="url" :label-width="formLabelWidth">
          <el-input v-model="form.url" autocomplete="off" placeholder="localhost:4000" clearable />
        </el-form-item>
        <el-form-item label="wsPort" :label-width="formLabelWidth">
          <el-input v-model="form.wsPort" autocomplete="off" placeholder="2333" clearable />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogFormVisible = false">Cancel</el-button>
          <el-button type="primary" @click="HostChange">Confirm</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 计算框选区域瓦片信息 -->
    <TileCaculate style="float: right;" ref="refTile" />




  </div>
</template>

<style src="@/style/TopNavigationCSS.css"  scoped></style>

<script lang="ts" setup>
// 引入组件
import TileCaculate from "./TileCaculate.vue";

import { reactive, ref, computed, onMounted, onBeforeUnmount, h } from "vue";
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
  Reading
} from "@element-plus/icons-vue";

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

let longitude = ref("");
let latitude = ref("");
let height = ref("");
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

console.log("vuexUrl: ", vuexUrl.value);
console.log("vuexWsPort: ", vuexWsPort.value);

longitude = location.value.longitude;
latitude = location.value.latitude;
height = location.value.height;


// -------点击用户中心
const clickUser = () => {
  dialogFormVisible.value = false

  store.commit("updateUserVisible", true);
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
  refTile.value.calculateTilesForLevels();
  refTile.value.showInfoFunction();
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

const selectedObject = ref(null);

const selectObject = object => {
  selectedObject.value = object;
};

//---暴露数据


</script>



<style scoped></style>
