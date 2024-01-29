<template>
    <!-- 功能按钮 -->
    <el-row class="button-container" v-show="isBim">
        <el-button class="button-item" type="primary" size="large" round @click="OpenAttrWindow">显示构件属性</el-button>
        <el-button class="button-item" type="primary" size="large" round @click="OpenQueryAttrWindow">查询构件属性</el-button>
        <el-button class="button-item" type="primary" size="large" round @click="OpenModifyWindow">修改构件属性</el-button>
        <el-button class="button-item" type="primary" size="large" round @click="DeleteComponent">删除构件</el-button>
    </el-row>

    <!-- 构件属性信息窗口 -->
    <div class="Attrwindow" v-if="isAttr">
        <h2 style="text-align: center;">对象属性</h2>
        <div v-for="(group, groupName) in groupedProps" :key="groupName">
            <h3>{{ groupName }}</h3>
            <table>
                <tbody>
                    <tr v-for="(value, propName) in group" :key="propName">
                        <td style="font-weight: bold;">{{ propName }}</td>
                        <td>{{ value }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>


    <!-- 搜索构件属性窗口 -->
    <div class="Querywindow" v-if="isQuery">
        <div>属性名:
            <el-input type="text" v-model="QueryAttrName" placeholder="输入属性名称" />
        </div>
        <div>属性值:
            <el-input type="text" v-model="QueryAttrValue" placeholder="输入属性值" />
        </div>
        <div style="display: flex; justify-content: center;">
            <el-button type="primary" round @click="QueryAttr">确定</el-button>
        </div>
    </div>

    <!-- 修改构件属性窗口 -->
    <div class="Modifywindow" v-if="isModify">
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <h3 style="text-align: center;">修改构件属性</h3>
            <el-button circle @click="addCompoAttr" style="margin-top:5px" :icon="Plus" size="small"></el-button>
        </div>
        <div v-for="(attribute, index) in CompoAttr" :key="index" style="display: flex; justify-content: space-between;">
            <el-input v-model="attribute.key" placeholder="键" clearable />
            <el-input v-model="attribute.value" placeholder="值" clearable />
            <el-button circle @click="deleteCompoAttr(index)" style="margin-top:5px" :icon="Delete"
                size="small"></el-button>
        </div>
        <div style="display: flex; justify-content: center;">
            <el-button round @click="ModifyCompoAttr" style="margin-top:5px">确定</el-button>
        </div>
    </div>
</template>


<script setup>
import { defineProps, ref, computed, onMounted } from 'vue'
import { useBimStore } from '../store/bim';
import { storeToRefs } from 'pinia'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { Delete, Plus } from '@element-plus/icons-vue'



const Bimstore = useBimStore()
const { isBim, clientId, clientSecret, layerUrl, BeareraccessToken } = storeToRefs(Bimstore)
const host = "https://api.cloud.pkpm.cn"
const subDataId = ref('')
const externalId = ref('')
const dbId = ref('')
const componentId = ref('')

// 从 localStorage 中读取值（防止刷新页面后数据丢失）
clientId.value = localStorage.getItem('clientId') || '';
clientSecret.value = localStorage.getItem('clientSecret') || '';
layerUrl.value = localStorage.getItem('layerUrl') || '';
BeareraccessToken.value = localStorage.getItem('BeareraccessToken') || '';



const Bimprop = defineProps({
    api: {
        type: Object,
        required: true
    }
})



// 查询构件属性相关

const isQuery = ref(false)
const OpenQueryAttrWindow = () => {
    isQuery.value = !isQuery.value
    console.log('打开查询构件属性窗口')
}

//查询构件属性窗口
const QueryAttrName = ref('')
const QueryAttrValue = ref('')
const QueryResponse = ref(null);
const QueryAttr = async () => {
    console.log('查询构件属性')
    console.log('属性名', QueryAttrName.value)
    console.log('属性值', QueryAttrValue.value)

    console.log('layerUrl', layerUrl.value)
    const parts = layerUrl.value.split('/')
    const translationKey = parts[7]
    externalId.value = "urn:bimbox.object:translation_result_v2/" + translationKey

    // 获取subDataId
    const subUrl = host + "/bims-api/bims/v2/subdatas"
    try {
        const subResponse = await axios.get(subUrl, {
            params: {
                externalId: externalId.value,
                clientId: clientId.value
            },
            headers: {
                Authorization: BeareraccessToken.value
            }
        })
        ElMessage.success("subDataId获取成功")
        console.log("subDataId获取成功：", subResponse)
        subDataId.value = subResponse.data.result[0].id
        console.log("subDataId:", subDataId.value)

    } catch (error) {
        ElMessage.error("subDataId获取失败")
        console.log("subDataId获取失败：", error)

    }


    let url
    if (QueryAttrName.value === 'dbId') {
        url = host + "/bims-api/bims/v2/subdatas/" + subDataId.value + "/components/search";

        const requestBody = {
            propsConditions: [
                {
                    key: "batch:id",
                    operateSymbol: 4,
                    value: QueryAttrValue.value
                }
            ]
        };


        try {
            QueryResponse.value = await axios.post(url, requestBody, {
                headers: {
                    Authorization: BeareraccessToken.value
                }
            })

            // 请求成功，获取返回的数据
            ElMessage.success("dbid查询成功")
            console.log("dbid查询成功", QueryResponse.value.data)
            console.log((QueryResponse.value.data.result[0].props))
            componentId.value = QueryResponse.value.data.result[0].xdbGuid
        } catch (error) {
            // 请求失败，打印错误消息
            ElMessage.error("dbid查询失败")
            console.log('dbid查询失败:', error)
        }
    }
    else if (QueryAttrName.value === 'OBVID') {
        url = host + "/bims-api/bims/v2/subdatas/" + subDataId.value + "/components/" + QueryAttrValue.value;
        try {
            QueryResponse.value = await axios.get(url, {
                headers: {
                    Authorization: BeareraccessToken.value
                }
            })

            // 请求成功，获取返回的数据
            ElMessage.success("obvid查询成功")
            console.log("obvid查询成功", QueryResponse.value.data)
            componentId.value = QueryResponse.value.data.result.xdbGuid
        } catch (error) {
            // 请求失败，打印错误消息
            ElMessage.error("obvid查询失败")
            console.log('obvid查询失败:', error)
        }
    }
    else {
        ElMessage.error("不支持该属性名")
    }

}



// 显示构件属性相关
const isAttr = ref(false)
const OpenAttrWindow = () => {
    isAttr.value = !isAttr.value
    console.log('打开构件属性窗口')
}

const groupedProps = computed(() => {
    if (QueryAttrName.value === 'OBVID') {
        if (!QueryResponse.value || !QueryResponse.value.data.result.props) {
            return {};
        }
        return Object.entries(QueryResponse.value.data.result.props).reduce((groups, [key, value]) => {
            const [groupName, propName] = key.split(':');
            if (!groups[groupName]) {
                groups[groupName] = {};
            }
            groups[groupName][propName] = value;
            return groups;
        }, {});
    }

    if (!QueryResponse.value || !QueryResponse.value.data.result[0].props) {
        return {};
    }

    return Object.entries(QueryResponse.value.data.result[0].props).reduce((groups, [key, value]) => {
        const [groupName, propName] = key.split(':');
        if (!groups[groupName]) {
            groups[groupName] = {};
        }
        groups[groupName][propName] = value;
        return groups;
    }, {});
});







//删除构件相关
const DeleteComponent = async () => {
    if (componentId.value === '' || subDataId.value === '') {
        ElMessage.error("请先通过查询选中构件")
        return
    }
    else {
        const DeleteUrl = host + "/bims-api/bims/v2/subdatas/" + subDataId.value + "/components/" + componentId.value
        try {
            const DeleteResponse = await axios.delete(DeleteUrl, {
                headers: {
                    Authorization: BeareraccessToken.value
                }
            })

            // 请求成功，获取返回的数据
            ElMessage.success("删除构件成功")
            console.log('删除构件成功:', DeleteResponse.data)
        } catch (error) {
            // 请求失败，打印错误消息
            ElMessage.error("删除构件失败")
            console.log('删除构件失败:', error)
        }
    }

}


//修改构件属性相关
const isModify = ref(false)
const OpenModifyWindow = () => {
    isModify.value = !isModify.value
    console.log('打开修改构件属性窗口')
}


const CompoAttr = ref([])
//添加CompoAttr
const addCompoAttr = () => {
    CompoAttr.value.push({
        key: '',
        value: ''
    })
}

//删除CompoAttr
const deleteCompoAttr = (index) => {
    CompoAttr.value.splice(index, 1)
}

//将CompoAttr数组转换为对象
const convertAttributesToObject = (attributesArray) => {
    const attributesObject = {};
    attributesArray.forEach(attribute => {
        attributesObject[attribute.key] = attribute.value;
    });
    return attributesObject;
};



const ModifyCompoAttr = async () => {
    if (subDataId.value === '') {
        ElMessage.error("请先通过查询选中构件")
        return
    }
    else {
        const ModifyUrl = host + "/bims-api/bims/v2/subdatas/" + subDataId.value + "/components"
        const ModifyProps = convertAttributesToObject(CompoAttr.value)
        const ModifyRequestBody = {
            bimComponent: {
                props: ModifyProps,
                xdbGuid: componentId.value,
                subDataId: subDataId.value
            }
        }

        try {
            const ModifyResponse = await axios.post(ModifyUrl, ModifyRequestBody, {
                headers: {
                    Authorization: BeareraccessToken.value
                }
            })

            ElMessage.success("修改构件属性成功")
            console.log("修改构件属性成功", ModifyResponse.data)


        } catch (error) {
            // 请求失败，打印错误消息
            ElMessage.error("修改构件属性失败")
            console.log('修改构件属性失败:', error)
        }
    }
}



</script>


<style scoped>
.button-container {
    display: flex;
    justify-content: space-between;
    flex-wrap: nowrap; /* 添加这一行 */
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    padding: 0 50px;
    box-sizing: border-box;
}

.button-item:not(:last-child) {
    margin-right: 100px;
}

.Querywindow {
    width: 300px;
    position: absolute;
    right: 10px;
    bottom: 70px;
    border: 1px;
    background-color: #f9f9f9;
    border-radius: 7px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
    padding: 10px;
    /* cursor: move; */
    /* 可拖动的光标样式 */
    z-index: 1000;
    font-size: 15px;
    line-height: 1.5;
    /* 增加行距 */
}

.Modifywindow {
    width: 200px;
    height: 250px;
    /* 你可以根据需要设置这个值 */
    position: absolute;
    left: 430px;
    bottom: 80px;
    border: 1px;
    background-color: #f9f9f9;
    border-radius: 7px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
    padding: 10px;
    /* cursor: move; */
    /* 可拖动的光标样式 */
    z-index: 1000;
    font-size: 15px;
    line-height: 1.5;
    /* 增加行距 */
    overflow: auto;
    /* 当内容溢出时显示滚动条 */
}

.Attrwindow {
    width: 398px;
    height: 800px;
    /* 你可以根据需要设置这个值 */
    position: absolute;
    left: 10px;
    top: 100px;
    border: 1px;
    background-color: #f9f9f9;
    border-radius: 7px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
    padding: 10px;
    /* cursor: move; */
    /* 可拖动的光标样式 */
    z-index: 1000;
    font-size: 15px;
    line-height: 1.5;
    /* 增加行距 */
    overflow: auto;
    /* 当内容溢出时显示滚动条 */
}

.Attrwindow table {
    width: 100%;
    /* 让表格宽度为 100% */
}

.Attrwindow td {
    text-align: left;
    /* 让表格数据左对齐 */
}

.Attrwindow div {
    background-color: #f0f0f0;
    /* 设置背景颜色 */
    margin-bottom: 10px;
    /* 设置下边距 */
    border: 1px solid #ccc;
    /* 设置边框 */
    border-radius: 5px;
    /* 设置边框半径 */
    padding: 10px;
    /* 设置内边距 */
}
</style>