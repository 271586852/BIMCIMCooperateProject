<!--
 * @FileDescription: 图层管理（显示、隐藏、删除->新增图层）
 * @LastEditTime: 1.20
 -->

<template>
    <div id="layerControl-div">
        <h3 style="margin-top: 1%; margin-bottom: 10%;">图层控件</h3>

        <!-- 新增图层添加功能 -->
        <!-- ------图层控件板块原始界面------------>
        <div>
            <div id="addLayerWindow">
                <el-button round id="addLayerButton" @click="showAddDropdown()" type="primary">添加控件</el-button>
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
                        <el-button round @click="openAddLayerWindow('WaveDecalWindow')">Wave Decal</el-button>
                    </div>
                    <el-button round @click="openAddLayerWindow('PathWindow')">添加路径</el-button>
                    <div id="PathWindow" style="display: none;">
                        <el-button round @click="openAddLayerWindow('odlineWindow')">ODLine</el-button>
                        <el-button round @click="openAddLayerWindow('polylineWindow')">Polyline</el-button>
                    </div>
                    <el-button round @click="openAddLayerWindow('AreaWindow')">添加区域</el-button>
                    <div id="AreaWindow" style="display: none;">
                        <el-button round @click="openAddLayerWindow('wallWindow')">Wall</el-button>
                        <el-button round @click="openAddLayerWindow('GeometryDecalWindow')">GeometryDecal</el-button>
                        <el-button round @click="openAddLayerWindow('TextureDecalWindow')">TextureDecal</el-button>
                    </div>
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
    <Tileset :api="props.api" :fetchEntityTree="fetchEntityTree" />

    <!-- 添加label窗口 -->
    <Label :api="props.api" :fetchEntityTree="fetchEntityTree" />

    <!-- 添加marker窗口 -->
    <Marker :api="props.api" :fetchEntityTree="fetchEntityTree" />

    <!-- 添加WaveDecal窗口 -->
    <WaveDecal :api="props.api" :fetchEntityTree="fetchEntityTree" />

    <!-- 添加ODLine窗口 -->
    <ODLine :api="props.api" :fetchEntityTree="fetchEntityTree" />

    <!-- 添加Polyline窗口 -->
    <Polyline :api="props.api" :fetchEntityTree="fetchEntityTree" />

    <!-- 添加Walls窗口 -->
    <Wall :api="props.api" :fetchEntityTree="fetchEntityTree" />

    <!-- 添加GeometryDecal窗口 -->
    <GeometryDecal :api="props.api" :fetchEntityTree="fetchEntityTree" />

    <!-- 添加TextureDecal窗口 -->
    <TextureDecal :api="props.api" :fetchEntityTree="fetchEntityTree" />

    <!-- 图层管理模块 ---------->

    <el-dialog v-model="isLayerControlVisible" title="图层管理" center width="300" :modal="false" draggable class="custom-dialog"
        style="border: 2px solid #606266; height: 300px; float: left; overflow: hidden;" 
        :close-on-click-modal="false" modal-class="dialog_class" :before-close="updateState">
        <el-scrollbar height="200px" style="margin-top:0px;" >
                <ul class="layer-list">
                    <li v-for="layer in layers" :key="layer.id" :id="layer.id" class="layer-item" title="双击可将视图切换至合适位置">
                        <el-checkbox v-model="layer.visible" @change="toggleLayerVisibility(layer)">
                            <span class="layer-name" @click="toggleCollapse(layer.id)" @dblclick="flyToLayer(layer.id)">
                                <svg v-if="layer.overlays.length > 0" class="layer-svg" xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 1024 1024" :style="{ 'transform': isCollapsed[layer.id] ? 'rotate(0deg)' : 'rotate(90deg)', 'transition': 'transform 0.3s' }">
                                    <path fill="currentColor"
                                        d="M338.752 104.704a64 64 0 0 0 0 90.496l316.8 316.8-316.8 316.8a64 64 0 0 0 90.496 90.496l362.048-362.048a64 64 0 0 0 0-90.496L429.248 104.704a64 64 0 0 0-90.496 0z">
                                    </path>
                                </svg>{{ layer.name }}
                            </span>
                        </el-checkbox>
                        <el-button class="delete-layer-symbol" @click="deleteLayer(layer.id)" text>Delete</el-button>
                        <el-collapse-transition>
                            <ul v-if="!isCollapsed[layer.id]" class="overlay-list">
                                <li v-for="overlay in layer.overlays" :key="overlay.id" class="overlay-item"
                                    style="margin-left: 20px;" title="双击可将视图切换至合适位置">
                                    <el-checkbox v-model="overlay.visible"
                                        @change="toggleOverlayVisibility(layer.id, overlay)">
                                        {{ overlay.name }}
                                    </el-checkbox>
                                    <el-button class="delete-layer-symbol" @click="deleteOverlay(layer.id, overlay.id)" text>Delete</el-button>
                                </li>
                            </ul>
                        </el-collapse-transition>
                    </li>
                </ul>
        </el-scrollbar>
    </el-dialog>
