<template>
    <!-- 添加3DTiles数据集窗口 -->
    <div class="add-layer" id="add-dataset-window" style="display: none;">
        <h4 style="text-align: center;">添加3DTiles数据集</h4>
        <el-input v-model="input1" id="dataset-name" placeholder="输入图层名称" clearable />
        <el-input v-model="input2" id="dataset-url" placeholder="输入图层URL" clearable style="margin-top:5px" />
        <div class="button-container">
            <el-button round @click="add3DTiles(name, url)" style="margin-top:5px">确定</el-button>
        </div>
    </div>
</template>

<script setup>
import { defineProps, ref } from 'vue'
// import { addLayerToLayerControl } from '../LayerManager.vue'
const tilesProp = defineProps({
    api: {
        type: Object,
        required: true
    },
})

// 3DTile数据集窗口-------
const LayerNameInput = ref("");
const URLInput = ref("");

const name = 'test'
const url = 'https://cloud.dev.pkpm.cn/bimserver/viewing/v3/datas/234lfT3Ld2kA3H3rvX4TaM8j/axis.json'

/**
 * 添加add3DTiles功能
 * @param {*} name 图层名称
 * @param {*} url 图层url
 */
const add3DTiles = (name, url) => {
    //console.log('add3DTiles6666666666', name, url)
    tilesProp.api.tileset
        .add({
            //id: '0', //可选
            // pid: '-1',
            name: name,
            //visible: true,
            url: url,
            // userData: 'tileset userData',
            headers: {
                Authorization: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJvYnY6d3JpdGUiLCJvYnY6cmVhZCJdLCJleHAiOjE3MDU3ODQzNzAsImp0aSI6IjE5NWRjYjE5LTYzMmUtNGM0Ni1iMzZiLTdiNzVhOTUzMmQyMSIsImNsaWVudF9pZCI6IjI5dFRXZDNLTDFWbTNRYVB4TDRQQkxFRyJ9.MzMKTKt2bgFynRHiJ6epDORT5rhNiqbI8974tBPubhx1_xxV7YOhx7V4TYGeMJ862TS_BA-G5qHY7dnTzv0F1pdOBE5Spq5ZjYwc2EsGvcMaGicy4s7cSufhntwvrNDyzxYPXqFWmFkyroTSAUEmABgdKIxB3Rf4IUTFDHm43wDyELecy0mLltAcI4KWZnInnS5OWm3LhrSzjtE3SPhLIbeCNTM4zC7pdV8z-iN-VnzIEcrW8GeUBKTfvi3YYwoEbIQ_vH4mm9D0jAd0cuXWmTI175QfkohoT_BD0jI5vo_U92Gi74A2476Tr70MMU4KRFi1tEmCece4skE1yG6ZyA'
            }
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

</script>

<style scoped></style>
