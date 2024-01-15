<template>
  <div>
    <div id="player"></div>
    <div id="layer-add">
      <h3 style="margin-top: 1%; margin-bottom: 10%;">图层控件</h3>
      <!-- 新增图层添加功能 -->
      <div>
        <div id="addLayerWindow">
          <el-button round id="addLayerButton" @click="showAddDropdown()">添加图层</el-button>
          <!-- <button id="addLayerButton" @click="showAddDropdown()">添加图层</button> -->
        </div>
        <div id="dropdown" style="display: none;">
          <div id="dataset-window">
            <h4>添加数据集</h4>
            <el-button round @click="openAddLayerWindow('3DTilesWindow')">添加3DTiles数据集</el-button>
          </div>
          <div id="component-window">
            <h4>添加三维组件</h4>
            <el-button round @click="openAddLayerWindow('POIWindow')">添加POI点</el-button>
            <div id="POIWindow" style="display: none;">
              <el-button round @click="openAddLayerWindow('labelWindow')">Label</el-button>
              <el-button round @click="openAddLayerWindow('markerWindow')">Marker</el-button>
              <el-button round @click="openAddLayerWindow('wavedecalWindow')">Wave Decal</el-button>
            </div>
            <el-button round @click="addPath()">添加路径</el-button>
            <el-button round @click="addArea()">添加区域</el-button>
          </div>
          <div id="overlay-window">
            <h4>添加叠加图层</h4>
            <el-row class="mb-4">
              <el-button round @click="addTMS()">添加TMS</el-button>
              <el-button round @click="addTianDiTu()">添加天地图</el-button>
              <el-button round @click="addXYZ()">添加XYZ</el-button>
            </el-row>
            <el-row class="mb-4 custom-row">
              <el-button round @click="addWMS()">添加WMS</el-button>
              <el-button round @click="addWMTS()">添加WMTS</el-button>
            </el-row>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加3DTiles数据集窗口 -->
    <div class="add-layer" id="add-dataset-window" style="display: none;">
      <h4 style="text-align: center;">添加3DTiles数据集</h4>
      <el-input v-model="input1" id="dataset-name" placeholder="输入图层名称" clearable />
      <el-input v-model="input2" id="dataset-url" placeholder="输入图层URL" clearable style="margin-top:5px" />
      <div class="button-container">
        <el-button round
          @click="add3DTiles(document.getElementById('dataset-name').value, document.getElementById('dataset-url').value)"
          style="margin-top:5px">确定</el-button>
      </div>
    </div>

    <!-- 添加label窗口 -->
    <div class="add-layer" id="labelWindow" style="display: none;">
      <div class="labelbtn">
        <i class="el-icon el-notification__closeBtn" @click="closeLabelWindow('labelWindow')" @mouseover="hover = true"
          @mouseleave="hover = false">
          <svg data-v-5f73bff2 viewBox="0 0 1024 1024" :class="{ 'hovered': hover }">
            <path data-v-5f73bff2 fill="currentColor"
              d="M764.288 214.592 512 466.88 259.712 214.592a31.936 31.936 0 0 0-45.12 45.12L466.752 512 214.528 764.224a31.936 31.936 0 1 0 45.12 45.184L512 557.184l252.288 252.288a31.936 31.936 0 0 0 45.12-45.12L557.12 512.064l252.288-252.352a31.936 31.936 0 1 0-45.12-45.184z" />
          </svg>
        </i>
      </div>
      <h4 style="text-align: center;">添加Label</h4>
      <div>
        <label for="labelName">组件名称:</label>
        <el-input type="text" size="small" v-model="labelName" placeholder="输入组件名称" />
      </div>
      <div>
        <label for="longitude">经度:</label>
        <el-input type="number" size="small" v-model="longitude" step="0.000001" placeholder="输入经度" />
      </div>
      <div>
        <label for="latitude">纬度:</label>
        <el-input type="number" size="small" v-model="latitude" step="0.000001" placeholder="输入纬度" />
      </div>
      <div>
        <label for="elevation">高程:</label>
        <el-input type="number" v-model="elevation" step="0.01" placeholder="输入高程" size="small" />
      </div>
      <div>
        <label for="labelText">标注文字:</label>
        <el-input type="text" v-model="labelText" placeholder="输入标注文字" size="small" />
      </div>
      <div>
        <label for="anchorX">锚点X:</label>
        <el-input type="number" v-model="anchorX" step="0.1" value="0.5" size="small" />
      </div>
      <div>
        <label for="anchorY">锚点Y:</label>
        <el-input type="number" v-model="anchorY" step="0.1" value="1" size="small" />
      </div>
      <div>
        <label for="offsetX">偏移量X:</label>
        <el-input type="number" v-model="offsetX" step="0.1" value="0" size="small" />
      </div>
      <div>
        <label for="offsetY">偏移量Y:</label>
        <el-input type="number" v-model="offsetY" step="0.1" value="0" size="small" />
      </div>
      <div>
        <label for="minRange">可视范围最小值:</label>
        <el-input type="number" v-model="minRange" step="100" value="0" size="small" />
      </div>
      <div>
        <label for="maxRange">可视范围最大值:</label>
        <el-input type="number" v-model="maxRange" step="100" value="30000" size="small" />
      </div>
      <div>
        <label for="textColor">文字颜色:</label>
        <el-input type="color" v-model="textColor" value="#ffffff" size="small" />
      </div>
      <div>
        <label for="textSize">文字大小:</label>
        <!-- <el-input type="range" v-model="textSize" min="0" max="100" value="10" size="small" /> -->
        <el-slider v-model="textSize" placement="right" :min="0" :max="100" />
      </div>
      <div>
        <label for="strokeColor">描边颜色:</label>
        <el-input type="color" v-model="strokeColor" value="#000000" size="small" />
      </div>
      <div>
        <label for="strokeSize">描边大小:</label>
        <!-- <el-input type="range" v-model="strokeSize" min="0" max="100" value="1" size="small" /> -->
        <el-slider v-model="strokeSize" placement="right" :min="0" :max="100" />
      </div>
      <div class="button-container">
        <el-button round @click="addLabel()">确定</el-button>
      </div>
    </div>
    <div class="layer-control" id="layerControl">
      <ul class="layer-list">
        <li v-for="layer in layers" :key="layer.id" class="layer-item" :id="layer.id">
          <input v-if="layers.length - 1" type="checkbox" :id="layer.name" v-model="layer.visible"
            @change="handleCheckboxChange(layer)" />
          <label :for="layer.name" :id="layer.id">{{ layer.name }}</label>
          <el-button v-if="layers.length - 1" type="danger" size="small" class="ml" link
            @click="deleteLayer(layer.id)">Delete</el-button>
        </li>
      </ul>
    </div>

    <!-- 右侧小图标 -->
    <InsideComponents ref="ref_inside" :api="api" />

  </div>
