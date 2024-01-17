<!-- 该文件主要用于计算坐标所对应的.terrain信息 -->
<template>
    <div class="info-div " v-if="showInfo">
        <h3>计算得到的瓦片信息</h3>
        <div class="rich-text" v-if="tileResults.length > 0">
            <div v-for="(result, index) in tileResults" :key="index" class="text-div">
                <template v-if="shouldDisplayTitle(index)">
                    <p>这是第{{ getTileResultsGroup(index) }}组的结果</p>
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
import { ref, computed, watch } from 'vue';
import { useStore } from "vuex";
import axios from 'axios';
import decode from '@here/quantized-mesh-decoder';// 导入 quantized-mesh-decoder 库

// 最大层级
const maxLevel = ref<number | null>(null); // 初始化为null

maxLevel.value = 10 //先暂定最大层数为10（0-9）
// --发起HTTP请求,通过meta.json文件获取最大层级------------
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
// --发起HTTP请求,通过meta.json文件获取最大层级------------


// 其中{z}、{x}和{y}分别代表层级号、行号和列号。

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
// decodeTerrain();

// 从 vuex 数据仓库里面取数据
const store = useStore();

// 仓库数据
const TileInfo = computed(() => store.state.SelectTileInfo); // 框选tile的点坐标信息

// --将包含经度、纬度和高度的对象数组转换为只包含经度和纬度的对象数组，会有属性名
const convertToLatLngArray222 = (objects: number[][]): { longitude: number, latitude: number }[] => {
    const result: { longitude: number, latitude: number }[] = [];

    for (const obj of objects) {
        const [longitude, latitude] = obj;
        result.push({ longitude, latitude });
    }

    return result;
}

// --将包含经度、纬度和高度的对象数组转换为只包含经度和纬度的对象数组,仅数值
const convertToLatLngArray = (objects) => {
    // 使用数组的map方法遍历原始数组，对每个子数组进行处理
    const result = objects.map(item => {
        // 提取经纬度信息（前两项），并将其转为数值
        const [longitude, latitude] = item.slice(0, 2).map(Number);
        return [longitude, latitude];
    });

    return result;
}

// 测试原始数据
const originalObjects = [
    [113.93016592020163, 22.533575969033645, 65.25560864886819],
    [114.00516529438568, 22.67948100262502, 89.60984044596428],
    [114.08166187591108, 22.557437161746257, 119.93841318827594],
    [114.03064676883437, 22.498928915900297, 3.023563829919685],
    [114.03064676883437, 22.498928915900297, 3.023563829919685]
];


// --解求最大矩形框经纬度
const calculateMaxRectangle = (objects) => {
    let minLongitude = 180;
    let maxLongitude = -180;
    let minLatitude = 90;
    let maxLatitude = -90;

    // 遍历对象数组以找到最大和最小的经纬度值
    for (const obj of objects) {
        const [longitude, latitude] = obj;
        // 更新最小经度
        if (longitude < minLongitude) {
            minLongitude = longitude;
        }
        // 更新最大经度
        if (longitude > maxLongitude) {
            maxLongitude = longitude;
        }
        // 更新最小纬度
        if (latitude < minLatitude) {
            minLatitude = latitude;
        }
        // 更新最大纬度
        if (latitude > maxLatitude) {
            maxLatitude = latitude;
        }
    }

    // 构建最大矩形框的四个顶点
    const topLeft = [minLongitude, maxLatitude];
    const topRight = [maxLongitude, maxLatitude];
    const bottomLeft = [minLongitude, minLatitude];
    const bottomRight = [maxLongitude, minLatitude];

    // 返回最大矩形框的四个顶点
    return [topLeft, topRight, bottomLeft, bottomRight];
}

// --保留不重复的坐标点
const bbboxTwoPoints = (objects: number[][]): number[][] => {
    // 创建一个 Set 来存储不重复的坐标
    const uniqueCoordinates = new Set<string>();

    // 创建一个新数组来存储结果
    const result: number[][] = [];

    // 遍历原始数组，将不重复的坐标添加到 Set 中
    objects.forEach((item) => {
        const coordinateKey = item.join(',');
        if (!uniqueCoordinates.has(coordinateKey)) {
            uniqueCoordinates.add(coordinateKey);
            result.push(item);
        }
    });

    return result;
};


// 初始化数据
const showInfo = ref(false); // 是否显示计算结果页面
const lng = ref<number>(0); // 初始化经度
const lat = ref<number>(0); // 初始化纬度
const tileResults = ref<({ num: number; xyl: { x: number; y: number; level: number } })[]>([]);

// --返回等级为level的瓦片数量
const tileNum = (level: number): number => {
    return level === 0 ? 2 : 2 * Math.pow(4, level);
};

// --计算经纬度对应的瓦片坐标
const tileXY = (lng: number, lat: number, level: number) => {
    const x = Math.floor((lng + 180) / 360 * Math.pow(2, level + 1));
    const y = Math.floor((1 + Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, level));
    return { x, y, level };
};

// --初始化tileResults数组
const calculateTilesForLevels222 = (objects) => {
    tileResults.value = [];

    // 检查输入参数是否为有效的 number[][] 数组
    if (Array.isArray(objects) && objects.length > 0 && Array.isArray(objects[0])) {
        objects.forEach((point) => {
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
    }
};

// 解求terrain对应的层级与行列号
const calculateTilesForLevels = (maxRectangle: number[][]): { num: number, xyl: any }[] => {
  const tileResultsArray: { num: number, xyl: any }[] = [];

  // 假设 maxLevel.value 已经在函数作用域内定义
  const maxLevelValue = maxLevel.value;

  maxRectangle.forEach((point) => {
    const lngValue = point[0]; // 经度
    const latValue = point[1]; // 纬度

    // 如果数据有意义才计算
    if (lngValue !== undefined && latValue !== undefined && maxLevelValue !== null) {
      // 计算所有层级
      for (let i = 0; i < maxLevelValue; i++) {
        const num = tileNum(i);
        const xyl = tileXY(lngValue, latValue, i);
        tileResultsArray.push({ num, xyl });
      }
    }
  });

  return tileResultsArray;
};

// 监听 TileInfo 的变化
watch(TileInfo, (newTileInfo, oldTileInfo) => {
  if (newTileInfo.length >= 2) {
    const latlngArray = convertToLatLngArray(TileInfo.value);
    console.log('latlngArray数据:', latlngArray);
    const maxRectangle = calculateMaxRectangle(latlngArray);
    console.log('最大的矩形框范围：', maxRectangle);
    tileResults.value = calculateTilesForLevels(maxRectangle);
    console.log('解读得到的tileResults:', tileResults.value);
  }
});

//console.log('外部的tileResults:', tileResults.value);




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
</style>