</template>

<script setup>
import { ref, onMounted, watch, computed, watchEffect } from 'vue';
import { useStore } from 'vuex';
import {
    Menu as IconMenu,
} from "@element-plus/icons-vue"
import Tileset from './addLayers/Tileset.vue'
import Label from './addLayers/Label.vue'
import Marker from './addLayers/Marker.vue'
import WaveDecal from './addLayers/WaveDecal.vue'
import ODLine from './addLayers/ODline.vue'
import Polyline from './addLayers/Polyline.vue';
import Wall from './addLayers/Wall.vue';
import GeometryDecal from './addLayers/GeometryDecal.vue';
import TextureDecal from './addLayers/TextureDecal.vue';

// 使用 defineProps 定义接收的父组件的方法作为 props
const props = defineProps({
    api: {
        type: Object,
        required: true
    }
});

// 从vuex数据仓库里面取数据
const store = useStore();
// 需要用的数据
const isDropdownVisible = computed(() => store.state.isDropdownVisible);
const isLayerControlVisible = computed(() => store.state.LayerControlVisible); // 图层管理状态



// 更新窗口显示状态
const updateState = () => {
    store.commit('updateLayerControlVisible', false);
}


// --图层管理隐藏与展开
const LayerControlVisible = ref(false);

const toggleLayerControl = () => {
    LayerControlVisible.value = !LayerControlVisible.value;
}

// ---图层控件-----------------------------




/**
 * 点击“添加图层”按钮，显示控制面板
 * @param {*} layerWindowName 传入添加控件名称
 */
const openAddLayerWindow = (layerWindowName) => {
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
        if (document.getElementById("markerWindow").style.display === "block") {
            document.getElementById("markerWindow").style.display = "none";
        } else {
            document.getElementById("markerWindow").style.display = "block";
        }
    } else if (layerWindowName === "WaveDecalWindow") {
        if (document.getElementById("WaveDecalWindow").style.display === "block") {
            document.getElementById("WaveDecalWindow").style.display = "none";
        } else {
            document.getElementById("WaveDecalWindow").style.display = "block";
        }
    }
    if (layerWindowName === "PathWindow") {
        if (document.getElementById("PathWindow").style.display === "block") {
            document.getElementById("PathWindow").style.display = "none";
        } else {
            document.getElementById("PathWindow").style.display = "block";
        }
    } else if (layerWindowName === "odlineWindow") {
        if (document.getElementById("odlineWindow").style.display === "block") {
            document.getElementById("odlineWindow").style.display = "none";
        } else {
            document.getElementById("odlineWindow").style.display = "block";
        }
    } else if (layerWindowName === "polylineWindow") {
        if (document.getElementById("polylineWindow").style.display === "block") {
            document.getElementById("polylineWindow").style.display = "none";
        } else {
            document.getElementById("polylineWindow").style.display = "block";
        }
    }

    if (layerWindowName === "AreaWindow") {
        if (document.getElementById("AreaWindow").style.display === "block") {
            document.getElementById("AreaWindow").style.display = "none";
        } else {
            document.getElementById("AreaWindow").style.display = "block";
        }
    } else if (layerWindowName === "wallWindow") {
        if (document.getElementById("wallWindow").style.display === "block") {
            document.getElementById("wallWindow").style.display = "none";
        } else {
            document.getElementById("wallWindow").style.display = "block";
        }
    } else if (layerWindowName === "GeometryDecalWindow") {
        if (document.getElementById("GeometryDecalWindow").style.display === "block") {
            document.getElementById("GeometryDecalWindow").style.display = "none";
        } else {
            document.getElementById("GeometryDecalWindow").style.display = "block";
        }
    } else if (layerWindowName === "TextureDecalWindow") {
        if (document.getElementById("TextureDecalWindow").style.display === "block") {
            document.getElementById("TextureDecalWindow").style.display = "none";
        } else {
            document.getElementById("TextureDecalWindow").style.display = "block";
        }
    }




}



/**
 * 展开图层界面
 */
