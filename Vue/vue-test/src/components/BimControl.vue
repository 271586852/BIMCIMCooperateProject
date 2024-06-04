<template>
    <!-- 功能按钮 -->
    <el-row class="button-container" v-show="isBim">
        <el-button class="button-item" type="success" size="large" round @click="GetsubDataId">获取subDataId</el-button>
        <el-button class="button-item" type="primary" size="large" round @click="OpenAttrWindow">显示构件属性</el-button>
        <el-button class="button-item" type="primary" size="large" round @click="OpenQueryAttrWindow">查询构件属性</el-button>
        <!-- <el-button class="button-item" type="primary" size="large" round @click="OpenModifyWindow">修改构件属性</el-button> -->
        <!-- 修改构件属性窗口 -->
        <el-popover placement="top" width="300" v-model:visible="isModify" trigger="click">
            <template #reference>
                <el-button class="button-item" type="primary" size="large" round>修改构件属性</el-button>
            </template>
            <el-scrollbar max-height="200px">
                <div class="Modifywindow-content">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <h3 style="text-align: center;">修改构件属性</h3>
                        <el-button circle @click="addCompoAttr" style="margin-top:5px" :icon="Plus"
                            size="small"></el-button>
                    </div>
                    <div v-for="(attribute, index) in CompoAttr" :key="index"
                        style="display: flex; justify-content: space-between;">
                        <el-input v-model="attribute.key" placeholder="键" clearable />
                        <el-input v-model="attribute.value" placeholder="值" clearable />
                        <el-button circle @click="deleteCompoAttr(index)" style="margin-top:5px" :icon="Delete"
                            size="small"></el-button>
                    </div>
                    <div style="display: flex; justify-content: center;">
                        <el-button round @click="ModifyCompoAttr" style="margin-top:5px">确定</el-button>
                    </div>
                </div>
            </el-scrollbar>
        </el-popover>
        <!-- <el-button class="button-item" type="primary" size="large" round
            @click="OpenDeleteAttrWindow">删除构件属性</el-button> -->
        <!-- 删除构件属性窗口 -->
        <el-popover placement="top" width="250" v-model:visible="isDelete" trigger="click">
            <template #reference>
                <el-button class="button-item" type="primary" size="large" round>删除构件属性</el-button>
            </template>
            <el-scrollbar max-height="200px">
                <div class="DeleteAttrwindow-content">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <h3 style="text-align: center;">删除构件属性</h3>
                        <el-button circle @click="addDeleteKey" style="margin-top:5px" :icon="Plus"
                            size="small"></el-button>
                    </div>
                    <div v-for="(deleteKey, Deleteindex) in deleteKeys" :key="Deleteindex"
                        style="display: flex; justify-content: space-between;">
                        <el-input v-model="deleteKeys[Deleteindex]" placeholder="输入要删除的属性名" clearable />
                        <el-button circle @click="deleteDeleteAttr(Deleteindex)" style="margin-top:5px" :icon="Delete"
                            size="small"></el-button>
                    </div>
                    <div style="display: flex; justify-content: center;">
                        <el-button round @click="deleteAttr" style="margin-top:5px">确定</el-button>
                    </div>
                </div>
            </el-scrollbar>
        </el-popover>
        <el-button class="button-item" type="danger" size="large" round @click="AskIfDeleteComponent">删除构件</el-button>
    </el-row>

    <!-- 构件属性信息窗口 -->
    <div class="Attrwindow" v-if="isAttr" ref="AttrWindowRef" @mousedown="dragMouseDown($event, 'AttrWindowRef')">
        <h1 style="text-align: center;">对象属性</h1>
        <el-scrollbar max-height="40vh" style="border:none; background-color: transparent;">
            <div v-if="GouLidbid" @mousedown.stop>
                <div v-for="(group, groupName) in groupedProps" :key="groupName">
                    <h2>{{ groupName }}</h2>
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
            <div v-else style="border:none">
                <table class="AttrTable" @mousedown.stop>
                    <tbody>
                        <tr v-for="(value, propName) in NotGLmeta" :key="propName">
                            <td style="font-weight: bold;">{{ propName }}</td>
                            <td>{{ value }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </el-scrollbar>
    </div>





    <!-- 搜索构件属性窗口 -->
    <div>
        <div class="Querywindow" v-if="isQuery" ref="QueryAttrRef" :style="{ height: queryWindowHeight }"
            @mousedown="dragMouseDown($event, 'QueryAttrRef')">
            <div>
                <h2 style="text-align: center;">
                    查询构件属性</h2>
            </div>
            <div>属性名:
                <el-input type="text" v-model="QueryAttrName" placeholder="输入属性名称" @mousedown.stop />
            </div>
            <div>属性值:
                <el-input type="text" v-model="QueryAttrValue" placeholder="输入属性值" @mousedown.stop />
            </div>
            <div style="display: flex; justify-content: center;">
                <el-button type="primary" round @click="QueryAttr">搜索</el-button>
            </div>
            <el-divider v-if="QueryResponse">batch:id</el-divider>
            <el-scrollbar v-if="QueryResponse" class="BatchIdButton" max-height="20vh">
                <el-button v-for="(item, QRindex) in QueryResponse.data.result" :key="QRindex"
                    @click="ClickBatchId(QRindex)">
                    {{ item.props['batch:id'] }}
                </el-button>
            </el-scrollbar>
        </div>
    </div>

    <!-- 修改构件属性窗口 -->
    <!-- <div class="Modifywindow" v-if="isModify">
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <h3 style="text-align: center;">修改构件属性</h3>
            <el-button circle @click="addCompoAttr" style="margin-top:5px" :icon="Plus" size="small"></el-button>
        </div>
        <div v-for="(attribute, index) in CompoAttr" :key="index"
            style="display: flex; justify-content: space-between;">
            <el-input v-model="attribute.key" placeholder="键" clearable />
            <el-input v-model="attribute.value" placeholder="值" clearable />
            <el-button circle @click="deleteCompoAttr(index)" style="margin-top:5px" :icon="Delete"
                size="small"></el-button>
        </div>
        <div style="display: flex; justify-content: center;">
            <el-button round @click="ModifyCompoAttr" style="margin-top:5px">确定</el-button>
        </div>
    </div> -->



    <!-- 删除构件属性窗口 -->
    <!-- <div class="DeleteAttrwindow" v-if="isDelete">
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <h3 style="text-align: center;">删除构件属性</h3>
            <el-button circle @click="addDeleteKey" style="margin-top:5px" :icon="Plus" size="small"></el-button>
        </div>
        <div v-for="(deleteKey, Deleteindex) in deleteKeys" :key="Deleteindex"
            style="display: flex; justify-content: space-between;">
            <el-input v-model="deleteKeys[Deleteindex]" placeholder="输入要删除的属性名" clearable />
            <el-button circle @click="deleteDeleteAttr(Deleteindex)" style="margin-top:5px" :icon="Delete"
                size="small"></el-button>
        </div>
        <div style="display: flex; justify-content: center;">
            <el-button round @click="deleteAttr" style="margin-top:5px">确定</el-button>
        </div>
    </div> -->
</template>


<script setup>
import { defineProps, ref, computed, onMounted, watchEffect, watch } from 'vue'
import { useBimStore } from '../store/bim';
import { storeToRefs } from 'pinia'
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete, Plus } from '@element-plus/icons-vue'