</template>

<script setup>
// 引入子组件
import InsideComponents from "./InsideComponents.vue"


import { onMounted, ref, watch, computed } from "vue";
import { useStore } from "vuex";
import { ElMessage, ElNotification } from "element-plus";
import "/src/assets/me.min.js";



onMounted(() => {
  const elmnt = document.getElementById("layerControl");
  if (elmnt) {
    dragElement(elmnt);
  }
});

// 从vuex数据仓库里面取数据
const store = useStore();

const hover = ref(false); //关闭按钮的hover状态
const input1 = ref("");
const input2 = ref("");
const labelName = ref("");
const longitude = ref(null);
const latitude = ref(null);
const elevation = ref(null);
const labelText = ref("");
const anchorX = ref(0.5);
const anchorY = ref(1);
const offsetX = ref(0);
const offsetY = ref(0);
const minRange = ref(0);
const maxRange = ref(30000);
const textColor = ref("#ffffff");
const textSize = ref(10);
const strokeColor = ref("#000000");
const strokeSize = ref(1);
const ref_inside = ref(null); // 子组件
const location = computed(() => store.state.location);
const viewRectangle = computed(() => store.state.viewRectangle);
const vuexUrl = computed(() => store.state.vuexUrl); // api初始化url
const vuexWsPort = computed(() => store.state.vuexWsPort); //api初始化wsport
const AreaMeasureStatus = computed(() => store.state.AreaMeasureStatus);
const EntityObjects = computed(() => store.state.EntityObjects);
const isDropdownVisible = computed(() => store.state.isDropdownVisible);
const layers = computed(() => store.state.EntityObjects);
const TileInfo = computed(() => store.state.SelectTileInfo); // 框选tile的信息


console.log("Mega实体树EntityObjects", layers);

