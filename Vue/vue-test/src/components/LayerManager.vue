 <!--
 * @FileDescription: 页面中的图层控件面板以及图层管理器
 * @Author: D
 * @Date: 1.16
 * @LastEditTime: 1.17
 -->

<template>
    <div>
        <div id="layerControl-div">
            <h3 style="margin-top: 1%; margin-bottom: 10%;">图层控件</h3>
            <!-- 新增图层添加功能 -->
            <!-- ------图层控件板块原始界面------------>
            <div>
                <div id="addLayerWindow">
                    <el-button round id="addLayerButton" @click="showAddDropdown()">添加图层</el-button>
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
                <i class="el-icon el-notification__closeBtn" @click="closeLabelWindow('labelWindow')"
                    @mouseover="hover = true" @mouseleave="hover = false">
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

        <!-- 右下角图层列表 -->
        <div class="layer-control" id="layerControl">
            <ul id="layer-list">
                <li v-for="layer in layers" :key="layer.id" id="layer-item" :id="layer.id">
                    <input v-if="layers.length - 1" type="checkbox" :id="layer.name" v-model="layer.visible"
                        @change="handleCheckboxChange(layer)" />
                    <label :for="layer.name" :id="layer.id">{{ layer.name }}</label>
                    <el-button v-if="layers.length - 1" type="danger" size="small" class="ml" link
                        @click="deleteLayer(layer.id)">Delete</el-button>
                </li>
            </ul>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref, watch, computed } from "vue";
import { useStore } from "vuex";

// 使用 defineProps 定义接收的父组件的方法作为 props
const props = defineProps({
    api: {
        type: Object,
        required: true
    },
});

// 从vuex数据仓库里面取数据
const store = useStore();
// 需要用的数据
const isDropdownVisible = computed(() => store.state.isDropdownVisible);
const layers = computed(() => store.state.EntityObjects);

// 声明响应式变量
const hover = ref(false); //关闭按钮的hover状态
// 3DTile数据集窗口-------
const input1 = ref("");
const input2 = ref("");
// 添加labal-------------
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


// ----图层管理具体实现--------------------------------
//创建一个数据结构，用来存储图层信息，图层包括entityTree中的每个tileset和每个tileset上的overlay，包括id，name，url，visible，type，opacity
//通过循环遍历api.entityTree.get()和api.tileset.overlay.get()，获取到图层，然后使用循环遍历加载到数据结构中
//可通过循环遍历数据结构，将图层信息加载到图层管理器中
var layerData = ref([]);

