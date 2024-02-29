<template>
    <!-- TextureDecal窗口 -->
    <div class="add-layer" id="TextureDecalWindow" style="display: none;">
        <div class="labelbtn">
            <i class="el-icon el-notification__closeBtn" @click="closeTextureDecalWindow('TextureDecalWindow')"
                @mouseover="hover = true" @mouseleave="hover = false">
                <svg data-v-5f73bff2 viewBox="0 0 1024 1024" :class="{ 'hovered': hover }">
                    <path data-v-5f73bff2 fill="currentColor"
                        d="M764.288 214.592 512 466.88 259.712 214.592a31.936 31.936 0 0 0-45.12 45.12L466.752 512 214.528 764.224a31.936 31.936 0 1 0 45.12 45.184L512 557.184l252.288 252.288a31.936 31.936 0 0 0 45.12-45.12L557.12 512.064l252.288-252.352a31.936 31.936 0 1 0-45.12-45.184z" />
                </svg>
            </i>
        </div>
        <h2 style="text-align: center;">添加TextureDecal</h2>
        <div>
            <label>组件名称:</label>
            <el-input type="text" v-model="TextureDecalName" placeholder="输入组件名称" />
        </div>
        <div>
            <label>贴图:</label>
            <el-upload ref="uploadRef" action="" :http-request="uploadFile" :show-file-list="false"
                :on-success="handleSuccess" :on-error="handleError" style="border: none; display: block;">
                <el-button slot="trigger" size="small" type="primary" v-if="!imgUrl">点击上传</el-button>
            </el-upload>
            <div class="el-upload__tip"
                style="width: 100%; height: 200px; overflow: hidden; border: 1px solid gray; border-radius: 5px; margin-top: 10px; display: flex; align-items: center; justify-content: center;">
                <img :src="imgUrl" style="max-width: 100%; max-height: 100%; height: auto; width: auto; display: block; margin: auto;" />
            </div>
            <div v-if="imgUrl" style="display: flex; justify-content: space-between; margin-top: 10px;">
                <el-button size="small" type="danger" @click="deleteImage">删除图片</el-button>
                <el-button size="small" type="primary" @click="reupload">重新上传</el-button>
            </div>
            <input type="file" ref="fileInput" @change="handleFileChange" style="display: none;" />
        </div>
         <el-input type="textarea"  :autosize="{ minRows: 5, maxRows: 7 }" v-model="imgUrl"  placeholder="请输入图片的base64编码或者输入图片的线上地址" />
        <div style="display: flex; justify-content: space-between;">
            <label for="longitude">图片左下角对应的经纬度:</label>
            <el-button type="primary" :icon="Aim" circle color="rgb(0,0,0)" @click="AimPositionO" />
        </div>
        <div style="display: flex; justify-content: space-between;">
            <el-input type="number" v-model="longitude1" step="0.000001" placeholder="输入经度" />
            <el-input type="number" v-model="latitude1" step="0.000001" placeholder="输入纬度" />
        </div>
        <div style="display: flex; justify-content: space-between;">
            <label for="longitude">图片右上角对应的经纬度:</label>
            <el-button type="primary" :icon="Aim" circle color="rgb(0,0,0)" @click="AimPositionD" />
        </div>
        <div style="display: flex; justify-content: space-between;">
            <el-input type="number" v-model="longitude2" step="0.000001" placeholder="输入经度" />
            <el-input type="number" v-model="latitude2" step="0.000001" placeholder="输入纬度" />
        </div>
        <div>
            <label>贴图角度:</label>
            <el-input type="number" v-model="angle" step="0.001" />
        </div>
        <div class="button-container">
            <el-button round @click="addTextureDecal()">确定</el-button>
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
import { Aim } from '@element-plus/icons-vue'


const hover = ref(false); //关闭按钮的hover状态

// TextureDecal数据
const TextureDecalName = ref("TextureDecal");
const imgUrl = ref('');
const longitude1 = ref(null);
const latitude1 = ref(null);
const longitude2 = ref(null);
const latitude2 = ref(null);
const angle = ref(0);



// 引入api
const TextureDecalProp = defineProps({
    api: {
        type: Object,
        required: true
    },
})

//鼠标点击定位
const store = useStore();
const location = computed(() => store.state.location);
const isOAim = ref(false);
const isDAim = ref(false);

const AimPositionO = () => {
    ElMessage("请在三维系统中点击获取位置.");
    isOAim.value = true;
    TextureDecalProp.api.onEvent(e => {
        if (e.type === 'LeftMouseClick' && isOAim.value) { // 纯鼠标事件反馈，告知系统鼠标左右键是否被点击，不携带额外信息，默认开启
            console.log("添加texturedecal鼠标左键点击地图获取起点位置", location.value)
            longitude1.value = location.value[0];
            latitude1.value = location.value[1];
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
    TextureDecalProp.api.onEvent(e => {
        if (e.type === 'LeftMouseClick' && isDAim.value) { // 纯鼠标事件反馈，告知系统鼠标左右键是否被点击，不携带额外信息，默认开启
            console.log("添加texturedecal鼠标左键点击地图获取终点位置", location.value)
            longitude2.value = location.value[0];
            latitude2.value = location.value[1];
            isDAim.value = false;
            ElMessage({
                message: "已拾取位置",
                type: "success"
            });
        }
    })
}






/**
 * 关闭添加TextureDecal窗口
 */
const closeTextureDecalWindow = (WindowName) => {
    if (WindowName === "TextureDecalWindow") {
        document.getElementById("TextureDecalWindow").style.display = "none";
    }
}


// 图片操作
const uploadFile = (uploadingFile) => {
    const file = uploadingFile.file;
    if (!file.type.startsWith('image/')) {
        ElMessage({
            message: "图片格式错误",
            type: "error"
        });
        return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
        imgUrl.value = e.target.result;
    };
    reader.readAsDataURL(file);
};

const handleSuccess = () => {
    ElMessage({
        message: "上传成功",
        type: "success"
    });
};

const handleError = () => {
    ElMessage({
        message: "上传失败",
        type: "error"
    });
};

const deleteImage = (event) => {
    event.stopPropagation();
    imgUrl.value = '';
};

const fileInput = ref(null);

const reupload = () => {
    imgUrl.value = '';
    fileInput.value.click();
};

const handleFileChange = (event) => {
    const file = event.target.files[0];
    uploadFile({ file });
};


const convertToTextureDecalFormat = () => {
    return {
        name: TextureDecalName.value,
        data: { img: imgUrl.value },
        style: {
            min: [longitude1.value, latitude1.value],
            max: [longitude2.value, latitude2.value],
            angle: angle.value
        },
        type: "TextureDecal"
    };
}

/**
 * 添加texturedecal
 */
const addTextureDecal = () => {
    const texturedecal = convertToTextureDecalFormat();
    console.log("添加TextureDecal", texturedecal);
    TextureDecalProp.api.graphic.add(texturedecal).then(res => {
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