console.log("Mega.vue--url", vuexUrl.value);
console.log("Mega.vue--wsPort", vuexWsPort.value);

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
  url: 'localhost:4000', //  客户端所在主机ip，若是本机连接可填 localhost
  wsPort: '2333', //  选填，客户端开启的通信端口，默认为 2333
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
api.control.enableLeftMouseClick(true);
api.control.enableCameraChanged(true);
api.control.enableStudioKeyFrameChanged(true);
if (api.control.enableLeftMouseClick(true)) {
  console.log("点击事件开启成功");
}
if (api.control.enableCameraChanged(true)) {
  console.log("相机移动事件开启成功");
}
if (api.control.enableStudioKeyFrameChanged(true))
  console.log("录播室关键帧事件开启成功");

// ---框选区域
const selectArea = () => {
  ElMessage(
    "连续取点，获取所要框选的区域"
  );
}


api.onEvent(e => {
  //console.log("onEvent事件", e.type, e.data); // 事件类型、事件反馈结果

  if (e.type === "LeftMouseClick") {
    // 点击事件反馈，需要在api.control处开启点击事件
    store.commit("updateLocation", e.data.location);

    console.log(e.data.entity) // entity相关
    console.log(e.data.entity.id) // 目前仅支持Tileset数据id的查询
    console.log(e.data.entity.meta) // 所点击的Bim构件信息，是个字符串，需要调用JSON.parse()解析，要完成该查询对数据组织形式有要求
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

  //console.log(e.type);
  if (e.type === 'DrawResult') { // 绘制事件反馈，需要在api.drawHandler处开启绘制
    console.log('绘制点串，包含经度纬度高度', e.data.lngLatAlts) // 绘制点串，包含经度纬度高度
    ref_inside.value.successMsg(`已成功绘制${e.data.lngLatAlts.length}个点`);
    store.commit("updateSelectTileInfo", e.data.lngLatAlts);
    console.log("绘制点串，包含经度纬度高度2222", TileInfo.value);
  }
});

//初始相机位置
const cameraoptions = {
  position: [114.03568267822266, 22.541633507784642, 350],
  rotation: [80, -45, 0]
};
//设置初始相机位置
api.camera
  .set(cameraoptions)
  .then(res => {
    //console.log('res', res)
  })
  .catch(error => {
    console.log("error", error, error.code);
  });

//设置天气
const weather1 = "PartlyCloudy";
console.log("天气", weather1);
api.weather.set(weather1);

//设置时间
let time = 21.5;
api.weather.setTime(time);

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

//创建一个数据结构，用来存储图层信息，图层包括entityTree中的每个tileset和每个tileset上的overlay，包括id，name，url，visible，type，opacity
//通过循环遍历api.entityTree.get()和api.tileset.overlay.get()，获取到图层，然后使用循环遍历加载到数据结构中
//可通过循环遍历数据结构，将图层信息加载到图层管理器中
var layerData = ref([]);

const saveLayerData = async () => {
  try {
    // Get entityTree
    const entityTree = await api.entityTree.get();

    console.log("entityTreeGet", entityTree);

    // Loop through each layer in entityTree
    for (const layer of entityTree) {
      // Get overlays for each layer
      const overlays = await api.tileset.overlay.get({
        tilesetId: layer.id
      });

      // Create layer object
      const layerObj = {
        id: layer.id,
        name: layer.name,
        url: layer.url,
        type: layer.type,
        opacity: layer.opacity,
        overlays: overlays // Add overlays to layer object
      };

      // 添加tileset图层到layerData
      layerData.value.push(layerObj);

      overlays.forEach(overlay => {
        // Create overlay object
        const overlayObj = {
          id: overlay.id,
          name: overlay.name,
          url: overlay.url,
          type: overlay.type,
          opacity: overlay.opacity
        };

        // 添加overlay图层到layerData
        layerData.value.push(overlayObj);
      });
    }

    console.log("layerData", layerData.value);
  } catch (error) {
    console.log("error", error, error.code);
  }
};

onMounted(() => {
  saveLayerData();
});

// saveLayerData();
// function saveLayerData() {
//   // Get entityTree
//   api.entityTree
//     .get()
//     .then(entityTree => {
//       console.log("entityTreeGet", entityTree);
//       // 遍历 entityTree 中的每一层
//       entityTree.forEach(layer => {
//         // 获取每一层的覆盖层
//         api.tileset.overlay
//           .get({
//             tilesetId: layer.id
//           })
//           .then(overlays => {
//             // console.log('overlaysGet', overlays)
//             // 创建层对象
//             var layerObj = {
//               id: layer.id,
//               name: layer.name,
//               url: layer.url,
//               type: layer.type,
//               opacity: layer.opacity,
//               overlays: overlays // 将覆盖层添加到层对象中
//             };
//             // 添加tileset图层到layerData
//             layerData.push(layerObj);

//             overlays.forEach(overlay => {
//               // console.log('OverlayGet', overlay);
//               // console.log('Overlay id:', overlay.id);
//               // console.log('Overlay name:', overlay.name);

//               var overlayObj = overlay;

//               // var overlayObj = {
//               //     id: overlay.id,
//               //     name: overlay.name,
//               //     url: overlay.url,
//               //     type: overlay.type,
//               //     opacity: overlay.opacity,
//               // };

//               // 添加overlay图层到layerData
//               layerData.push(overlayObj);
//             });
//             //addLayerToLayerControl(layerObj);
//           });
//       });
//     })
//     .then(res => {
//       console.log("layerData", layerData);
//     })
//     .catch(error => {
//       console.log("error", error, error.code);
//     });
// }

// 创建一个HTML元素来显示图层列表
var layerList = document.createElement("ul");
// const layerList = ref([]);
const layerItem = ref({});

//初始化图层管理面板
// var layers = api.entityTree.get().then(entityTree => {
//   layers = entityTree;
//   var layer;
//   for (var i = 0; i < layers.length; i++) {
//     layer = layers[i];
//     //console.log('输出图层看好了啊啊', layer)
//     addLayerToLayerControl(layer);
//   }
// // #region
//     //获取所有entityTree的id
//     // api.entityTree.get().then(entityTree => {
//     //     // 遍历每个图层
//     //     entityTree.forEach(layer => {
//     //         // 根据id获取每个图层上的overlay
//     //         api.tileset.overlay.get({
//     //             tilesetId: layer.id
//     //         }).then(overlays => {
//     //             // 若有overlay，打印overlay信息
//     //             if (overlays.length > 0) {
//     //                 //console.log('Overlay information for layer with id:', layer.id);
//     //                 overlays.forEach(overlay => {
//     //                     // console.log('Overlay', overlay);
//     //                     addLayerToLayerControl(overlay)

//     //                 });
//     //             }
//     //         });
//     //     });
//     // });
// // #endregion
// });
// const layers = ref([]);

const initializeLayerControlPanel = async () => {
  const entityTree = await api.entityTree.get();
  layers.value = entityTree;

  for (const layer of entityTree) {
    addLayerToLayerControl(layer);
  }
};

initializeLayerControlPanel();

function addLabel() {
  console.log(
    document.getElementById("labelName").value,
    document.getElementById("labelText").value
  );
  const Name = document.getElementById("labelName").value;
  const Text = document.getElementById("labelText").value;

  //参数设置，待修改完善
  api.graphic
    .add({
      name: Name,
      data: {
        location: [114.02791996306978, 22.549801373467076, 50]
      },
      style: {
        text: Text,
        anchor: [0.5, 1],
        offset: [0, 0],
        range: [0, 999999999],
        textStyle: {
          fontSize: 10,
          textStrokeColor: "rgb(0, 0, 0)",
          color: "rgb(255, 255, 255)"
        }
      },
      userData: "Label userData",
      type: "Label"
    })
    .then(res => {
      console.log("成功添加", res, res.data.id);
      var addLayer = {
        id: res.data.id,
        name: Name
      };
      console.log("addLayer111", addLayer, addLayer.name);
      addLayerToLayerControl(addLayer);
    })
    .catch(error => {
      console.log("error", error, error.code);
    });
}

// 打开添加图层窗口
function openAddLayerWindow(layerWindowName) {
  if (layerWindowName === "3DTilesWindow") {
    var addDatasetWindow = document.getElementById("add-dataset-window");

    if (addDatasetWindow.style.display === "none") {
      addDatasetWindow.style.display = "block";
    } else {
      addDatasetWindow.style.display = "none";
    }
  }
  if (layerWindowName === "POIWindow") {
    if (document.getElementById("POIWindow").style.display === "block") {
      document.getElementById("POIWindow").style.display = "none";
    } else {
      document.getElementById("POIWindow").style.display = "block";
    }
  } else if (layerWindowName === "labelWindow") {
    if (document.getElementById("labelWindow").style.display === "block") {
      document.getElementById("labelWindow").style.display = "none";
    } else {
      document.getElementById("labelWindow").style.display = "block";
    }
  } else if (layerWindowName === "markerWindow") {
  } else if (layerWindowName === "wavedecalWindow") {
  } else if (layerWindowName === "componentWindow") {
  } else if (layerWindowName === "overlayWindow") {
  }
}

function closeLabelWindow(WindowName) {
  if (WindowName === "labelWindow") {
    document.getElementById("labelWindow").style.display = "none";
  }
}

// 拖动图层控制面板的逻辑
// dragElement(document.getElementById("layerControl"));

//拖动窗口功能
function dragElement(elmnt) {
  var pos1 = 0,
    pos2 = 0,
    pos3 = 0,
    pos4 = 0;
  elmnt.onmousedown = dragMouseDown;

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    // 获取鼠标光标开始位置
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // 计算鼠标光标的新位置
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // 设置元素的新位置
    var newTop = elmnt.offsetTop - pos2;
    var newLeft = elmnt.offsetLeft - pos1;
    // 确保元素不超出视口
    newTop = Math.max(
      0,
      Math.min(newTop, window.innerHeight - elmnt.offsetHeight)
    );
    newLeft = Math.max(
      0,
      Math.min(newLeft, window.innerWidth - elmnt.offsetWidth)
    );
    elmnt.style.top = newTop + "px";
    elmnt.style.left = newLeft + "px";
  }

  function closeDragElement() {
    // 停止移动时解除绑定的事件
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

//删除图层
function deleteLayer(id) {
  const layerId = id;
  api.entityTree
    .delete({
      ids: [layerId]
    })
    .then(res => {
      console.log("删除成功", res);
      deleteLayerToLayerControl(layerId);
    })
    .catch(error => {
      console.log("error", error, error.code);
    });
}

// 从图层管理器中删除图层
function deleteLayerToLayerControl(id) {
  //查找id对应的listItem
  var layerItem = document.getElementById(id);
  console.log("layerItem", layerItem);
  if (layerItem) {
    layerItem.parentNode.removeChild(layerItem);
  }
}

//添加add3DTiles功能
//出现窗口，提示输入图层名称，图层url，确定后添加图层
function add3DTiles(name, url) {
  //console.log('add3DTiles6666666666', name, url)
  api.tileset
    .add({
      //id: '0', //可选
      // pid: '-1',
      name: name,
      //visible: true,
      url: url
      // userData: 'tileset userData',
      //headers: {
      //token: '10_61002817968-1654152769054-671166',
      // token1: '10_61002817968-1654152769054-671166',
      // }
    })
    .then(res => {
      console.log("成功添加", res, res.data.id);
      var addLayer = {
        id: res.data.id,
        name: name,
        url: url,
        visible: true
      };
      addLayerToLayerControl(addLayer);
    })
    .catch(error => {
      console.log("error", error, error.code);
    });
}

// 展开图层界面
function showAddDropdown() {
  var dropdown = document.getElementById("dropdown");
  if (dropdown.style.display == "none") {
    dropdown.style.display = "block";
    //使得addLayerWindow按钮中的添加图层文字变为隐藏控件
    document.getElementById("addLayerButton").innerHTML = "隐藏控件";
  } else {
    dropdown.style.display = "none";
    document.getElementById("addLayerButton").innerHTML = "添加图层";
  }
}
watch(
  () => isDropdownVisible.value,
  newVal => {
    if (newVal) {
      showAddDropdown();
    }
  }
);

// 打印全部overlay
// api.tileset.overlay.get().then(overlays => {
//     console.log('overlays22', overlays)
// })

//隐藏overlay
function disappearOverlay(tilesetId, overlayId) {
  api.tileset.overlay
    .get({
      tilesetId: tilesetId
    })
    .then(overlays => {
      console.log("overlays22", overlays);
      const overlay = overlays[0];
      console.log("overlay", overlay); // overlay对象
      api.tileset.overlay.update({
        ...overlay,
        //name:  'DOM111',
        visible: false,
        // opacity: 0
      });
    })
    .then(res => {
      console.log("更新成功", res);
    })
    .catch(error => {
      console.log("error", error, error.code);
    });
}

//显示overlay
function appearOverlay(tilesetId, overlayId) {
  api.tileset.overlay
    .get({
      tilesetId: tilesetId
    })
    .then(overlays => {
      console.log("overlays22", overlays);
      const overlay = overlays[0];
      console.log("overlay", overlay); // overlay对象
      api.tileset.overlay.update({
        ...overlay,
        //name:  'DOM111',
        visible: true,
        // opacity: 1
      });
    })
    .then(res => {
      console.log("更新成功", res);
    })
    .catch(error => {
      console.log("error", error, error.code);
    });
}

//删除overlay
function deleteOverlay(tilesetId, overlayId) {
  api.tileset.overlay
    .delete({
      tilesetId: tilesetId,
      id: overlayId
    })
    .then(res => {
      console.log("删除成功", res);
    })
    .catch(error => {
      console.log("error", error, error.code);
    });
}

//添加图层到图层管理器中
function addLayerToLayerControl(layer) {
  //console.log('addLayerToLayerControl', layer);

  api.tileset.overlay // 获取全部overlay
    .get({
      tilesetId: layer.id
    })
    .then(overlays => {
      // 若有overlay，打印overlay信息
      if (overlays.length > 0) {
        overlays.forEach(overlay => {
          //console.log('啊啊啊', layer.id, overlay.id);
          const overlayListItem = document.createElement("li");
          overlayListItem.className = "overlay-item";

          const checkbox = document.createElement("input");
          checkbox.type = "checkbox";
          checkbox.id = overlay.name;
          checkbox.checked = true;

          checkbox.addEventListener("change", function () {
            console.log(checkbox, label);
            if (this.checked) {
              console.log("checkedddddoverlay");
              appearOverlay(layer.id, overlay.id);
            } else {
              console.log("checkedddddoverlay");
              disappearOverlay(layer.id, overlay.id);
            }
          });
          // 修改图层显示vue3写法
          const handleCheckboxChange = (layer) => {
            if (layer.visible) {
              // 复选框被选中时执行的操作
              console.log("修改显示appearOverlay", layer.id, overlay.id);
              disappearOverlay(layer.id, overlay.id);
            } else {
              // 复选框未被选中时执行的操作
              console.log("修改显示disappearOverlay", layer.id, overlay.id);
              appearOverlay(layer.id, overlay.id);
            }
          };

          overlayListItem.appendChild(checkbox);

          const overlayLabel = document.createElement("label");
          overlayLabel.htmlFor = overlay.name;
          overlayLabel.textContent = overlay.name;

          overlayListItem.appendChild(overlayLabel);

          overlayListItem.style.marginLeft = "20px";

          const minusSymbol = document.createElement("el-button");
          minusSymbol.textContent = "Delete";
          minusSymbol.className = "delete-layer-symbol";
          minusSymbol.addEventListener("click", function () {
            deleteOverlay(layer.id, overlay.id);
          });

          overlayListItem.appendChild(minusSymbol);

          const layerList = document.getElementById("layerList");
          const layerItem = document.getElementById(layer.id);
          // layerList.insertBefore(overlayListItem, layerItem.nextSibling);
          if (layerList && layerItem) {
            layerList.insertBefore(overlayListItem, layerItem.nextSibling);
          } else {
            console.error("layerList or layerItem does not exist");
          }
        });
      }
    });

  const layerList = document.getElementById("layerList");
  const listItem = document.createElement("li");
  listItem.className = "layer-item";
  listItem.id = layer.id;

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = true;
  checkbox.id = layer.name;

  const label = document.createElement("label");
  label.htmlFor = layer.name;
  label.textContent = layer.name;
  label.id = layer.id;

  if (layerList) {
    const minusSymbol = document.createElement("el-button");
    minusSymbol.textContent = "Delete";
    minusSymbol.className = "delete-layer-symbol";
    minusSymbol.style.marginLeft = "20px"; // 添加这一行
    minusSymbol.addEventListener("click", function () {
      deleteLayer(label.id);
    });

    listItem.appendChild(checkbox);
    listItem.appendChild(label);
    listItem.appendChild(minusSymbol);
    layerList.appendChild(listItem);
  } else {
    console.error("layerList does not exist");
  }

  checkbox.addEventListener("change", function () {
    console.log(checkbox, label);
    if (this.checked) {
      console.log("checkeddddd", label);

      api.entityTree.setVisible({
        ids: label.id,
        visible: true
      });
    } else {
      console.log("checkeddddd", label.id);
      api.entityTree.setVisible({
        ids: label.id,
        visible: false
      });
    }
  });
}

</script>

<style src="@/style/MegaCSS.css"  scoped></style>