const Bimstore = useBimStore()
const { isBim, clientId, clientSecret, GlBimUrl, BeareraccessToken, GouLidbid, NotGLmeta } = storeToRefs(Bimstore)
const host = "https://api.cloud.pkpm.cn"
const subDataId = ref('')
const externalId = ref('')
const ClickdbId = ref('')
const componentId = ref('')
const ShowDbId = ref('')

// 从 localStorage 中读取值（防止刷新页面后数据丢失）
clientId.value = localStorage.getItem('clientId') || '';
clientSecret.value = localStorage.getItem('clientSecret') || '';
GlBimUrl.value = localStorage.getItem('GlBimUrl') || '';
BeareraccessToken.value = localStorage.getItem('BeareraccessToken') || '';



const Bimprop = defineProps({
    api: {
        type: Object,
        required: true
    }
})

let selectedItemProps = ref({});
const ClickQueryResponse = ref(null);

// 监听NotGLmeta的变化(非构力模型点击查询)
watch(NotGLmeta, async (newmeta,oldmeta) => {
    if(newmeta && GouLidbid.value == undefined){
        // 调整api.control.enableftclick(true)的参数
        Bimprop.api.control.enableLeftMouseClick(true,{
                nodeKey: 'sid',
                color: 'rgba(0, 255, 0, 0.8)',
                isHighlight: true,
                transparent: 1,
                featureIDSetIndex: 0, 
                clearLastHighlight: true
            });

        
        // selectedItemProps.value = NotGLmeta.value;
        console.log('点击查询非构力模型构件成功:', newmeta.sid);  // 添加日志
    
    }
})

