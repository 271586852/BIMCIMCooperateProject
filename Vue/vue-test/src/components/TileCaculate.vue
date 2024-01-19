<!-- 该文件主要用于计算坐标所对应的.terrain信息 -->
<template>
    <div class="info-div " v-if="showInfo">
        <h3>Terrain瓦片顶点相对坐标</h3>
        <!-- <div class="rich-text" v-if="tileResults.length > 0">
            <div v-for="(result, index) in tileResults" :key="index" class="text-div">
                <template v-if="shouldDisplayTitle(index)">
                    <p>这是第{{ getTileResultsGroup(index) }}组的结果</p>
                </template>
                层级 {{ result.xyl.level }} - 瓦片总数: {{ result.num }}, 行列号: {{ result.xyl.x }}, {{ result.xyl.y }}
            </div>
        </div> -->
        <div class="rich-text">{
            <br />
            {
            <p class="text-p">
                [{{ allvexXYZ.longitude }},{{ allvexXYZ.latitude }},{{ allvexXYZ.height }} ]
            </p>},<br />
            {
            <p v-for="(coord, index) in cgcsCoordinates" :key="index" class="text-p">
                [{{ coord.longitude }},{{ coord.latitude }},{{ coord.height }}],
            </p>},<br />
            }
        </div>
        <div class="item-center " id="export-div">
            <!-- <el-button round size="large" @click="exportTxt">导 出</el-button> -->
            <el-button round size="large">导 出</el-button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useStore } from "vuex";
import axios from 'axios';
import saveAS from 'file-saver';
import decode, { DECODING_STEPS } from '@here/quantized-mesh-decoder';// 导入 quantized-mesh-decoder 库

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

/**
 * 解码单个terrain地形
 */
const decodeTerrain = () => {
    // 文件的URL
    const fileUrl = 'public/tile-with-extensions.terrain';

    // 使用axios来获取文件数据
    axios.get(fileUrl, { responseType: 'arraybuffer' })
        .then(response => {
            // 获取到的数据是ArrayBuffer格式
            const arrayBuffer = response.data;
            console.log('原始数据:', arrayBuffer);


            // 设置选项（如果需要）
            const options = {
                maxDecodingStep: DECODING_STEPS // 替换成你的选项
            };

            // 调用decode函数来解码
            const decodedData = decode(arrayBuffer, options);

            // 打印解码后的数据，你可以根据你的需求对其进行处理
            console.log('单文件解码后的数据', decodedData);
        })
        .catch(error => {
            console.error('无法读取或解码 .terrain 文件:', error);
        });
};

// 定义zigzag解码函数
const zigzagDecode = (value) => {
    return (value >> 1) ^ (-(value & 1));
}

// 顶点坐标
const cgcsCoordinates = ref<any>([]);
const centerXYZ = ref();
// const allvexXYZ = ref();
interface Coordinate {
    longitude: number;
    latitude: number;
    height: number;
}

const allvexXYZ: Coordinate[] = [];
// 初始化整体中心坐标的累加值
let totalCenterX = 0;
let totalCenterY = 0;
let totalCenterZ = 0;
const allVertices = <any>[]; // 存储所有顶点坐标的数组

/**
 * 对获取到的terrain的url数据进行解码
 * @param urlArray 包含多个terrain地形文件URL的数组
 * @returns 解码后的数据数组
 */