const showAddDropdown = () => {
    var dropdown = document.getElementById("dropdown");
    if (dropdown.style.display == "none") {
        dropdown.style.display = "block";
        //使得addLayerWindow按钮中的添加图层文字变为隐藏控件
        document.getElementById("addLayerButton").innerHTML = "隐藏窗口";
    } else {
        dropdown.style.display = "none";
        document.getElementById("addLayerButton").innerHTML = "添加控件";
    }
}

// 监视其变化
watch(
    () => isDropdownVisible.value,
    newVal => {
        if (newVal) {
            showAddDropdown();
        }
    }
);

// --图层控件----------------------------------------------------

// 使用对象来保存每个项目的折叠状态
const isCollapsed = ref({});

// 切换折叠状态的函数
const toggleCollapse = (layerId) => {
    isCollapsed.value[layerId] = !isCollapsed.value[layerId];
};

const layers = ref([]);
let entityTree = ref();

onMounted(async () => {
    await fetchEntityTree();
});

async function fetchEntityTree() {
    entityTree.value = await props.api.entityTree.get();
    await updateLayers();
    console.log('图层数据获取成功：');
}

watch(entityTree, async (newEntityTree) => {
    await updateLayers();
}, { deep: true });

async function updateLayers() {
    layers.value = entityTree.value.map(layer => ({
        ...layer,
        visible: layer.visible,
        overlays: []
    }));
    console.log('图层数据更新：', layers.value);
    await loadOverlays();
}

async function loadOverlays() {
    for (const layer of layers.value) {
        const overlays = await props.api.tileset.overlay.get({ tilesetId: layer.id });
        layer.overlays = overlays.map(overlay => ({
            ...overlay,
            visible: true // 假设所有overlay默认可见
        }));
    }
}

// ---图层控件-----------------------------

/**
 * 自动定位到该对象合适的观察距离
 * @param {*} layerId 传入图层id
 */
const flyToLayer = (layerId) => {
    let options = {
        id: layerId,
        rotation: [80, -45, 0],
        distance: 100
    }
    props.api.camera.flyTo(options)
    console.log('执行flyToLayer');
}


/**
 * 改变图层的显示
 * @param {*} layer 传入图层数据
 */
const toggleLayerVisibility = (layer) => {
    props.api.entityTree.setVisible({
        ids: [layer.id],
        visible: layer.visible
    });
}

/**
 * 切换显示
 * @param {*} tilesetId 覆盖图层的id
 * @param {*} overlay overlay的id
 */
const toggleOverlayVisibility = (tilesetId, overlay) => {
    props.api.tileset.overlay.update({
        ...overlay,
        opacity: overlay.visible ? 1 : 0
    });
}

/**
 * 删除图层
 * @param {*} id 
 */
const deleteLayer = (id) => {
    props.api.entityTree.delete({ ids: [id] });
    layers.value = layers.value.filter(layer => layer.id !== id);
}

/**
 * 删除overlay
 * @param {*} tilesetId 
 * @param {*} overlayId 
 */
const deleteOverlay = (tilesetId, overlayId) => {
    props.api.tileset.overlay.delete({ tilesetId, id: overlayId });
    const layer = layers.value.find(layer => layer.id === tilesetId);
    if (layer) {
        layer.overlays = layer.overlays.filter(overlay => overlay.id !== overlayId);
    }
}

// --可拖拽控件----
let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

const layerControlRef = ref(null);

function dragMouseDown(e) {
    e.preventDefault();
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
}

function elementDrag(e) {
    if (!layerControlRef.value) return;

    e.preventDefault();
    // 计算鼠标移动的距离
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;

    const elmnt = layerControlRef.value;

    // 计算新位置
    let newLeft = elmnt.offsetLeft - pos1;
    let newTop = elmnt.offsetTop - pos2;

    // 获取浏览器窗口的尺寸
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    // 获取元素的尺寸
    const elmntWidth = elmnt.offsetWidth;
    const elmntHeight = elmnt.offsetHeight;

    // 确保元素不会移动到浏览器窗口外
    // 不允许左边界超出
    if (newLeft < 0) {
        newLeft = 0;
    }
    // 不允许右边界超出
    else if (newLeft + elmntWidth > windowWidth) {
        newLeft = windowWidth - elmntWidth;
    }

    // 不允许上边界超出
    if (newTop < 40) {
        newTop = 40;
    }
    // 不允许下边界超出
    else if (newTop + elmntHeight > windowHeight) {
        newTop = windowHeight - elmntHeight;
    }

    // 应用新位置
    elmnt.style.left = newLeft + 'px';
    elmnt.style.top = newTop + 'px';
}

function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
}
// --可拖拽控件----
</script>

<style src="@/assets/css/LayerManager.css"></style>