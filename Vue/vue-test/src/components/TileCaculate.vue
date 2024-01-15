<!-- 该文件主要用于计算坐标所对应的.terrain信息 -->
<template>
    <div class="info-div " v-if="showInfo">
        <h3>计算得到的瓦片信息</h3>
        <div class="rich-text">
            <div v-for="(result, index) in tileResults" :key="index" class="text-div">
                <template v-if="shouldDisplayTitle(index)">
                    <p>这是第{{ getTileResultsGroup(index) }}组的结果</p>
                    <!-- <br /> -->
                </template>
                层级 {{ result.xyl.level }} - 瓦片总数: {{ result.num }}, 行列号: {{ result.xyl.x }}, {{ result.xyl.y }}
            </div>
        </div>
        <div class="item-center " id="export-div">
            <el-button round size="large">导 出</el-button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useStore } from "vuex";
import axios from 'axios';
import decode from '@here/quantized-mesh-decoder';// 导入 quantized-mesh-decoder 库

// 最大层级
const maxLevel = ref<number | null>(null); // 初始化为null

maxLevel.value = 10 //先暂定最大层数为10（0-9）
// 发起HTTP请求
// axios.get('http://localhost:3000/DEM/meta.json')
//     .then(response => {
//         // 请求成功，将响应数据log出来
//         console.log('Response Data:', response.data);
//         console.log('最大层级0-', response.data.maxzoom);
//         maxLevel.value = response.data.maxzoom + 1; // 将maxLevel赋值

//     })
//     .catch(error => {
//         // 请求出错，log出错误信息
//         console.error('Request Error:', error);
//     });


// 其中{z}、{x}和{y}分别代表层级号、行号和列号。
async function fetchAndDecodeTile(z, x, y) {
    // const url = `http://localhost:3000/DEM/${z}/${x}/${y}.terrain`;
    const url = `./assets/tile-with-extensions.terrain`;

    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        const buffer = response.data;
        const options = {}; // 根据需要配置选项
        const decodedTile = decode(buffer, options);
        return decodedTile;
    } catch (error) {
        console.error('Error fetching or decoding tile:', error);
    }
}

const decodeTerrain = () => {
  // 文件的URL
  const fileUrl = 'public/4.terrain';

  // 使用axios来获取文件数据
  axios.get(fileUrl, { responseType: 'arraybuffer' })
    .then(response => {
      // 获取到的数据是ArrayBuffer格式
      const arrayBuffer = response.data;

      // 设置选项（如果需要）
      const options = {
        maxDecodingStep: 5 // 替换成你的选项
      };

      // 调用decode函数来解码
      const decodedData = decode(arrayBuffer, options);

      // 打印解码后的数据，你可以根据你的需求对其进行处理
      console.log('解码后的数据', decodedData);
    })
    .catch(error => {
      console.error('无法读取或解码 .terrain 文件:', error);
    });
};

// 调用解码函数
decodeTerrain();

// 从 vuex 数据仓库里面取数据
const store = useStore();

// 仓库数据
const TileInfo = computed(() => store.state.SelectTileInfo); // 框选tile的信息

// 初始化数据
const showInfo = ref(false); // 是否显示计算结果页面
const lng = ref<number>(0); // 初始化经度
const lat = ref<number>(0); // 初始化纬度
const tileResults = ref<({ num: number; xyl: { x: number; y: number; level: number } })[]>([]);

const tileNum = (level: number): number => {
    return level === 0 ? 2 : 2 * Math.pow(4, level);
};

const tileXY = (lng: number, lat: number, level: number) => {
    const x = Math.floor((lng + 180) / 360 * Math.pow(2, level + 1));
    const y = Math.floor((1 + Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, level));
    return { x, y, level };
};

const calculateTilesForLevels = () => {
    tileResults.value = [];
    TileInfo.value.forEach((point) => {
        const lngValue = point[0]; // 经度
        const latValue = point[1]; // 纬度

        // 如果数据有意义才计算
        if (lngValue !== undefined && latValue !== undefined && maxLevel.value !== null) {
            // 计算所有层级
            for (let i = 0; i < maxLevel.value; i++) {
                const num = tileNum(i);
                const xyl = tileXY(lngValue, latValue, i);
                tileResults.value.push({ num, xyl });
            }
        }

    });
};

// 改变窗口显示与隐藏
const showInfoFunction = () => {
    showInfo.value = !showInfo.value;
};

// 计算属性：判断是否应该显示标题
const shouldDisplayTitle = (index) => {
    if (maxLevel.value !== null) {
        return index % maxLevel.value === 0;
    }

};

// 计算属性：获取当前结果属于第几组
const getTileResultsGroup = (index) => {
    return Math.floor(index / 10) + 1;
};

// 暴露给父组件的方法
defineExpose({
    calculateTilesForLevels,
    showInfoFunction,
})

</script>

<style scoped>
.info-div {
    width: 500px;
    height: 630px;
    /* overflow-y: auto; */
    position: absolute;
    left: 5%;
    top: 100px;
    border: 3px;
    background-color: #EBEDF0;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
    padding: 10px;
    border-radius: 5px;
    z-index: 10;
    justify-content: center;
    /* 水平居中 */
    align-items: center;
    /* 垂直居中 */
}

.rich-text {
    position: relative;
    margin: auto;
    padding: 13px;
    width: 90%;
    height: 500px;
    overflow-y: auto;
    background-color: #f9f9f9;
    border: 2px solid #909399;
    /* box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2); */
}

.item-center {
    text-align: center;
    margin: auto;
}

#export-div {
    width: 90%;
    margin-top: 5px;
}

.text-div {}
</style>