const decodeTerrainArray = async (urlArray) => {
    try {
        // 创建一个 promise 链来处理多个 URL
        const promises = urlArray.map(async (fileUrl) => {
            try {
                const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
                // 获取到的数据是 ArrayBuffer 格式
                const arrayBuffer = response.data;

                // 设置选项（如果需要）
                const options = {
                    // maxDecodingStep: DECODING_STEPS.extensions // 替换成你的选项
                    maxDecodingStep: 5 // 替换成你的选项
                };

                // 调用 decode 函数来解码
                const decodedData = decode(arrayBuffer, options);

                // 返回解码后的数据
                return decodedData;
            } catch (error) {
                console.error(`无法读取或解码 ${fileUrl}:`, error);
                // 如果有错误，返回 null 或其他适当的值
                return null;
            }
        });

        // 使用 Promise.all 来等待所有 URL 的处理完成
        const decodedDataArray = await Promise.all(promises);

        // decodedDataArray 包含所有解码后的数据
        decodedDataArray.forEach((decodedData, index) => {
            console.log(`解码后的数据 (${urlArray[index]}):`, decodedData);
            console.log(`解码后对象 ${index + 1} 的顶点坐标:`, decodedData.vertexData);
            // const result = calculateVertexCenterAndRelativeCoordinates(decodedData);
            // console.log(`对象 ${index + 1} 的中心坐标: (${result.centerU}, ${result.centerV}, ${result.centerH})`);

            // 累加每个对象的中心坐标, 计算整体的中心坐标
            totalCenterX += decodedData.header.centerX;
            totalCenterY += decodedData.header.centerY;
            totalCenterZ += decodedData.header.centerZ;

            // 处理每个解码后的数据
            const Result = calculateVerticesCoordinates(decodedData)
            console.log(`对象 ${index + 1} 的反算后顶点坐标（ECEF）:`, Result);

            // 存储顶点坐标到 allVertices 数组,包含全部反算后的顶点坐标
            allVertices.push(...Result);

            // 初始化坐标总和
            let centerxSum = 0;
            let centerySum = 0;
            let centerzSum = 0;

            // 计算坐标的总和，并计算每个顶点相对于整体中心的相对坐标
            Result.forEach((vexData, indx) => {
                centerxSum += vexData.longitude;
                centerySum += vexData.latitude;
                centerzSum += vexData.height;
            })

            const objectSum = Result.length;
            console.log(`对象 ${index + 1} 的顶点数量:`, objectSum);

            const centerx = centerxSum / objectSum;
            const centery = centerySum / objectSum;
            const centerz = centerzSum / objectSum;
            console.log(`解求对象 ${index + 1} 的中心坐标: (${centerx}, ${centery}, ${centerz})`);

        });

        // 计算整体中心坐标
        const totalObjects = decodedDataArray.length;
        const overallCenterX = totalCenterX / totalObjects;
        const overallCenterY = totalCenterY / totalObjects;
        const overallCenterZ = totalCenterZ / totalObjects;
        // 创建包含这些坐标的数组
        const centerVexArray = [overallCenterX, overallCenterY, overallCenterZ];

        // 各顶点的相对坐标
        const relativeVex = calculateRelativeVex(centerVexArray, allVertices);

        console.log(`整体中心坐标（ECEF）: (${overallCenterX}, ${overallCenterY}, ${overallCenterZ})`);
        console.log('各顶点的相对坐标:', relativeVex);

        // 将全部顶点存入数组中
        cgcsCoordinates.value.push(relativeVex);

        return cgcsCoordinates.value, relativeVex.value;
    } catch (error) {
        console.error('处理 .terrain 文件时发生错误:', error);
        return null;
    }
};


/**
 * 根据瓦片范围反算出顶点的经纬度坐标
 * @param decodedData 
 */
// const calculateVerticesCoordinates = (decodedData) => {
    // const centerX = decodedData.header.centerX;
    // const centerY = decodedData.header.centerY; // 中心点 Y 坐标
    // const centerZ = decodedData.header.centerZ; // 中心点 Z 坐标
    
//     const boundingSphereRadius = decodedData.header.boundingSphereRadius; // 包围球半径
//     const maxHeight = decodedData.header.maxHeight; // 最大高度
//     const minHeight = decodedData.header.minHeight; // 最小高度
//     const minx
//     const maxx
//     const miny
//     const maxy
//     const coordinates: any[] = [];
//     const vertexCount = decodedData.vertexData.length / 3

//     for (let i = 0; i < vertexCount; i++) {
//         const xRelative = minx + (decodedData.vertexData[i] / 32767) / (maxx - minx);
//         const yRelative = miny + (decodedData.vertexData[i + vertexCount] / 32767) * (maxy - miny);
//         const zRelative = minHeight + (decodedData.vertexData[i + 2 * vertexCount] / 32767) * (maxHeight - maxHeight);

//         const longitude = xRelative * boundingSphereRadius;
//         const latitude = yRelative * boundingSphereRadius;
//         const height = zRelative * (maxHeight - minHeight);

//         coordinates.push({ longitude, latitude, height });
//     }

//     return coordinates;
// }


/**
 * 用于计算顶点与整体中心坐标的相对坐标
 * @param centerXYZ 
 * @param vertices 
 */
