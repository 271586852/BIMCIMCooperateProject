<template>
    <el-dialog v-model="uploadDivVisible" title="解读 Tif 顶点数据 " width="400" draggable :modal="false" id="container"
        :close-on-click-modal="false" style="border: 2px solid #606266;" modal-class="dialog_class">
        <el-upload class="upload-demo" ref="upload" action="http://localhost/tif/upload" :on-remove="handleRemove"
            :on-change="handleChange" :file-list="fileList" :auto-upload="false" multiple>
            <template #trigger>
                <el-button type="primary">选取文件</el-button>
            </template>
            <el-button style="margin-left: 10px;" type="success" @click="submitUpload">上传到服务器</el-button>
            <div class="el-upload__tip">只能上传tif文件</div>
            <!-- <el-button @click="GetFunction">Get</el-button> -->
        </el-upload>
        <template #footer>
            <div class="upload-demo">
                <el-button @click="btnFunction" id="elbtn-tif"
                    title="通过页面中的已绘制区域的最大外接矩形解求对应tif的信息，会返回一个顶点信息txt下载地址">获取Bbox的 tif 信息</el-button>
                <!-- <p class="newp">(通过页面中的已绘制区域的最大外接矩形解求对应tif的信息，会返回一个顶点信息txt下载地址)</p> -->
            </div>
        </template>
    </el-dialog>
</template>

<script setup>
import { ref, computed, watch, inject } from 'vue';
import axios from 'axios';
import { ElMessage } from 'element-plus';
import { useStore } from "vuex";

const store = useStore();

// 仓库数据
// const uploadDivVisible = computed(() => store.state.UploadDivVisible); // 上传tif
const uploadDivVisible = ref(false)

// 将 Vuex 中的 JSONData 映射到本地响应式数据，并进行序列化
const jsonData = computed(() => store.state.JSONData);

// 改变窗口显示与隐藏
const uploadDivVisibleFunction = () => {
    uploadDivVisible.value = !uploadDivVisible.value;
};

let data

// 监听 jsonData 的变化
watch(jsonData, (newData, oldData) => {
    console.log('JSONData 发生变化');
    console.log('新数据：', newData);
    console.log('旧数据：', oldData);

    data = {
        "x1": newData[0],
        "y1": newData[1],
        "x2": newData[2],
        "y2": newData[3]
    }
    console.log('数据数据数据', data);
});

// 将 JavaScript 对象序列化为 JSON 字符串
// const jsonCoordinates = JSON.stringify(JSONData.value);
// 发送 POST 请求，将 JSON 数据传递给后端
const btnFunction = () => {
    // 设置 Axios 的基础URL
    axios.defaults.baseURL = 'http://localhost:80';
    const headerConfig = {
        headers: {
            'Content-Type': 'application/json'
        }
    }

    // const data = {
    //     "x1": 113.93515161,
    //     "y1": 22.5384827,
    //     "x2": 113.9366177,
    //     "y2": 22.53871508
    // }
    // const data = {
    //     "x1": 113.92989,
    //     "y1": 22.5361780,
    //     "x2": 113.934197,
    //     "y2": 22.540985
    // }


    axios.post('/tinterrain/dem2tintiles', data, headerConfig)
        .then(response => {
            // 处理后端响应
            if (response.data.code === 1) {
                // 请求成功
                const coordinateFileName = response.data.data;
                console.log('坐标文件名:', coordinateFileName);

                // 这里可以根据坐标文件名执行进一步操作，例如下载文件
                if (coordinateFileName !== '') {
                    const downLoadUrl = 'http://localhost:80/tinterrain/download/' + coordinateFileName
                    window.open(downLoadUrl, "download")
                }
            } else {
                // 请求不成功，处理错误信息
                const errorMsg = response.data.msg;
                console.error('请求不成功:', errorMsg);
            }
        })
        .catch(error => {
            // 处理错误
            console.error(error);
        });
}


const GetFunction = () => {
    // 设置 Axios 的基础URL
    axios.defaults.baseURL = 'http://localhost:80';
    axios.get('/tinterrain/download/{fileName}')
        .then(response => {
            // 处理后端响应
            if (response.data.code === 1) {
                // 请求成功
                const coordinateFileName = response.data.data;
                console.log('坐标文件名:', coordinateFileName);

                // 这里可以根据坐标文件名执行进一步操作，例如下载文件
            } else {
                // 请求不成功，处理错误信息
                const errorMsg = response.data.msg;
                console.error('请求不成功:', errorMsg);
            }
        })
        .catch(error => {
            // 处理错误
            console.error(error);
        });
}


// 文件列表
const fileList = ref([]);
// const uploadDivVisible =ref(false)

// 提交上传
const submitUpload = () => {
    if (fileList.value.length === 0) {
        ElMessage.error('没有文件可上传');
        return;
    }

    const formData = new FormData();
    let allFilesAreTif = true;
    fileList.value.forEach((file) => {
        const suffix = file.name.split('.').pop().toLowerCase();
        if (suffix !== "tif") {
            ElMessage.error(`只能上传tif文件，不能上传${suffix}文件`);
            allFilesAreTif = false;
            return;
        }
        formData.append('files', file.raw);
    });

    if (!allFilesAreTif) {
        return;
    }
    axios.defaults.baseURL = "http://localhost:80"
    axios.post("/tif/upload", formData)
        .then(response => {
            console.log('状态：', response.data.code);
            if (response.data.code === 1) {
                ElMessage.success("文件处理成功");
                fileList.value = []; // 清空文件列表
            } else {
                ElMessage.error('文件处理失败');
            }
        })
        .catch(error => {
            console.error(error);
            ElMessage.error('上传过程中发生错误');
        });
};

// 处理文件添加或移除
const handleRemove = (file, files) => {
    fileList.value = files;
};

// 处理文件列表变化
const handleChange = (file, files) => {
    fileList.value = files;
};

// 暴露给父组件的方法
defineExpose({
    uploadDivVisibleFunction,
})

</script>

<style scoped>
.Z-top {
    z-index: 9999;
}

.white-bg {
    background-color: #f9f9f9;
}

#container {
    position: absolute;
    width: 400px;
    height: 600px;
    top: 160px;
    left: 140px;
    border: 2px solid #909399;
    border-radius: 10px;
    padding: 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
}

/* .upload-demo {
    margin: 20px;
} */

#elbtn-tif {
    margin-top: 40px;
}

.newp {
    margin: 0;
    color: #909399;
    font-size: 13px;
}
.dialog_class {
    pointer-events: none;
}

.el-dialog {
    pointer-events: auto;
}
</style>