<template>
    <!-- 添加构力bim模型窗口 -->
    <div class="add-layer" id="add-bim-window" style="display: none;">
        <h2 style="text-align: center;">添加构力BIM模型</h2>
        <el-input v-model="BimnameInput" id="dataset-name" placeholder="输入图层名称" clearable />
        <el-input v-model="clientId" placeholder="输入clientId" clearable style="margin-top:5px" />
        <el-input v-model="clientSecret" placeholder="输入clientSecret" clearable style="margin-top:5px" />
        <el-input v-model="BimModelUrn" placeholder="输入BimModelUrn" clearable style="margin-top:5px" />
        <!-- <div style="display: flex; justify-content: space-between; align-items: center;">
            <h3 style="text-align: center;">Headers</h3>
            <el-button circle @click="addHeader" style="margin-top:5px" :icon="Plus" size="small"></el-button>
        </div>
        <div v-for="(header, index) in Bimheaders" :key="index" style="display: flex; justify-content: space-between;">
            <el-input v-model="Bimheaders.key" placeholder="键" clearable />
            <el-input v-model="Bimheaders.value" placeholder="值" clearable />
            <el-button circle @click="deleteHeader(index)" style="margin-top:5px" :icon="Delete"
                size="small"></el-button>
        </div> -->

        <div class="button-container" style="display: flex; justify-content: center;">
            <el-button round @click="addBim(BimnameInput)" style="margin-top:5px">确定</el-button>
        </div>
    </div>
</template>

<script setup>
import { defineProps, ref } from 'vue'
import { Delete, Plus } from '@element-plus/icons-vue'
import { ElLoadingDirective, ElMessage } from 'element-plus'
import { useBimStore } from '../../store/bim';
import { storeToRefs } from 'pinia';
import axios from 'axios'


// 引入api
const tilesProp = defineProps({
    api: {
        type: Object,
        required: true
    },
    fetchEntityTree: Function,
})

const Bimstore = useBimStore()
const { clientId, clientSecret, GlBimUrl, BeareraccessToken,accesstoken} = storeToRefs(Bimstore)
const { GetToken, startTokenRefreshInterval } = Bimstore



//用户输入的数据
// const Bimheaders = ref([])
const BimnameInput = ref("");
const BimModelUrn = ref("");


// const accesstoken = ref("")


// 获取BeareraccessToken
// const GetToken = async () => {
//     const Gettokenurl = "https://api.cloud.pkpm.cn/bimserver/auth/oauth/token"

//     const GettokenBody = {
//         "grant_type": "client_credentials",
//         "client_id": clientId.value,
//         "client_secret": clientSecret.value
//     };

//     try {
//         const GettokenResponse = await axios.post(Gettokenurl,
//             GettokenBody, {
//             headers: {
//                 'Content-Type': 'application/x-www-form-urlencoded'
//             }
//         })
//         ElMessage.success("BeareraccessToken获取成功")
//         console.log("BeareraccessToken获取成功：", GettokenResponse)

//         accesstoken.value = GettokenResponse.data.access_token
//         console.log("accesstoken:", accesstoken.value)

//         // 将获取到的token存储到 Bimstore 中
//         BeareraccessToken.value = "Bearer " + accesstoken.value;
//         Bimstore.BeareraccessToken = BeareraccessToken;


//         console.log("BeareraccessToken:", BeareraccessToken.value)

//     } catch (error) {
//         ElMessage.error("BeareraccessToken获取失败")
//         console.log("BeareraccessToken获取失败：", error)

//     }
// }