function calculateRelativeVex(centerXYZ, vertices) {
    const relativeCoordinates = <any>[];

    for (const vertex of vertices) {
        // 计算相对坐标
        const relativeX = vertex.longitude - centerXYZ[0];
        const relativeY = vertex.latitude - centerXYZ[1];
        const relativeZ = vertex.height - centerXYZ[2];

        relativeCoordinates.push({ ...vertex, relativeX, relativeY, relativeZ });
    }

    return relativeCoordinates;
}



// 调用解码函数
// decodeTerrain();

// 使用示例，传入一个包含多个 URL 的数组
// const urlArray = ['public/9/836/288.terrain', 'public/9/836/289.terrain'];
// decodeTerrainArray(urlArray)

const terrainTestData =
{
    "header": {
        "centerX": -2551045.801845286,
        "centerY": 5707736.012649464,
        "centerZ": 1255069.7820362046,
        "minHeight": -1000,
        "maxHeight": -368.6794738769531,
        "boundingSphereCenterX": -2550890.6243261723,
        "boundingSphereCenterY": 5707403.478353147,
        "boundingSphereCenterZ": 1254995.6679033993,
        "boundingSphereRadius": 27318.04567733734,
        "horizonOcclusionPointX": -0.8028722610148585,
        "horizonOcclusionPointY": 1.7963592368449341,
        "horizonOcclusionPointZ": 0.3963285845283304
    },
    "vertexData": {
        "0": 32767,
        "1": 28671,
        "2": 32767,
        "3": 28671,
        "4": 24575,
        "5": 28671,
        "6": 30719,
        "7": 32767,
        "8": 31743,
        "9": 32767,
        "10": 30719,
        "11": 30719,
        "12": 32767,
        "13": 28671,
        "14": 24575,
        "15": 16384,
        "16": 24575,
        "17": 28671,
        "18": 32767,
        "19": 32767,
        "20": 16384,
        "21": 0,
        "22": 0,
        "23": 16384,
        "24": 24575,
        "25": 0,
        "26": 4096,
        "27": 8192,
        "28": 8192,
        "29": 8192,
        "30": 12288,
        "31": 10240,
        "32": 10240,
        "33": 11264,
        "34": 12288,
        "35": 12288,
        "36": 14336,
        "37": 16384,
        "38": 16384,
        "39": 16384,
        "40": 16384,
        "41": 24575,
        "42": 20479,
        "43": 24575,
        "44": 32767,
        "45": 32767,
        "46": 32767,
        "47": 0,
        "48": 0,
        "49": 0,
        "50": 0,
        "51": 0,
        "52": 0,
        "53": 0,
        "54": 0,
        "55": 0,
        "56": 0,
        "57": 1210,
        "58": 3300,
        "59": 32767,
        "60": 764,
        "61": 0,
        "62": 0,
        "63": 0,
        "64": 0,
        "65": 0,
        "66": 0,
        "67": 0,
        "68": 0,
        "69": 0,
        "70": 0,
        "71": 0,
        "72": 0,
        "73": 0,
        "74": 0
    },
    "triangleIndices": {
        "0": 1,
        "1": 0,
        "2": 2,
        "3": 1,
        "4": 2,
        "5": 3,
        "6": 1,
        "7": 3,
        "8": 4,
        "9": 4,
        "10": 3,
        "11": 5,
        "12": 5,
        "13": 3,
        "14": 6,
        "15": 6,
        "16": 3,
        "17": 2,
        "18": 6,
        "19": 2,
        "20": 7,
        "21": 6,
        "22": 7,
        "23": 8,
        "24": 8,
        "25": 7,
        "26": 9,
        "27": 8,
        "28": 9,
        "29": 10,
        "30": 8,
        "31": 10,
        "32": 6,
        "33": 6,
        "34": 10,
        "35": 5,
        "36": 5,
        "37": 10,
        "38": 11,
        "39": 11,
        "40": 10,
        "41": 9,
        "42": 11,
        "43": 9,
        "44": 12,
        "45": 11,
        "46": 12,
        "47": 13,
        "48": 11,
        "49": 13,
        "50": 5,
        "51": 5,
        "52": 13,
        "53": 14,
        "54": 5,
        "55": 14,
        "56": 4,
        "57": 4,
        "58": 14,
        "59": 15,
        "60": 15,
        "61": 14,
        "62": 16,
        "63": 16,
        "64": 14,
        "65": 17,
        "66": 17,
        "67": 14,
        "68": 13,
        "69": 17,
        "70": 13,
        "71": 12,
        "72": 17,
        "73": 12,
        "74": 18,
        "75": 17,
        "76": 18,
        "77": 16,
        "78": 16,
        "79": 18,
        "80": 19,
        "81": 16,
        "82": 19,
        "83": 20,
        "84": 16,
        "85": 20,
        "86": 15,
        "87": 15,
        "88": 20,
        "89": 21,
        "90": 15,
        "91": 21,
        "92": 22,
        "93": 15,
        "94": 22,
        "95": 23,
        "96": 15,
        "97": 23,
        "98": 4,
        "99": 4,
        "100": 23,
        "101": 24,
        "102": 4,
        "103": 24,
        "104": 1,
        "105": 1,
        "106": 24,
        "107": 0
    },
    "westIndices": {
        "0": 21,
        "1": 22
    },
    "northIndices": {
        "0": 19,
        "1": 20,
        "2": 21
    },
    "eastIndices": {
        "0": 0,
        "1": 2,
        "2": 7,
        "3": 9,
        "4": 12,
        "5": 18,
        "6": 19
    },
    "southIndices": {
        "0": 0,
        "1": 22,
        "2": 23,
        "3": 24
    },
    "extensions": {
        "vertexNormals": {
            "0": 93,
            "1": 204,
            "2": 93,
            "3": 204,
            "4": 93,
            "5": 204,
            "6": 93,
            "7": 204,
            "8": 93,
            "9": 204,
            "10": 93,
            "11": 204,
            "12": 93,
            "13": 204,
            "14": 95,
            "15": 209,
            "16": 99,
            "17": 219,
            "18": 106,
            "19": 212,
            "20": 100,
            "21": 211,
            "22": 98,
            "23": 206,
            "24": 94,
            "25": 204,
            "26": 93,
            "27": 204,
            "28": 93,
            "29": 204,
            "30": 93,
            "31": 204,
            "32": 93,
            "33": 204,
            "34": 93,
            "35": 204,
            "36": 93,
            "37": 204,
            "38": 93,
            "39": 204,
            "40": 93,
            "41": 204,
            "42": 94,
            "43": 204,
            "44": 93,
            "45": 204,
            "46": 93,
            "47": 204,
            "48": 93,
            "49": 204
        }
    }
}

