
 <!--
 * @FileDescription: 该文件为页面右侧的控件实现，以及其开启关闭方法
 * @LastEditTime: 1.17
 -->
<template>
    <div class="view-right">
        <i class="iconfont icon-mianji icon-right" @click="areaIconClick" @contextmenu.prevent="stopMeasure" title="测面积" />
        <i class="iconfont icon-celiang icon-right" @click="sanjiaoIconClick" @contextmenu.prevent="stopMeasure"
            title="测距离" />
        <i class="icon-right" @click="selectAreaStart" @contextmenu.prevent="selectAreaEnd"><el-icon>
                <CirclePlus />
            </el-icon></i>
    </div>
</template>

<script setup lang="ts">
import {
    CirclePlus,
} from "@element-plus/icons-vue";
import { ElMessage, ElNotification } from "element-plus";

// 使用 defineProps 定义接收的父组件的方法作为 props
const props = defineProps({
    api: {
        type: Object,
        required: true
    },
});

// 开启面积测量---------------------------------
const areaIconClick = () => {
    ElMessage(
        "面积测量开启：连续点击鼠标左键确定测量范围，右键结束测量多边形的绘制"
    );

    props.api.measureHandler
        .start({
            type: 0
        })
        .then(res => {
            console.log("面积测量start", res);
        });
};

// 开启三角测量------------------------------------
const sanjiaoIconClick = () => {
    ElMessage("三角测量开启：鼠标左键确定起点，右键确定终点");
    props.api.measureHandler
        .start({
            type: 1
        })
        .then(res => {
            console.log("三角测量start", res);
        });
};

// ---每次测量后，停止测量-----------------------------
const stopMeasure = () => {
    props.api.measureHandler.stop().then(res => {
        console.log("每次测量后，停止测量stop", res);
        ElMessage(
            "测量已清除关闭，可再次点击图标开启测量"
        );
    });
};

// 点击绘制及信息-----------
const selectAreaStart = () => {
    props.api.drawHandler.start()
    ElMessage("左键单击绘制第一个点，右键结束绘制最后一个点");
}

// 右键结束绘制
const selectAreaEnd = () => {
    props.api.drawHandler.stop()
    ElMessage("绘制已清除关闭，可再次点击图标开启绘制");
}
// 成功信息弹出框提示
const successMsg = (msg) => {
    ElMessage({
    showClose: true,
    message: msg,
    type: 'success',
  })
}

// 暴露子组件方法
defineExpose({
    successMsg,
})


</script>

<style scoped>
.view-right {
    position: fixed;
    width: 40px;
    height: auto;
    right: 1%;
    top: 20%;
    z-index: 14;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.icon-right {
    margin-top: 3px;
    margin-bottom: 20px;
    font-size: 25px;
    color: gainsboro;
    transition: font-size 0.3s ease, color 0.3s ease;
}

.icon-right:hover {
    font-size: 27px;
    color: rgb(67, 159, 255);
}
</style>