// 监听GouLidbid的变化(构力模型点击查询)
watch(GouLidbid, async (newValue, oldValue) => {
    if (newValue) {
        // 调整api.control.enableftclick(true)的参数
        if(newValue != undefined){
            Bimprop.api.control.enableLeftMouseClick(true, {
                nodeKey: 'dbId',
                color: 'rgba(0, 255, 0, 0.8)',
                transparent: 1,
                isHighlight: true,
                featureIDSetIndex: 0,
                clearLastHighlight: true
            });
        }
       


        ClickdbId.value = newValue;
        console.log('点击构件dbid变化:', ClickdbId.value, newValue);

        let Clickurl
        Clickurl = host + "/bims-api/bims/v2/subdatas/" + subDataId.value + "/components/search";

        const ClickrequestBody = {
            propsConditions: [
                {
                    key: 'batch:id',
                    operateSymbol: 4,
                    value: ClickdbId.value
                }
            ]
        };

        try {
            ClickQueryResponse.value = await axios.post(Clickurl, ClickrequestBody, {
                headers: {
                    Authorization: BeareraccessToken.value
                }
            })

            // 请求成功，获取返回的数据
            ElMessage.success("点击查询到符合条件的构件（构力模型）")
            console.log("点击查询到符合条件的构件（构力模型）", ClickQueryResponse.value.data)
            console.log(ClickQueryResponse.value.data.result)
            componentId.value = ClickQueryResponse.value.data.result[0].xdbGuid
            ShowDbId.value = ClickQueryResponse.value.data.result[0].props['batch:id']
        } catch (error) {
            // 请求失败，打印错误消息
            ElMessage.error("没有查询到符合条件的构件")
            console.log('没有查询到符合条件的构件:', error)
        }

        selectedItemProps.value = ClickQueryResponse.value.data.result[0].props;
        console.log('selectedItemProps:', selectedItemProps.value);  // 添加日志
    }
});


/**
 *  获取subDataId
 
*/
const GetsubDataId = async () => {
    console.log('GlBimUrl', GlBimUrl.value)
    const parts = GlBimUrl.value.split('/')
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
}


/**
 * 查询构件属性相关
 */
const isQuery = ref(false)
const OpenQueryAttrWindow = () => {
    isQuery.value = !isQuery.value
    console.log('打开查询构件属性窗口')
}

// 实现构件属性展示窗口和查询构件属性窗口的可拖拽
const QueryAttrRef = ref(null);
const AttrWindowRef = ref(null);
let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

function dragMouseDown(e, refName) {
    e.preventDefault();
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    document.onmousemove = (event) => elementDrag(event, refName);
}

function elementDrag(e, refName) {
    const elmnt = refName === 'QueryAttrRef' ? QueryAttrRef.value : AttrWindowRef.value;
    if (!elmnt) return;

    e.preventDefault();
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;

    let newLeft = elmnt.offsetLeft - pos1;
    let newTop = elmnt.offsetTop - pos2;

    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const elmntWidth = elmnt.offsetWidth;
    const elmntHeight = elmnt.offsetHeight;

    if (newLeft < 0) {
        newLeft = 0;
    } else if (newLeft + elmntWidth > windowWidth) {
        newLeft = windowWidth - elmntWidth;
    }

    if (newTop < 40) {
        newTop = 40;
    } else if (newTop + elmntHeight > windowHeight) {
        newTop = windowHeight - elmntHeight;
    }

    elmnt.style.left = newLeft + 'px';
    elmnt.style.top = newTop + 'px';
}

function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
}