// // 解码顶点数据
// let u = 0;
// let v = 0;
// let h = 0;
// const divideSum = 32767;
// const decodedVertexData = {};

// let currentIndex = 0; // 当前顶点索引

// for (const key in terrainTestData.vertexData) {
//     const index = parseInt(key);
//     const value = terrainTestData.vertexData[key];
//     switch (index % 3) {
//         case 0:
//             u += zigzagDecode(value);
//             break;
//         case 1:
//             v += zigzagDecode(value);
//             break;
//         case 2:
//             h += zigzagDecode(value);
//             const lon = terrainTestData.header.centerX + (u / divideSum) * (terrainTestData.header.boundingSphereRadius);
//             const lat = terrainTestData.header.centerY + (v / divideSum) * (terrainTestData.header.boundingSphereRadius);
//             const hei = terrainTestData.header.centerZ + (h / divideSum) * (terrainTestData.header.maxHeight - terrainTestData.header.minHeight);

//             decodedVertexData[currentIndex] = { lon, lat, hei };
//             currentIndex++;
//             break;
//     }
// }
// console.log('第一种输出解码后的对象数据:', decodedVertexData); // 输出解码后的对象数据

// const terrainData = ref(terrainTestData); // 将terrainTestData作为响应式数据

// // 提取必要参数
// const minx = ref(terrainData.value.header.centerX - 32767); // 示例计算，根据实际情况调整
// const maxx = ref(terrainData.value.header.centerX + 32767); // 示例计算，根据实际情况调整
// const miny = ref(terrainData.value.header.centerY - 32767); // 示例计算，根据实际情况调整
// const maxy = ref(terrainData.value.header.centerY + 32767); // 示例计算，根据实际情况调整
// const minHeight = ref(terrainData.value.header.minHeight);
// const maxHeight = ref(terrainData.value.header.maxHeight);

// // 提取顶点数据
// const vertexData = ref(Object.values(terrainData.value.vertexData));
// const vertexCount = ref(vertexData.value.length / 3); // 假设每三个数据为一个顶点的u, v, h

