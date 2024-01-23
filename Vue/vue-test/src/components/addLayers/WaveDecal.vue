<template>
    <!-- WaveDecal窗口 -->
    <div class="add-layer" id="WaveDecalWindow" style="display: none;">
        <div class="labelbtn">
            <i class="el-icon el-notification__closeBtn" @click="closeWaveDecalWindow('WaveDecalWindow')"
                @mouseover="hover = true" @mouseleave="hover = false">
                <svg data-v-5f73bff2 viewBox="0 0 1024 1024" :class="{ 'hovered': hover }">
                    <path data-v-5f73bff2 fill="currentColor"
                        d="M764.288 214.592 512 466.88 259.712 214.592a31.936 31.936 0 0 0-45.12 45.12L466.752 512 214.528 764.224a31.936 31.936 0 1 0 45.12 45.184L512 557.184l252.288 252.288a31.936 31.936 0 0 0 45.12-45.12L557.12 512.064l252.288-252.352a31.936 31.936 0 1 0-45.12-45.184z" />
                </svg>
            </i>
        </div>
        <h2 style="text-align: center;">添加WaveDecal</h2>
        <div>
            <label for="labelName">组件名称:</label>
            <el-input type="text"  v-model="WaveDecalName" placeholder="输入组件名称" />
        </div>

        <div style="display: flex; justify-content: space-between;">
            <label for="longitude">位置:</label>
            <el-button type="primary" :icon="Aim" circle color="rgb(0,0,0)" @click="AimPosition" />
        </div>
        <div style="display: flex; justify-content: space-between;">
            <el-input type="number"  v-model="longitude" step="0.000001" placeholder="输入经度" />
            <el-input type="number"  v-model="latitude" step="0.000001" placeholder="输入纬度" />
        </div>
        <div>
            <label for="radius">波动半径:</label>
            <el-input type="number" v-model="radius" step="1"  placeholder="输入波动半径"/>
        </div>
        <div class="button-container">
            <el-button round @click="addWaveDecal()">确定</el-button>
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
const WaveDecalName = ref("WaveDecal");
const longitude = ref(null);
const latitude = ref(null);
const radius = ref(1200);




// 引入api
const WaveDecalProp = defineProps({
    api: {
        type: Object,
        required: true
    },
})


/**
 * 关闭添加WaveDecal窗口
 */
const closeWaveDecalWindow = (WindowName) => {
    if (WindowName === "WaveDecalWindow") {
        document.getElementById("WaveDecalWindow").style.display = "none";
    }
}

//鼠标点击定位
const store = useStore();
const location = computed(() => store.state.location);
const isAim = ref(false);

const AimPosition = () => {
    ElMessage("请在三维系统中点击获取位置.");
    isAim.value = true;
    WaveDecalProp.api.onEvent(e => {
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

const convertToWaveDecalFormat = () => {
    return {
        name: WaveDecalName.value,
        data: {
            location: [longitude.value, latitude.value]
        },
        style: {
            radius: radius.value,
        },
        type: "WaveDecal"
    };
}

/**
 * 添加Marker
 */
const addWaveDecal = () => {
    const wavedecal = convertToWaveDecalFormat();
    console.log("添加WaveDecal", wavedecal);
    WaveDecalProp.api.graphic.add(wavedecal).then(res => {
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