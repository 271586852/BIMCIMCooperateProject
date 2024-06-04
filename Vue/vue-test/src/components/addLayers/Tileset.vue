<template>
    <!-- 添加3DTiles数据集窗口 -->
    <div class="add-layer" id="add-dataset-window" style="display: none;">
        <h2 style="text-align: center;">添加3DTiles数据集</h2>
        <el-input v-model="LayerNameInput" id="dataset-name" placeholder="输入图层名称" clearable />
        <el-input v-model="TileUrl" id="dataset-url" placeholder="输入图层URL" clearable style="margin-top:5px" />
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <h3 style="text-align: center;">Headers</h3>
            <el-button circle @click="addHeader" style="margin-top:5px" :icon="Plus" size="small"></el-button>
        </div>
        <div v-for="(header, index) in headers" :key="index" style="display: flex; justify-content: space-between;">
            <el-input v-model="header.key" placeholder="键" clearable />
            <el-input v-model="header.value" placeholder="值" clearable />
            <el-button circle @click="deleteHeader(index)" style="margin-top:5px" :icon="Delete" size="small"></el-button>
        </div>

        <div class="button-container" style="display: flex; justify-content: center;">
            <el-button round @click="add3DTiles(LayerNameInput, TileUrl, headers)" style="margin-top:5px">确定</el-button>
        </div>
    </div>
    <!-- <el-dialog title="添加3DTiles数据集" v-model="TilesetVisible" width="300" draggable >
        <el-scrollbar>
            <el-input v-model="LayerNameInput" id="dataset-name" placeholder="输入图层名称" clearable />
            <el-input v-model="TileUrl" id="dataset-url" placeholder="输入图层URL" clearable style="margin-top:5px" />
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
                <h3 style="margin: 0;">Headers</h3>
                <el-button circle @click="addHeader" style="margin-top:5px" :icon="Plus" size="small"></el-button>
            </div>
            <div v-for="(header, index) in headers" :key="index"
                style="display: flex; justify-content: space-between; margin-top: 10px;">
                <el-input v-model="header.key" placeholder="键" clearable />
                <el-input v-model="header.value" placeholder="值" clearable />
                <el-button circle @click="deleteHeader(index)" style="margin-top:5px" :icon="Delete"
                    size="small"></el-button>
            </div>
            <div class="button-container" style="display: flex; justify-content: center; margin-top: 20px;">
                <el-button round @click="add3DTiles(LayerNameInput, TileUrl, headers)"
                    style="margin-top:5px">确定</el-button>
            </div>
        </el-scrollbar>
    </el-dialog> -->
</template>

<script setup>
import { defineProps, ref, defineExpose } from 'vue'
import { Delete, Plus } from '@element-plus/icons-vue'
import { ElMessage, ElScrollbar } from 'element-plus'
// import { useBimStore } from '../../store/bim';
// import { storeToRefs } from 'pinia';

// 引入api
const tilesProp = defineProps({
    api: {
        type: Object,
        required: true
    },
    fetchEntityTree: Function,
})

const TilesetVisible = ref(false);
defineExpose({
    TilesetVisible
})


//用户输入的数据
const headers = ref([])
const LayerNameInput = ref("");
const TileUrl = ref("");



//添加header
const addHeader = () => {
    headers.value.push({
        key: '',
        value: ''
    })
}

//删除header
const deleteHeader = (index) => {
    headers.value.splice(index, 1)
}

//将headers数组转换为对象
const convertHeadersToObject = (headersArray) => {
    const headersObject = {};
    headersArray.forEach(header => {
        headersObject[header.key] = header.value;
        // if(header.key === 'Authorization') {
        //     BeareraccessToken.value = header.value
        // }
    });
    return headersObject;
}

/**
 * 添加add3DTiles功能
 * @param {*} name 图层名称
 * @param {*} url 图层url
 * @param {*} headers 请求headers
 */
const add3DTiles = (name, url, headers) => {
    const headersObject = convertHeadersToObject(headers);

    console.log('add3DTiles6666666666', name, url, headersObject)

    tilesProp.api.tileset
        .add({
            //id: '0', //可选
            // pid: '-1',
            name: name,
            //visible: true,
            url: url,
            // userData: 'tileset userData',
            // headers: {
            //     Authorization: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJvYnY6d3JpdGUiLCJvYnY6cmVhZCJdLCJleHAiOjE3MDU3ODQzNzAsImp0aSI6IjE5NWRjYjE5LTYzMmUtNGM0Ni1iMzZiLTdiNzVhOTUzMmQyMSIsImNsaWVudF9pZCI6IjI5dFRXZDNLTDFWbTNRYVB4TDRQQkxFRyJ9.MzMKTKt2bgFynRHiJ6epDORT5rhNiqbI8974tBPubhx1_xxV7YOhx7V4TYGeMJ862TS_BA-G5qHY7dnTzv0F1pdOBE5Spq5ZjYwc2EsGvcMaGicy4s7cSufhntwvrNDyzxYPXqFWmFkyroTSAUEmABgdKIxB3Rf4IUTFDHm43wDyELecy0mLltAcI4KWZnInnS5OWm3LhrSzjtE3SPhLIbeCNTM4zC7pdV8z-iN-VnzIEcrW8GeUBKTfvi3YYwoEbIQ_vH4mm9D0jAd0cuXWmTI175QfkohoT_BD0jI5vo_U92Gi74A2476Tr70MMU4KRFi1tEmCece4skE1yG6ZyA'
            // }
            headers: headersObject
        })
        .then(res => {
            console.log("成功添加3dtiles", res, res.data.id);
            tilesProp.fetchEntityTree();
            ElMessage({
                message: "3dtiles添加成功",
                type: "success"
            });

        })
        .catch(error => {
            console.log("error", error, error.code, error.message);
            ElMessage.error("3dtiles添加失败")
        });
};




</script>

<style scoped></style>