// // 解码地形数据
// function decodeTerrainVertices(uvh, vertexCount) {
//     let u = 0, v = 0, h = 0;
//     const divideSum = 32767;
//     let vertices = [] as { lon: number; lat: number; hei: number }[];

//     for (let i = 0; i < vertexCount; i++) {
//         u += zigzagDecode(uvh[i]);
//         v += zigzagDecode(uvh[vertexCount + i]);
//         h += zigzagDecode(uvh[vertexCount * 2 + i]);

//         let lon = minx.value + (u / divideSum) * (maxx.value - minx.value);
//         let lat = miny.value + (v / divideSum) * (maxy.value - miny.value);
//         let hei = minHeight.value + (h / divideSum) * (maxHeight.value - minHeight.value);

//         vertices.push({ lon, lat, hei });
//     }

//     return vertices;
// }

// onMounted(() => {
//     const decodedVertices = decodeTerrainVertices(vertexData.value, vertexCount.value);
//     // 这里可以处理解码后的顶点数据
//     console.log('第二种处理解码后的顶点数据:', decodedVertices);
// });

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


/**
 * 解求最大矩形框经纬度
 * @param objects 经纬度高度对象数组
 * @returns 最大矩形框的经纬度
 */
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


/**
 * 保留不重复的坐标点
 * @param objects 对象数组，每个对象包含两个数字，分别表示经度和纬度
 * @returns 返回一个对象数组，每个对象包含两个数字，分别表示不重复的经度和纬度
 */
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


/**
 * 解求terrain对应的层级与行列号
 * @param maxRectangle 最大矩形bbox
 * @returns 层级与行列号的数组
 */
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

/**
 * 
 * @param item 需要筛选的item
 * @returns 筛选出最大层级的结果
 */
const filterMaxLevel = (item) => {
    return item.xyl.level === maxLevel.value;
}

// 监听 TileInfo 的变化，对Ngnix下的terrain进行筛选
watch(TileInfo, (newTileInfo, oldTileInfo) => {
    if (newTileInfo.length >= 2) {
        const latlngArray = convertToLatLngArray(TileInfo.value);
        console.log('latlngArray数据:', latlngArray);
        const maxRectangle = calculateMaxRectangle(latlngArray);
        console.log('最大的矩形框范围：', maxRectangle);
        tileResults.value = calculateTilesForLevels(maxRectangle);
        console.log('解读得到的tileResults:', tileResults.value);

        // 使用 filter 方法筛选出 level 为 9 的数据,在 maxLevel.value 后面添加 ! 符号表示类型断言，告诉 TypeScript 这个值不会为 null。
        const maxlevelResults = tileResults.value.filter(item => item.xyl.level === maxLevel.value! - 1);
        console.log('maxLevel的数据：', maxlevelResults);

        // 使用 computed 属性去除重复数据
        const uniqueData = computed(() => {
            const uniqueSet = new Set();
            return maxlevelResults.filter(obj => {
                const str = JSON.stringify(obj);
                if (!uniqueSet.has(str)) {
                    uniqueSet.add(str);
                    return true;
                }
                return false;
            });
        });
        console.log('输出unique:', uniqueData.value);

        // 创建一个空数组来存储 URL
        let DEMurlArray: string[] = [];

        // 遍历对象数组并生成 URL 地址
        uniqueData.value.forEach(item => {
            const url = `http://localhost:3000/DEM/${item.xyl.level}/${item.xyl.x}/${item.xyl.y}.terrain`;

            // 将生成的 URL 存入数组
            DEMurlArray.push(url);
        });

        // 输出数组
        console.log('存储的 URL 地址数组：', DEMurlArray);

        // 解读terrain
        decodeTerrainArray(DEMurlArray);
    }
});
console.log('maxLevel.value:', maxLevel.value);

// --测试用例----------------------------------------------------------------------------------------
const latlngArray = convertToLatLngArray(originalObjects);
console.log('latlngArray数据:', latlngArray);
const maxRectangle = calculateMaxRectangle(latlngArray);
console.log('最大的矩形框范围：', maxRectangle);
tileResults.value = calculateTilesForLevels(maxRectangle);
console.log('解读得到的tileResults:', tileResults.value);

// 使用 filter 方法筛选出 level 为 9 的数据
const maxlevelResults = tileResults.value.filter(item => item.xyl.level === maxLevel.value! - 1);

