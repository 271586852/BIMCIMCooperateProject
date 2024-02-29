<template>
    <!-- Marker窗口 -->
    <div class="add-layer" id="markerWindow" style="display: none;">
        <div class="labelbtn">
            <i class="el-icon el-notification__closeBtn" @click="closeMarkerWindow('markerWindow')" @mouseover="hover = true"
                @mouseleave="hover = false">
                <svg data-v-5f73bff2 viewBox="0 0 1024 1024" :class="{ 'hovered': hover }">
                    <path data-v-5f73bff2 fill="currentColor"
                        d="M764.288 214.592 512 466.88 259.712 214.592a31.936 31.936 0 0 0-45.12 45.12L466.752 512 214.528 764.224a31.936 31.936 0 1 0 45.12 45.184L512 557.184l252.288 252.288a31.936 31.936 0 0 0 45.12-45.12L557.12 512.064l252.288-252.352a31.936 31.936 0 1 0-45.12-45.184z" />
                </svg>
            </i>
        </div>
        <h2 style="text-align: center;">添加Marker</h2>
        <div>
            <label >组件名称:</label>
            <el-input type="text" size="small" v-model="MarkerName" placeholder="输入组件名称" />
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
            <label for="labelText">svg代码:</label>
            <el-input type="textarea" :autosize="{ minRows: 5, maxRows: 12 }" v-model="svgCode" placeholder="输入svg代码"
                size="small" />
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
        <label>图片尺寸:</label>
        <div style="display: flex; justify-content: space-between;">
            <el-input type="number" size="small" v-model="imageSizeX" step="0.01" placeholder="图片长度" />
            <el-input type="number" size="small" v-model="imageSizeY" step="0.01" placeholder="图片宽度" />
        </div>
        <div class="button-container">
            <el-button round @click="addMarker()">确定</el-button>
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

// Marker数据
const MarkerName = ref("Marker");
const longitude = ref(null);
const latitude = ref(null);
const elevation = ref(null);
const svgCode = ref(`<svg width="20" height="26" viewBox="0 -2 20 30" xmlns="http://www.w3.org/2000/svg">
    <path stroke="#2c2c2c50" d="M8.97229 25.4754C1.40469 14.7789 0 13.6811 0 9.75C0 4.36521 4.47714 0 10 0C15.5229 0 20 4.36521 20 9.75C20 13.6811 18.5953 14.7789 11.0277 25.4754C10.5311 26.1749 9.46885 26.1748 8.97229 25.4754Z" fill="#00FF00" />
    <circle stroke="#2c2c2c50" cx="10" cy="10" r="7" fill="#ffffff" />
</svg>`);
const anchorX = ref(0.5);
const anchorY = ref(1);
const offsetX = ref(0);
const offsetY = ref(0);
const minRange = ref(0);
const maxRange = ref(30000);
const imageSizeX = ref(40);
const imageSizeY = ref(52);


// 引入api
const MarkerProp = defineProps({
    api: {
        type: Object,
        required: true
    },
})


/**
 * 关闭添加marker窗口
 */
const closeMarkerWindow = (WindowName) => {
    if (WindowName === "markerWindow") {
        document.getElementById("markerWindow").style.display = "none";
    }
}

//鼠标点击定位
const store = useStore();
const location = computed(() => store.state.location);
const isAim = ref(false);

const AimPosition = () => {
    ElMessage("请在三维系统中点击获取位置.");
    isAim.value = true;
    MarkerProp.api.onEvent(e => {
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

const convertToMarkerFormat = () => {
    return {
        name: MarkerName.value,
        data: {
            location: [longitude.value, latitude.value, elevation.value]
        },
        style: {
            icon: svgCode.value,
            anchor: [anchorX.value, anchorY.value],
            offset: [offsetX.value, offsetY.value],
            range: [minRange.value, maxRange.value],
            imageSize: [imageSizeX.value, imageSizeY.value],
        },
        type: "Marker"
    };
}

/**
 * 添加Marker
 */
const addMarker = () => {
    const marker = convertToMarkerFormat();
    console.log("添加Marker", marker);
    MarkerProp.api.graphic.add(marker).then(res => {
        console.log("成功添加", res, res.data.id);
        ElMessage({
            message: "添加成功",
            type: "success"
        });
    }).catch(error => {
        console.log("error", error, error.code, error.message);
        ElMessage.error("添加失败")
    });
}



</script>




<style scoped></style>