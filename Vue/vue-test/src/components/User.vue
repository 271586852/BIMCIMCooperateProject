<template>
    <el-button text @click="dialogVisible = true" id="btnuser">
        Click to open Dialog
    </el-button>

    <el-dialog v-model="dialogVisible" title="User Setting" width="30%">
        <el-form :model="form">
            <el-form-item label="url" :label-width="formLabelWidth">
                <el-input v-model="form.url" autocomplete="off" placeholder="localhost:4000" clearable />
            </el-form-item>
            <el-form-item label="wsPort" :label-width="formLabelWidth">
                <el-input v-model="form.wsPort" autocomplete="off" placeholder="2333" clearable />
            </el-form-item>
        </el-form>
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="onCancel">Cancel</el-button>
                <el-button type="primary" @click="onConfirm">Confirm</el-button>
            </span>
        </template>
    </el-dialog>
</template>
  
<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useStore } from "vuex";

//从vuex数据仓库里面取数据
const store = useStore();
// const userVisible = computed(() => store.state.UserVisible); // 用户信息窗口
// 从 Vuex 中获取用户信息窗口的可见性
const dialogVisible = computed(() => store.state.userVisible);

// const dialogVisible = ref(false)


const form = ref({
    url: 'localhost:4000',
    wsPort: '2333'
})


const formLabelWidth = '100px'

// 定义 emits 来触发自定义事件
const emits = defineEmits(['updateFormData'])

// 点击确定按钮
const onConfirm = () => {
    // 创建要传递的数据对象
    const formData = {
        url: form.value.url,
        wsPort: form.value.wsPort
    };

    // 通过vuex，更改api信息
    store.commit('updateVuexUrl', formData.url)
    store.commit('updateVuexWsPort', formData.wsPort)

    // 触发自定义事件并将 form 数据传递给父组件
    emits('updateFormData', formData);

    // 然后设置 loadMega 为 true，以加载 Mega 组件
    store.commit('updateLoadMega', true)

    // 关闭对话框
    store.commit('updateUserVisible', false)
}

// 点击取消按钮
const onCancel = () => {
    // 关闭对话框
    store.commit('updateUserVisible', true)
}

</script>
  
<style scoped>
.el-input {
    width: 200px;
}

.dialog-footer button:first-child {
    margin-right: 10px;
}

#btnuser {
    float: left;
    z-index: 9999;
}
</style>