// 输出筛选后的结果
console.log('Level 9 的数据：', maxlevelResults);

// 使用 computed 属性去除重复数据
const uniqueData = computed(() => {
    const uniqueSet = new Set();
    return maxlevelResults.filter(obj => {
        const str = JSON.stringify(obj);
        if (!uniqueSet.has(str)) {
            uniqueSet.add(str);
            return true;
        }
        return false;
    });
});
console.log('输出unique:', uniqueData.value);


// Url: http://localhost:3000/DEM/{maxlevelResults.xyl.level}/{maxlevelResults.xyl.x}/{maxlevelResults.xyl.y}.terrain

// 创建一个空数组来存储 URL
let DEMurlArray: string[] = [];

// 遍历对象数组并生成 URL 地址
uniqueData.value.forEach(item => {
    // const url = `http://localhost:3000/DEM/${item.xyl.level}/${item.xyl.x}/${item.xyl.y}.terrain`;
    const url = `public/${item.xyl.level}/${item.xyl.x}/${item.xyl.y}.terrain`;// 测试用，记得删

    // 将生成的 URL 存入数组
    DEMurlArray.push(url);
});

// 输出数组
console.log('存储的 URL 地址数组：', DEMurlArray);


// 解读terrain
const decodedDataArray = decodeTerrainArray(DEMurlArray);

console.log('输出解码后的数组decodedDataArray：', decodedDataArray);

// --测试用例----------------------------------------------------------------------------------------

/**
 * 计算每个对象的顶点数据的中心坐标以及每个顶点相对于中心坐标的坐标
 * @param obj 
 */
function calculateVertexCenterAndRelativeCoordinates(obj) {
    // 获取对象的中心坐标
    const centerX = obj.header.centerX;
    const centerY = obj.header.centerY;
    const centerZ = obj.header.centerZ;

    // 获取顶点数据数组
    const vertexData = obj.vertexData;

    // 初始化中心坐标和相对坐标的累加值
    let centerU = 0;
    let centerV = 0;
    let centerH = 0;
    let totalVertices = 0;

    // 遍历顶点数据数组
    for (let i = 0; i < vertexData.length; i += 3) {
        const u = vertexData[i];
        const v = vertexData[i + 1];
        const h = vertexData[i + 2];

        // 计算相对于中心坐标的坐标
        const relativeU = u - centerX;
        const relativeV = v - centerY;
        const relativeH = h - centerZ;

        // 累加相对坐标
        centerU += relativeU;
        centerV += relativeV;
        centerH += relativeH;
        totalVertices++;
    }

    // 计算中心坐标
    centerU /= totalVertices;
    centerV /= totalVertices;
    centerH /= totalVertices;

    // 返回中心坐标和相对坐标的累加值
    return {
        centerU,
        centerV,
        centerH,
    };
}


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


// const strData = '要导出的内容'
// const result = new Blob([strData], { type: 'text/plain;charset=utf-8' });
// const prepareExportData = () => {
//     let exportData = `{\n\t{\n\t\t[${allvexXYZ.value.longitude}, ${allvexXYZ.value.latitude}, ${allvexXYZ.value.height}]\n\t},\n\t{\n`;
//     cgcsCoordinates.value.forEach(coord => {
//         exportData += `\t[${coord.longitude}, ${coord.latitude}, ${coord.height} ]\n`;
//     });
//     exportData += `\t},\n}\n`;

//     return exportData;
// };
// /**
//  * txt导出
//  */
// const exportTxt = () => {
//     const strData = prepareExportData();
//     const result = new Blob([strData], { type: 'text/plain;charset=utf-8' });
//     saveAS(result, '中心坐标与顶点相对坐标.txt');
// };


// 暴露给父组件的方法
defineExpose({
    calculateTilesForLevels,
    showInfoFunction,
})

</script>

<style scoped>
.info-div {
    width: 620px;
    height: 630px;
    position: relative;
    top: 100px;
    margin-right: 60%;
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

.text-p {
    margin-bottom: 2px;
    /* 调整行间距大小，可以根据需要进行调整 */
    margin-top: 0;

}

.item-center {
    text-align: center;
    margin: auto;
}

#export-div {
    position: absolute;
    bottom: 7px;
    width: 90%;
    margin-top: 5px;
}
</style>