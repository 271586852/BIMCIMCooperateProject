<template>
    <!-- ODLine窗口 -->
    <div class="add-layer" id="odlineWindow" style="display: none;">
        <div class="labelbtn">
            <i class="el-icon el-notification__closeBtn" @click="closeODLineWindow('odlineWindow')"
                @mouseover="hover = true" @mouseleave="hover = false">
                <svg data-v-5f73bff2 viewBox="0 0 1024 1024" :class="{ 'hovered': hover }">
                    <path data-v-5f73bff2 fill="currentColor"
                        d="M764.288 214.592 512 466.88 259.712 214.592a31.936 31.936 0 0 0-45.12 45.12L466.752 512 214.528 764.224a31.936 31.936 0 1 0 45.12 45.184L512 557.184l252.288 252.288a31.936 31.936 0 0 0 45.12-45.12L557.12 512.064l252.288-252.352a31.936 31.936 0 1 0-45.12-45.184z" />
                </svg>
            </i>
        </div>
        <h2 style="text-align: center;">添加ODLine</h2>
        <div>
            <label >组件名称:</label>
            <el-input type="text" size="small" v-model="ODLineName" placeholder="输入组件名称" />
        </div>

        <div style="display: flex; justify-content: space-between;">
            <label for="longitude">起点:</label>
            <el-button type="primary" :icon="Aim" circle color="rgb(0,0,0)" @click="AimPositionO" />
        </div>
        <div style="display: flex; justify-content: space-between;">
            <el-input type="number"  v-model="longitudeO" step="0.000001" placeholder="输入经度" />
            <el-input type="number"  v-model="latitudeO" step="0.000001" placeholder="输入纬度" />
            <el-input type="number" v-model="elevationO" step="0.01" placeholder="输入高程"  />
        </div>
        <div style="display: flex; justify-content: space-between;">
            <label for="longitude">终点:</label>
            <el-button type="primary" :icon="Aim" circle color="rgb(0,0,0)" @click="AimPositionD" />
        </div>
        <div style="display: flex; justify-content: space-between;">
            <el-input type="number"  v-model="longitudeD" step="0.000001" placeholder="输入经度" />
            <el-input type="number"  v-model="latitudeD" step="0.000001" placeholder="输入纬度" />
            <el-input type="number" v-model="elevationD" step="0.01" placeholder="输入高程"  />
        </div>
        <div>
            <label>曲率:</label>
            <el-input type="number" v-model="curve" step="0.01" placeholder="为0则为直线,曲率curv推荐取值范围[0-3]"  />
        </div>
        <div class="button-container">
            <el-button round @click="addODLine()">确定</el-button>
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

// ODLine数据
const ODLineName = ref("ODLine");
const longitudeO = ref(null);
const latitudeO = ref(null);
const elevationO = ref(null);
const longitudeD = ref(null);
const latitudeD = ref(null);
const elevationD = ref(null);
const curve = ref(1);




// 引入api
const ODLineProp = defineProps({
    api: {
        type: Object,
        required: true
    },
    fetchEntityTree: Function,
})


/**
 * 关闭添加odline窗口
 */
const closeODLineWindow = (WindowName) => {
    if (WindowName === "odlineWindow") {
        document.getElementById("odlineWindow").style.display = "none";
    }
}

//鼠标点击定位
const store = useStore();
const location = computed(() => store.state.location);
const isOAim = ref(false);
const isDAim = ref(false);

const AimPositionO = () => {
    ElMessage("请在三维系统中点击获取位置.");
    isOAim.value = true;
    ODLineProp.api.onEvent(e => {
        if (e.type === 'LeftMouseClick' && isOAim.value) { // 纯鼠标事件反馈，告知系统鼠标左右键是否被点击，不携带额外信息，默认开启
            console.log("添加odline鼠标左键点击地图获取起点位置", location.value)
            longitudeO.value = location.value[0];
            latitudeO.value = location.value[1];
            elevationO.value = location.value[2];
            isOAim.value = false;
            ElMessage({
                message: "已拾取位置",
                type: "success"
            });
        }
    })
}

const AimPositionD = () => {
    ElMessage("请在三维系统中点击获取位置.");
    isDAim.value = true;
    ODLineProp.api.onEvent(e => {
        if (e.type === 'LeftMouseClick' && isDAim.value) { // 纯鼠标事件反馈，告知系统鼠标左右键是否被点击，不携带额外信息，默认开启
            console.log("添加odline鼠标左键点击地图获取终点位置", location.value)
            longitudeD.value = location.value[0];
            latitudeD.value = location.value[1];
            elevationD.value = location.value[2];
            isDAim.value = false;
            ElMessage({
                message: "已拾取位置",
                type: "success"
            });
        }
    })
}

const convertToODLineFormat = () => {
    return {
        name: ODLineName.value,
        data: {
            start: [longitudeO.value, latitudeO.value, elevationO.value],
            end: [longitudeD.value, latitudeD.value, elevationD.value]
        },
        style: {
            curve: curve.value
        },
        type: "ODLine"
    };
}

/**
 * 添加ODLine
 */
const addODLine = () => {
    const odline = convertToODLineFormat();
    console.log("添加ODLine", odline);
    ODLineProp.api.graphic.add(odline).then(res => {
        console.log("成功添加", res, res.data.id);
        ODLineProp.fetchEntityTree();
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