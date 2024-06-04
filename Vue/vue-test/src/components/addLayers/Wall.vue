<template>
    <!-- Wall窗口 -->
    <div class="add-layer" id="wallWindow" style="display: none;max-height: 80vh;overflow: auto">
        <div class="labelbtn">
            <i class="el-icon el-notification__closeBtn" @click="closeWallWindow('wallWindow')"
                @mouseover="hover = true" @mouseleave="hover = false">
                <svg data-v-5f73bff2 viewBox="0 0 1024 1024" :class="{ 'hovered': hover }">
                    <path data-v-5f73bff2 fill="currentColor"
                        d="M764.288 214.592 512 466.88 259.712 214.592a31.936 31.936 0 0 0-45.12 45.12L466.752 512 214.528 764.224a31.936 31.936 0 1 0 45.12 45.184L512 557.184l252.288 252.288a31.936 31.936 0 0 0 45.12-45.12L557.12 512.064l252.288-252.352a31.936 31.936 0 1 0-45.12-45.184z" />
                </svg>
            </i>
        </div>
        <h2 style="text-align: center;">添加Wall</h2>
        <div>
            <label>组件名称:</label>
            <el-input type="text" v-model="WallName" placeholder="输入组件名称" />
        </div>
        <div>
            <label>geojson:</label>
            <el-button @click="OpenFile">选择文件</el-button>
            <el-input type="textarea" :autosize="{ minRows: 5, maxRows: 12 }" v-model="geojson"
                placeholder="请输入geojson或者输入geojson的线上地址" />
        </div>
        <div>
            <label>海拔:</label>
            <el-input type="number" v-model="elevation" step="1" placeholder="围墙下边界对应的海拔" />
        </div>
        <div>
            <label>高度:</label>
            <el-input type="number" v-model="height" step="0.1" placeholder="围墙高度" />
        </div>
        <div>
            <label>颜色:</label>
            <el-color-picker v-model="color" show-alpha />
        </div>
        <div class="button-container">
            <el-button round @click="addWall()">确定</el-button>
        </div>
    </div>
</template>

<script setup>
import { defineProps, ref, computed } from 'vue'
import { useStore } from "vuex";
import {
    ElMessage,
    ElDrawer,
    ElMessageBox,
    ElNotification
} from "element-plus";

const hover = ref(false); //关闭按钮的hover状态

// wall数据
const WallName = ref("Wall");
const geojson = ref(``);
const height = ref(100);
const elevation = ref(0);
const color = ref('rgba(0, 235, 255, 1)');



// 引入api
const WallProp = defineProps({
    api: {
        type: Object,
        required: true
    },
    fetchEntityTree: Function,
})


/**
 * 关闭添加wall窗口
 */
const closeWallWindow = (WindowName) => {
    if (WindowName === "wallWindow") {
        document.getElementById("wallWindow").style.display = "none";
    }
}

const OpenFile = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json,.geojson';
    fileInput.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                geojson.value = e.target.result;
            };
            reader.readAsText(file);
        }
    };
    fileInput.click();
};

const convertToWallFormat = () => {
    let data;
    try {
        new URL(geojson.value);
        // 如果 geojson.value 是有效的 URL，那么就使用 { url: geojson.value }
        data = { url: geojson.value };
    } catch (_) {
        // 如果 geojson.value 不是有效的 URL，那么就使用 geojson.value
        data = geojson.value;
        // 使用 JSON.parse 将字符串转换为对象
        data = JSON.parse(geojson.value);
    }

    return {
        name: WallName.value,
        data: data,
        style: {
            elevation: elevation.value,
            height: height.value,
            color: color.value,
        },
        type: "Wall"
    };
}

/**
 * 添加wall
 */
const addWall = () => {
    const wall = convertToWallFormat();
    console.log("添加Walls", wall);
    WallProp.api.graphic.add(wall).then(res => {
        console.log("成功添加", res, res.data.id);
        WallProp.fetchEntityTree();
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