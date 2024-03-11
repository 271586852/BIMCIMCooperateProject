<template>
    <!-- label窗口 -->
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
        <h2 style="text-align: center;">添加Label</h2>
        <div>
            <label for="labelName">组件名称:</label>
            <el-input type="text" size="small" v-model="labelName" placeholder="输入组件名称" />
        </div>

        <div style="display: flex; justify-content: space-between;">
            <label for="longitude">位置:</label>
            <el-button type="primary" :icon="Aim" circle color="rgb(0,0,0)" @click="AimPosition" />
        </div>
        <div style="display: flex; justify-content: space-between;">
            <el-input type="number" size="small" v-model="longitude" step="0.000001" placeholder="输入经度" />
            <el-input type="number" size="small" v-model="latitude" step="0.000001" placeholder="输入纬度" />
            <el-input type="number" v-model="elevation" step="0.01" placeholder="输入高程" size="small" />
        </div>
        <div>
            <label for="labelText">标注文字:</label>
            <el-input type="text" v-model="labelText" placeholder="输入标注文字" size="small" />
        </div>
        <div>
            <label for="anchorX">锚点X:</label>
            <el-input type="number" v-model="anchorX" step="0.1" size="small" />
        </div>
        <div>
            <label for="anchorY">锚点Y:</label>
            <el-input type="number" v-model="anchorY" step="0.1" size="small" />
        </div>
        <div>
            <label for="offsetX">偏移量X:</label>
            <el-input type="number" v-model="offsetX" step="0.1" size="small" />
        </div>
        <div>
            <label for="offsetY">偏移量Y:</label>
            <el-input type="number" v-model="offsetY" step="0.1" size="small" />
        </div>
        <div>
            <label for="minRange">可视范围最小值:</label>
            <el-input type="number" v-model="minRange" step="100" size="small" />
        </div>
        <div>
            <label for="maxRange">可视范围最大值:</label>
            <el-input type="number" v-model="maxRange" step="100" size="small" />
        </div>
        <div>
            <label for="textColor">文字颜色:</label>
            <!-- <el-input type="color" v-model="textColor"  size="small" /> -->
            <el-color-picker v-model="textColor" show-alpha />
        </div>
        <div>
            <label for="textSize">文字大小:</label>
            <!-- <el-input type="range" v-model="textSize" min="0" max="100" value="10" size="small" /> -->
            <el-slider v-model="textSize" placement="right" :min="0" :max="100" show-input size="small" />
        </div>
        <div>
            <label for="strokeColor">描边颜色:</label>
            <!-- <el-input type="color" v-model="strokeColor"  size="small" /> -->
            <el-color-picker v-model="strokeColor" show-alpha />
        </div>
        <div>
            <label for="strokeSize">描边大小:</label>
            <!-- <el-input type="range" v-model="strokeSize" min="0" max="100" value="1" size="small" /> -->
            <el-slider v-model="strokeSize" placement="right" :min="0" :max="100" show-input size="small" />
        </div>
        <div class="button-container">
            <el-button round @click="addLabel()">确定</el-button>
        </div>
    </div>
</template>

<script setup>
import { defineProps, ref, computed } from 'vue'
import { Aim } from '@element-plus/icons-vue'
import { useStore } from "vuex";
import {
    ElMessage,
    ElDrawer,
    ElMessageBox,
    ElNotification
} from "element-plus";

const hover = ref(false); //关闭按钮的hover状态

// label数据
const labelName = ref("Label");
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
const textColor = ref("rgba(255, 255, 255, 1)");
const textSize = ref(10);
const strokeColor = ref("rgba(0, 0, 0, 1)");
const strokeSize = ref(1);


// 引入api
const labelProp = defineProps({
    api: {
        type: Object,
        required: true
    },
    fetchEntityTree: Function,
})

/**
 * 关闭添加label窗口
 */
const closeLabelWindow = (WindowName) => {
    if (WindowName === "labelWindow") {
        document.getElementById("labelWindow").style.display = "none";
    }
}

//鼠标点击定位
const store = useStore();
const location = computed(() => store.state.location);
const isAim = ref(false);

const AimPosition = () => {
    ElMessage("请在三维系统中点击获取位置.");
    isAim.value = true;

    labelProp.api.onEvent(e => {
        if (e.type === 'LeftMouseClick' && isAim.value) { // 纯鼠标事件反馈，告知系统鼠标左右键是否被点击，不携带额外信息，默认开启
            console.log("添加poi鼠标左键点击地图获取位置", location.value)
            longitude.value = location.value[0];
            latitude.value = location.value[1];
            elevation.value = location.value[2];
            isAim.value = false;
            ElMessage({
                message: "已拾取位置",
                type: "success"
            });
        }
    })
}


const convertToLabelFormat = () => {
    return {
        name: labelName.value,
        data: {
            location: [longitude.value, latitude.value, elevation.value]
        },
        style: {
            text: labelText.value,
            anchor: [anchorX.value, anchorY.value],
            offset: [offsetX.value, offsetY.value],
            range: [minRange.value, maxRange.value],
            textStyle: {
                fontSize: textSize.value,
                color: textColor.value,
                textStrokeColor: strokeColor.value,
                strokeSize: strokeSize.value
            }
        },
        type: "Label"
    };
}



/**
 * 添加labal方法
 */
const addLabel = () => {
    const labelData = convertToLabelFormat();
    console.log("labelData", labelData);

    labelProp.api.graphic
        .add(labelData)
        .then(res => {
            console.log("成功添加", res, res.data.id);
            labelProp.fetchEntityTree();
            ElMessage({
                message: "添加成功",
                type: "success"
            });
        })
        .catch(error => {
            console.log("error", error, error.code);
            ElMessage.error("添加失败")
        });
    //参数设置，待修改完善
    // labelProp.api.graphic
    //     .add({
    //         name: Name,
    //         data: {
    //             location: [114.02791996306978, 22.549801373467076, 50]
    //         },
    //         style: {
    //             text: Text,
    //             anchor: [0.5, 1],
    //             offset: [0, 0],
    //             range: [0, 999999999],
    //             textStyle: {
    //                 fontSize: 10,
    //                 textStrokeColor: "rgb(0, 0, 0)",
    //                 color: "rgb(255, 255, 255)"
    //             }
    //         },
    //         userData: "Label userData",
    //         type: "Label"
    //     })
    //     .then(res => {
    //         console.log("成功添加", res, res.data.id);
    //         var addLayer = {
    //             id: res.data.id,
    //             name: Name
    //         };
    //         console.log("addLayer111", addLayer, addLayer.name);
    //         addLayerToLayerControl(addLayer);
    //     })
    //     .catch(error => {
    //         console.log("error", error, error.code);
    //     });
}


</script>

<style scoped></style>