// 获取构力模型url
const GetBimUrl = async () => {
    function getAccessToken(callBack) {
        callBack(accesstoken.value, 302400)
    }

    // 创建实例需要传入的参数，部署环境serviceConfig 和 用户有效期getAccessToken
    let applicationOptions = {
        // 配置 OBV 服务端（BIMServer）API 服务的 origin，这个适合于私有部署的用户使用
        getAccessToken: getAccessToken,
        refreshAccessToken: getAccessToken,
        serviceConfig: {
            origin: 'https://api.cloud.pkpm.cn',
            apiContextPath: '/bimserver/viewing/v3',
        },
    };

    // 实例化 Builder，用于模型加载
    const builder = new OBV.Api.ObvBuilder();
    // 创建 Application 对象
    const application = await builder.buildApplication(applicationOptions);
    // 创建 document 管理视图，加载完成后可以调用接口
    const obvDocument = await builder.loadDocument(application, BimModelUrn.value, 'ifc-lod'); //jobType为流式转换任务的任务类型
    // 获取元数据文件
    var manifest = obvDocument._manifest;
    //获取resultkey
    var manifestUrn = manifest.urn;
    var pos = manifestUrn.lastIndexOf("/");
    var resultkey = manifestUrn.substr(pos);
    // 获取数据相对路径
    var viewUrn = manifest.children[1].children[0].children[0].urn; //以元数据文件中描述的第一个视图为例
    pos = viewUrn.indexOf("/");
    var rePath = viewUrn.substr(pos);


    // 字段拼接生成模型url
    var urlHead = "https://api.cloud.pkpm.cn/bimserver/viewing/v3/datas";
    var modelUrl = urlHead + resultkey + rePath;

    if (modelUrl.endsWith('manifest.json')) {
        ElMessage.success('BIM模型url获取成功');
    }

    GlBimUrl.value = modelUrl;
    Bimstore.GlBimUrl = GlBimUrl;
    console.log("模型url:", GlBimUrl.value)
}






// //添加header
// const addHeader = () => {
//     headers.value.push({
//         key: '',
//         value: ''
//     })
// }

// //删除header
// const deleteHeader = (index) => {
//     headers.value.splice(index, 1)
// }

// //将headers数组转换为对象
// const convertHeadersToObject = (headersArray) => {
//     const headersObject = {};
//     headersArray.forEach(header => {
//         headersObject[header.key] = header.value;
//         if (header.key === 'Authorization') {
//             BeareraccessToken.value = header.value
//         }
//     });
//     return headersObject;
// }

/**
 * 添加addBim功能
 * @param {*} name 图层名称
 */
const addBim = async (name) => {
    await GetToken()
    await GetBimUrl()

    // const headersObject = convertHeadersToObject(headers);

    // console.log('addBim', name, url, headersObject)

    tilesProp.api.tileset
        .add({
            //id: '0', //可选
            // pid: '-1',
            name: name,
            //visible: true,
            url: GlBimUrl.value,
            // userData: 'tileset userData',
            headers: {
                Authorization: BeareraccessToken.value
            }
            // headers: headersObject
        })
        .then(res => {
            console.log("成功添加构力bim", res, res.data.id);
            tilesProp.fetchEntityTree();
            ElMessage({
                message: "构力bim模型添加成功",
                type: "success"
            });
            // 更新 Bimstore 中的值
            Bimstore.clientId = clientId;
            Bimstore.clientSecret = clientSecret;
            Bimstore.GlBimUrl = GlBimUrl;
            Bimstore.BeareraccessToken = BeareraccessToken;


            // 将值存储到 localStorage 中（防止刷新页面后数据丢失）
            localStorage.setItem('clientId', clientId.value);
            localStorage.setItem('clientSecret', clientSecret.value);
            localStorage.setItem('GlBimUrl', GlBimUrl.value);
            localStorage.setItem('BeareraccessToken', BeareraccessToken.value);


            // 如果成功获取到BeareraccessToken，则启动定时器
            if (BeareraccessToken.value) {
                startTokenRefreshInterval();
            }
        })
        .catch(error => {
            console.log("error", error, error.code, error.message);
            ElMessage.error("构力bim模型添加失败")
        });
};




</script>

<style scoped></style>