const saveLayerData = async () => {
    try {
        // Get entityTree
        const entityTree = await props.api.entityTree.get();

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

// --初始化图层管理面板
const initializeLayerControlPanel = async () => {
    const entityTree = await props.api.entityTree.get();
    layers.value = entityTree;

    for (const layer of entityTree) {
        addLayerToLayerControl(layer);
    }
};

initializeLayerControlPanel();

// 添加label的方法实现
const addLabel = () => {
    console.log(
        document.getElementById("labelName").value,
        document.getElementById("labelText").value
    );
    const Name = document.getElementById("labelName").value;
    const Text = document.getElementById("labelText").value;

    //参数设置，待修改完善
    props.api.graphic
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

// --点击“添加图层”按钮，显示控制面板
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
    } else if (layerWindowName === "wavedecalWindow") {
    } else if (layerWindowName === "componentWindow") {
    } else if (layerWindowName === "overlayWindow") {
    }
}

//--关闭添加labal窗口
const closeLabelWindow = (WindowName) => {
    if (WindowName === "labelWindow") {
        document.getElementById("labelWindow").style.display = "none";
    }
}

// --右下角图层管理元素的拖拽实现----------------
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
// --右下角图层管理元素的拖拽实现----------------

//--删除图层
const deleteLayer = (id) => {
    const layerId = id;
    props.api.entityTree
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


/**
 * @description 删除图层
 * @param {hu} id 图层id
 */
const deleteLayerToLayerControl = (id) => {
    //查找id对应的listItem
    var layerItem = document.getElementById(id);
    console.log("layerItem", layerItem);
    if (layerItem) {
        layerItem.parentNode.removeChild(layerItem);
    }
}


/**
 * 添加add3DTiles功能
 * @param {*} name 图层名称
 * @param {*} url 图层url
 */
const add3DTiles = (name, url) => {
    //console.log('add3DTiles6666666666', name, url)
    props.api.tileset
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


/**
 * 展开图层界面
 */
const showAddDropdown = () => {
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

// 监视其变化
watch(
    () => isDropdownVisible.value,
    newVal => {
        if (newVal) {
            showAddDropdown();
        }
    }
);


/**
 * 隐藏overlay
 * @param {*} tilesetId 
 * @param {*} overlayId 
 */
const disappearOverlay = (tilesetId, overlayId) => {
    props.api.tileset.overlay
        .get({
            tilesetId: tilesetId
        })
        .then(overlays => {
            console.log("overlays22", overlays);
            const overlay = overlays[0];
            console.log("overlay", overlay); // overlay对象
            props.api.tileset.overlay.update({
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


/**
 * 显示overlay
 * @param {*} tilesetId 
 * @param {*} overlayId 
 */
const appearOverlay = (tilesetId, overlayId) => {
    props.api.tileset.overlay
        .get({
            tilesetId: tilesetId
        })
        .then(overlays => {
            console.log("overlays22", overlays);
            const overlay = overlays[0];
            console.log("overlay", overlay); // overlay对象
            props.api.tileset.overlay.update({
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


/**
 * 删除overlay
 * @param {*} tilesetId 
 * @param {*} overlayId 
 */
const deleteOverlay = (tilesetId, overlayId) => {
    props.api.tileset.overlay
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

const layerList = document.getElementById("layer-list");
/**
 * 添加图层到图层管理器中
 * @param {*} layer 传入图层object
 */
const addLayerToLayerControl = (layer) => {
    // 处理复选框变化事件
    const handleCheckboxChange = (overlay) => {
        if (overlay.visible) {
            console.log("修改显示appearOverlay", layer.id, overlay.id);
            disappearOverlay(layer.id, overlay.id);
        } else {
            console.log("修改显示disappearOverlay", layer.id, overlay.id);
            appearOverlay(layer.id, overlay.id);
        }
    };

    // 获取图层的overlay
    props.api.tileset.overlay
        .get({
            tilesetId: layer.id
        })
        .then((overlays) => {
            if (overlays.length > 0) {
                overlays.forEach((overlay) => {
                    const overlayListItem = document.createElement("li");
                    overlayListItem.className = "overlay-item";

                    const checkbox = document.createElement("input");
                    checkbox.type = "checkbox";
                    checkbox.id = overlay.name;
                    checkbox.checked = true;

                    checkbox.addEventListener("change", () => {
                        handleCheckboxChange(overlay);
                    });

                    overlayListItem.appendChild(checkbox);

                    const overlayLabel = document.createElement("label");
                    overlayLabel.htmlFor = overlay.name;
                    overlayLabel.textContent = overlay.name;

                    overlayListItem.appendChild(overlayLabel);

                    overlayListItem.style.marginLeft = "20px";

                    const minusSymbol = document.createElement("el-button");
                    minusSymbol.textContent = "Delete";
                    minusSymbol.className = "delete-layer-symbol";

                    minusSymbol.addEventListener("click", () => {
                        deleteOverlay(layer.id, overlay.id);
                    });

                    overlayListItem.appendChild(minusSymbol);

                    const layerItem = document.getElementById(layer.id);

                    if (layerList && layerItem) {
                        layerList.insertBefore(overlayListItem, layerItem.nextSibling);
                    } else {
                        console.error("错误：layerList or layerItem does not exist");
                    }
                });
            }
        });

    // 创建主图层项
    const listItem = document.createElement("li");
    listItem.className = "layer-item";
    listItem.id = layer.id;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = true;
    checkbox.id = layer.name;

    if (layerList) {
        const minusSymbol = document.createElement("el-button");
        minusSymbol.textContent = "Delete";
        minusSymbol.className = "delete-layer-symbol";
        minusSymbol.style.marginLeft = "20px";

        minusSymbol.addEventListener("click", () => {
            deleteLayer(layer.id);
        });

        listItem.appendChild(checkbox);
        listItem.appendChild(document.createElement("label"));
        listItem.appendChild(minusSymbol);
        layerList.appendChild(listItem);
    } else {
        console.error("layerList does not exist");
    }

    // 处理主图层复选框变化事件
    checkbox.addEventListener("change", () => {
        props.api.entityTree.setVisible({
            ids: layer.id,
            visible: checkbox.checked
        });
    });
};

// onMounted(() => {
//     saveLayerData();
// });
// 钩子函数，在组件挂载后执行一段逻辑，元素的拖拽功能
onMounted(() => {
    saveLayerData();
    const elmnt = document.getElementById("layerControl");
    if (elmnt) {
        dragElement(elmnt);
    }
});



</script>

<style scoped>
/* 图层管理控件样式 */
#divlogs {
    position: absolute;
    /* border: 10px; */
    white-space: pre-line;
    /* 保留空格和换行符 */
    /* resize: vertical; 允许用户垂直调整元素的大小 */
    /*overflow: auto;  如果内容超出 #bottomInfo 的大小，显示滚动条 */
    overflow-x: hidden;
    padding-left: 50px;
    /* 文本离左边有 10px 的距离 */
    padding-bottom: 30px;
    /* padding-top: 50px; */
}

#toptext {
    position: sticky;
    /* position: sticky;  */
    /* bottom: 0%; */
    padding-left: 2%;
    display: flex;
    align-items: center;
    height: 18%;
    margin-top: 0%;
    top: 0px;
    width: 100%;
    background-color: rgb(240, 239, 239);
    border: 2px solid rgb(228, 231, 237);
    z-index: 10;
    font-weight: bold;
}

#text-span:hover {
    color: rgb(64, 158, 255);
}

/* 图层管理控件样式 */
.layer-control {
    width: 350px;
    position: absolute;
    right: 10px;
    top: 500px;
    border: 1px;
    background-color: #f9f9f9;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
    padding: 10px;
    border-radius: 5%;
    cursor: move;
    /* 可拖动的光标样式 */
    z-index: 10;
}

.add-layer {
    width: 200px;
    position: absolute;
    left: 10px;
    top: 40px;
    border: 1px;
    background-color: #f9f9f9;
    border-radius: 7px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
    padding: 10px;
    cursor: move;
    /* 可拖动的光标样式 */
    z-index: 1000;
    font-size: 12px;
    line-height: 1.5;
    /* 增加行距 */
}

.button-container {
    display: flex;
    justify-content: center;
}

/* 图层列表样式 */
#layer-list {
    list-style-type: none;
    font-size: 14px;
    font-weight: 600;
    padding: 0;
    margin-left: 8px;
}

/* 图层项样式 */
#layer-item {
    margin-bottom: 6px;
    display: flex;
    align-items: center;
    /* 设置垂直居中 */
    justify-content: space-between;
    /* 设置内容两端对齐 */
    height: 40px;
    /* 设置固定的高度，可以根据实际需要调整 */
}

.delete-layer-symbol {
    float: right;
    margin-right: 10px;
    background-color: #f9f9f9;
    border: none;
    cursor: pointer;
}



#layerControl-div {
    position: fixed;
    border-radius: 8px;
    top: 40px;
    right: 0;
    border: 1px;
    /* Add a border */
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
    /* Add a shadow */
    padding: 14px 26px 14px 13px;
    flex-direction: column;
    background-color: #f9f9f9;
    z-index: 15;
}

.button-group {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
}

.button-group>.my-button {
    flex: 1 0 30%;
    margin: 5px;
}

.custom-row {
    margin-top: 1vh;
    /* Adjust as needed */
}

.labelbtn {
    text-align: right;
}

/* 按钮样式 */
.el-icon.el-notification__closeBtn {
    cursor: pointer;
}

.el-icon.el-notification__closeBtn svg.hovered {
    transform: scale(1.5);
    color: rgb(64, 158, 255);
}

.ml {
    margin-left: 7px;
}

.layerbtn {
    position: relative;
    float: right;
    display: flex;
    align-items: center;
    flex-direction: row;
}

</style>