<template>
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
</template>

<script setup>
import { defineProps, ref } from 'vue'

// 用户输入的数据
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
// 声明响应式变量
const hover = ref(false); //关闭按钮的hover状态

// 引入api
const labelProp = defineProps({
    api: {
        type: Object,
        required: true
    },
})


/**
 * 添加labal方法
 */
const addLabel = () => {
    console.log(
        document.getElementById("labelName").value,
        document.getElementById("labelText").value
    );
    const Name = document.getElementById("labelName").value;
    const Text = document.getElementById("labelText").value;

    //参数设置，待修改完善
    labelProp.api.graphic
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

/**
 * 关闭添加labal窗口
 */
const closeLabelWindow = (WindowName) => {
    if (WindowName === "labelWindow") {
        document.getElementById("labelWindow").style.display = "none";
    }
}
</script>

<style scoped></style>