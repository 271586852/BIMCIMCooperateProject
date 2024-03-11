<template>
    <!-- GeometryDecal窗口 -->
    <div class="add-layer" id="GeometryDecalWindow" style="display: none;">
        <div class="labelbtn">
            <i class="el-icon el-notification__closeBtn" @click="closeGeometryDecalWindow('GeometryDecalWindow')"
                @mouseover="hover = true" @mouseleave="hover = false">
                <svg data-v-5f73bff2 viewBox="0 0 1024 1024" :class="{ 'hovered': hover }">
                    <path data-v-5f73bff2 fill="currentColor"
                        d="M764.288 214.592 512 466.88 259.712 214.592a31.936 31.936 0 0 0-45.12 45.12L466.752 512 214.528 764.224a31.936 31.936 0 1 0 45.12 45.184L512 557.184l252.288 252.288a31.936 31.936 0 0 0 45.12-45.12L557.12 512.064l252.288-252.352a31.936 31.936 0 1 0-45.12-45.184z" />
                </svg>
            </i>
        </div>
        <h2 style="text-align: center;">添加GeometryDecal</h2>
        <div>
            <label>组件名称:</label>
            <el-input type="text" v-model="GeometryDecalName" placeholder="输入组件名称" />
        </div>
        <div>
            <label>geojson:</label>
            <el-button @click="OpenFile">选择文件</el-button>
            <el-input type="textarea" :autosize="{ minRows: 5, maxRows: 12 }" v-model="geojson"
                placeholder="请输入geojson或者输入geojson的线上地址" />
        </div>
        <div>
            <label>填充颜色:</label>
            <el-color-picker v-model="fillcolor" show-alpha />
        </div>
        <div>
            <label>边界线宽度:</label>
            <el-input type="number" v-model="outlinewidth" step="0.1" />
        </div>
        <div>
            <label>边界线颜色:</label>
            <el-color-picker v-model="outlinecolor" show-alpha />
        </div>
        <div class="button-container">
            <el-button round @click="addGeometryDecal()">确定</el-button>
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

// GeometryDecal数据
const GeometryDecalName = ref("GeometryDecal");
const geojson = ref(``);
const outlinewidth = ref(10);
const fillcolor = ref('rgba(255, 0, 0, 1)');
const outlinecolor = ref('rgba(255, 255, 255, 1)');



// 引入api
const GeometryDecalProp = defineProps({
    api: {
        type: Object,
        required: true
    },
    fetchEntityTree: Function,
})


/**
 * 关闭添加GeometryDecal窗口
 */
const closeGeometryDecalWindow = (WindowName) => {
    if (WindowName === "GeometryDecalWindow") {
        document.getElementById("GeometryDecalWindow").style.display = "none";
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

const convertToGeometryDecalFormat = () => {
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
        name: GeometryDecalName.value,
        data: data,
        style: {
            fillColor: fillcolor.value,
            outlineWidth: outlinewidth.value,
            outlineColor: outlinecolor.value,
        },
        type: "GeometryDecal"
    };
}

/**
 * 添加wall
 */
const addGeometryDecal = () => {
    const geodecal = convertToGeometryDecalFormat();
    console.log("添加GeometryDecal", geodecal);
    GeometryDecalProp.api.graphic.add(geodecal).then(res => {
        console.log("成功添加", res, res.data.id);
        GeometryDecalProp.fetchEntityTree();
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