let queryWindowHeight = ref('21vh');
const QueryAttrName = ref('')
const QueryAttrValue = ref('')
const QueryResponse = ref(null);
const QueryAttr = async () => {
    console.log('查询构件属性')
    console.log('属性名', QueryAttrName.value)
    console.log('属性值', QueryAttrValue.value)


    let url
    url = host + "/bims-api/bims/v2/subdatas/" + subDataId.value + "/components/search";

    const requestBody = {
        propsConditions: [
            {
                key: QueryAttrName.value,
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
        ElMessage.success("查询到符合条件的构件")
        console.log("查询到符合条件的构件", QueryResponse.value.data)
        console.log(QueryResponse.value.data.result)

    } catch (error) {
        // 请求失败，打印错误消息
        ElMessage.error("没有查询到符合条件的构件")
        console.log('没有查询到符合条件的构件:', error)
    }

    //搜索后将窗口高度设置为auto
    queryWindowHeight.value = 'auto';

}



// 显示构件属性相关
const isAttr = ref(false)
const OpenAttrWindow = () => {
    isAttr.value = !isAttr.value
    console.log('打开构件属性窗口')
}

let QueResListIndex = ref(null);

const ClickBatchId = (QRindex) => {
    // 检查 QueryResponse 是否存在
    if (!QueryResponse || !QueryResponse.value || !QueryResponse.value.data || !QueryResponse.value.data.result) {
        console.error('QueryResponse is not correctly set');
        ElMessage.error("QueryResponse is not correctly set")
        return;
    }


    QueResListIndex.value = QRindex;

    // 显示构件属性
    selectedItemProps.value = QueryResponse.value.data.result[QRindex].props;

    // 记录当前选中的构件的 xdbGuid，以便后续操作
    componentId.value = QueryResponse.value.data.result[QRindex].xdbGuid

    ShowDbId.value = QueryResponse.value.data.result[QRindex].props['batch:id']

    console.log('selectedItemProps:', selectedItemProps.value);  // 添加日志
    isAttr.value = true;  // 显示构件属性窗口
};

const groupedProps = computed(() => {
    console.log('groupedProps is being computed计算grouopedProps');  // 添加日志

    if ((!QueryResponse.value && !selectedItemProps.value) || (!ClickQueryResponse.value && !selectedItemProps.value)) {
        return {};
    }

    return Object.entries(selectedItemProps.value).reduce((groups, [key, value]) => {
        const [groupName, propName] = key.split(':');
        if (!groups[groupName]) {
            groups[groupName] = {};
        }
        groups[groupName][propName] = value;
        console.log('groupedProps计算完毕');  // 添加日志
        return groups;
    }, {});

});








//删除构件相关
const AskIfDeleteComponent = async () => {
    ElMessageBox.confirm(`确定要删除dbid:${ShowDbId.value}构件吗？`, 'Warning', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(() => {
        ElMessage({
            type: 'info',
            message: '确定删除'
        });
        DeleteComponent()
    }).catch(() => {
        ElMessage({
            type: 'info',
            message: '已取消删除'
        });
    });
}


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

// 根据componentId查询构件属性(修改和删除构件属性时更新对应构件属性使用)
const QueryByComponetId = async () => {
    if (componentId.value === '' || subDataId.value === '') {
        ElMessage.error("请先通过查询选中构件")
        return
    }
    else {
        const QueryUrl = host + "/bims-api/bims/v2/subdatas/" + subDataId.value + "/components/" + componentId.value
        try {
            const QueryResponse = await axios.get(QueryUrl, {
                headers: {
                    Authorization: BeareraccessToken.value
                }
            })

            // 请求成功，获取返回的数据
            ElMessage.success("根据ComponetId查询构件属性成功")
            console.log('根据ComponetId查询构件属性成功:', QueryResponse.data)
            selectedItemProps.value = QueryResponse.data.result.props
        } catch (error) {
            // 请求失败，打印错误消息
            ElMessage.error("查询构件属性失败")
            console.log('查询构件属性失败:', error)
        }
    }
}



/**
 * 修改构件属性相关
 */
const isModify = ref(false)
const OpenModifyWindow = () => {
    isModify.value = !isModify.value
    console.log('打开修改构件属性窗口')
}


const CompoAttr = ref([{
    key: '',
    value: ''
}])
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
        let userAttributes = convertAttributesToObject(CompoAttr.value)
        const ModifyProps = { ...selectedItemProps.value, ...userAttributes }
        const ModifyRequestBody = {
            bimComponent: {
                xdbGuid: componentId.value,
                subDataId: subDataId.value,
                props: ModifyProps,
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
            // selectedItemProps.value = ModifyResponse.data.result.props

            //刷新构件属性
            // QueryAttr()
            QueryByComponetId()

        } catch (error) {
            // 请求失败，打印错误消息
            ElMessage.error("修改构件属性失败")
            console.log('修改构件属性失败:', error)
        }
    }
}


/**
 * 删除构件属性相关
 */
const isDelete = ref(false)
const OpenDeleteAttrWindow = () => {
    isDelete.value = !isDelete.value
    console.log('打开删除构件属性窗口')
}

let deleteKeys = ref([''])
const addDeleteKey = () => {
    deleteKeys.value.push('')
}
const deleteDeleteAttr = (Deleteindex) => {
    deleteKeys.value.splice(Deleteindex, 1)
}

const deleteAttr = async () => {
    if (subDataId.value === '') {
        ElMessage.error("请先通过查询选中构件")
        return
    }


    const hasNonExistentKey = deleteKeys.value.some((key) => {
        if (key in selectedItemProps.value) {
            delete selectedItemProps.value[key];
            return false;
        } else {
            ElMessage.error("要删除的属性不存在");
            return true;
        }
    });

    if (!hasNonExistentKey) {
        deleteKeys.value = [''];
        const DelAttrUrl = host + "/bims-api/bims/v2/subdatas/" + subDataId.value + "/components"
        const DelAttrRequestBody = {
            bimComponent: {
                xdbGuid: componentId.value,
                subDataId: subDataId.value,
                props: selectedItemProps.value,
            }
        }
        try {
            const DelAttrResponse = await axios.post(DelAttrUrl, DelAttrRequestBody, {
                headers: {
                    Authorization: BeareraccessToken.value
                }
            })

            ElMessage.success("删除构件属性成功")
            console.log("删除构件属性成功", DelAttrResponse.data)
            // selectedItemProps.value = DelAttrResponse.data.result.props

            //刷新构件属性
            // QueryAttr()
            QueryByComponetId()

        } catch (error) {
            // 请求失败，打印错误消息
            ElMessage.error("删除构件属性失败")
            console.log('删除构件属性失败:', error)
        }
    }


}


</script>


<style scoped>
.button-container {
    display: flex;
    justify-content: space-between;
    flex-wrap: nowrap;
    /* 添加这一行 */
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
    width: 22vh;
    /* max-height: 18vh; */
    position: absolute;
    top: 40px;
    right: 130px;
    border: 1px solid #555;
    background-color: #2e2e2e;
    border-radius: 7px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
    padding: 10px;
    z-index: 1000;
    font-size: 11px;
    line-height: 1.5;
    color: #f9f9f9;
}

.BatchIdButton {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    overflow: auto;
    width: 100%;
}

.BatchIdButton .el-button {
    flex: 0 0 20%;
    /* 100% / 4 = 25%, 然后留一点空间给间隔 */
    margin: 0 5px 5px 0;
}





/* .Modifywindow {
    width: 250px;
    height: 250px;
    
    position: absolute;
    left: 490px;
    bottom: 80px;
    border: 1px;
    background-color: #f9f9f9;
    border-radius: 7px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
    padding: 10px;
    
   
    z-index: 1000;
    font-size: 15px;
    line-height: 1.5;

    overflow: auto;
    
} */

/* .DeleteAttrwindow {
    width: 200px;
    height: 200px;
    position: absolute;
    bottom: 70px;
    right: 0px;
    background-color: #f9f9f9;
    border-radius: 7px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
    padding: 10px;
    z-index: 1000;
    font-size: 15px;
    line-height: 1.5;
    overflow: auto;
} */

.Attrwindow {
    width: 25vw;
    max-height: 50vh;
    position: absolute;
    left: 0px;
    top: 100px;
    border: 1px;
    background-color: #2e2e2e;
    /* Dark background */
    border-radius: 7px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
    padding: 10px;
    z-index: 1000;
    font-size: 12px;
    line-height: 1.5;
    color: #f9f9f9;
    /* Light text color */
    /* overflow: auto; */
}

.Attrwindow table {
    width: 100%;
}

.Attrwindow td {
    text-align: left;
}

.Attrwindow div {
    background-color: #3e3e3e;
    /* Slightly lighter dark background */
    margin-bottom: 10px;
    border: 1px solid #555;
    /* Darker border */
    border-radius: 5px;
    padding: 10px;
}

.AttrTable {
    border-collapse: collapse;
}

.AttrTable td {
    border: 1px solid #777;
    /* Darker border */
    padding: 5px;
    color: #f9f9f9;
    /* Light text color */
}
</style>