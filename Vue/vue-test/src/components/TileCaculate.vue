 <!--
 * @FileDescription: 计算坐标所对应的.terrain信息
 * @LastEditTime: 1.20
 -->
<template>
    <div class="info-div " v-if="showInfo">
        <h3>Terrain瓦片顶点相对坐标</h3>
        <el-scrollbar height="500px" class="rich-text">
            <p class="text-p">EPSG3857</p>
            <p class="text-p">{{ centerBbox.x }},{{ centerBbox.y }}</p>
            <p class="text-p">{{ epsg3857CoordsCenter[0] }},{{ epsg3857CoordsCenter[1] }}</p>
            <p class="text-p" v-for="(obj, index) in relativeCoordinatesArray" :key="index">
            <p class="text-p" v-for="(point, pointIndex) in obj" :key="pointIndex">
                {{ point.x }},{{ point.y }},{{ point.z }}<br />
            </p>
            </p>
        </el-scrollbar>
        <div class="item-center " id="export-div">
            <el-button round size="large" @click="exportTxt">导 出</el-button>
        </div>
        <!-- 窗口右上角关闭按钮svg -->
        <i class="el-icon closeBtn" @click="showInfo = false" >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
                <path fill="currentColor"
                    d="M764.288 214.592 512 466.88 259.712 214.592a31.936 31.936 0 0 0-45.12 45.12L466.752 512 214.528 764.224a31.936 31.936 0 1 0 45.12 45.184L512 557.184l252.288 252.288a31.936 31.936 0 0 0 45.12-45.12L557.12 512.064l252.288-252.352a31.936 31.936 0 1 0-45.12-45.184z" />
            </svg>
        </i>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useStore } from "vuex";
import axios from 'axios';
import saveAS from 'file-saver';
// 在浏览器环境中导入 file-saver
import { saveAs } from 'file-saver';
import decode, { DECODING_STEPS } from '@here/quantized-mesh-decoder';// 导入 quantized-mesh-decoder 库
import proj4 from 'proj4';
import { ElScrollbar } from 'element-plus'

// 定义EPSG:4978（ECEF坐标系）
proj4.defs('EPSG:4978', '+proj=geocent +datum=WGS84 +units=m +no_defs');

// 最大层级
const maxLevel = ref<number | null>(null); // 初始化为null
let minLon = ref()
let maxLon = ref()
let minLat = ref()
let maxLat = ref()

maxLevel.value = 9 //先暂定最大层数为10（0-9）
// --发起HTTP请求,通过meta.json文件获取最大层级------------
// axios.get('http://localhost:3000/DEM/meta.json')
//     .then(response => {
//         // 请求成功，将响应数据log出来
//         console.log('Response Data:', response.data);
//         console.log('最大层级0-', response.data.maxzoom);
//         maxLevel.value = response.data.maxzoom; // 将maxLevel赋值

//     })
//     .catch(error => {
//         // 请求出错，log出错误信息
//         console.error('Request Error:', error);
//     });
// --发起HTTP请求,通过meta.json文件获取最大层级------------

const originX = -180; // 原点经度
const originY = -90; // 原点纬度
const xsize = ref();// 计算得到的xyz范围
const ysize = ref();
const XsameUrls = <any>[]; //x相同方向的Url数组
const YsameUrls = <any>[]; //y相同方向的Url数组
const XsizeTerrainArray = <any>[]; //存储x方向的Terrain解析数据数组
const YsizeTerrainArray = <any>[]; //存储y方向的Terrain解析数据数组
const XYsizeRangeArray = <any>[]; //14级瓦片计算范围
// 定义变量来存储wgs84Coords数据
let wgs84SameXCoords = [];
let wgs84SameYCoords = [];
let epsg3857CoordsCenter = ref();//最大矩形框中心的3857坐标
let relativeCoordinatesArray = ref();//顶点相对矩形框中心的3857相对坐标
let epsg3857terrainCenter = ref();//瓦片中心的3957坐标数组
let centerBbox = ref() //最大矩形框的经纬度坐标

const SZU = false
//最大矩形框的3857范围
let minMaxValues
//最大矩形框的3857坐标
let maxRectangle3857

// 定义一个格式化数字的函数
const formatNumber = (value) => {
    // 使用 toFixed 方法保留4位小数并将其转换为字符串
    return parseFloat(value).toFixed(5);
};
/**
 * 获取y方向瓦片范围
 * @param urlArray 包含多个terrain地形文件URL的数组
 * @returns 解码后的数据数组
 */
const YsizeDecodeTerrainArray = async (urlArray) => {
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

        // 获得各瓦片的中心点
        const CenterXYZ = terrainCenterXYZ(decodedDataArray);
        // console.log('x相同瓦片中心坐标：', CenterXYZ);

        let rangeReslut
        if (SZU) {
            // 计算在ECEF下的范围
            rangeReslut = calculateXRangeECEF_SZU(CenterXYZ);
            console.log('X相同下的ECEF范围：', rangeReslut);
            XYsizeRangeArray.push(rangeReslut)
        }

        // 使用函数将ECEF坐标转换为WGS84坐标数组
        wgs84SameXCoords = ecefToWGS84(CenterXYZ);
        // console.log('x相同y范围WGS84坐标数组：', wgs84SameXCoords);
        // 计算每个瓦片中心的y的范围
        ysize.value = calculateYRange(wgs84SameXCoords)
        console.log('通过原始瓦片计算得到的y范围：', ysize.value);

        return wgs84SameXCoords;
    } catch (error) {
        console.error('处理 .terrain 文件时发生错误:', error);
        return null;
    }
};
/**
 * 获取x方向瓦片范围
 * @param urlArray 包含多个terrain地形文件URL的数组
 * @returns 解码后的数据数组
 */
const XsizeDecodeTerrainArray = async (urlArray) => {
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

        // 获得各瓦片的中心点
        const CenterXYZ = terrainCenterXYZ(decodedDataArray);
        console.log('y相同瓦片中心坐标：', CenterXYZ);

        let rangeReslut
        if (SZU) {
            // 计算在ECEF下的范围
            rangeReslut = calculateYRangeECEF_SZU(CenterXYZ);
            console.log('y相同下的ECEF范围：', rangeReslut);
            XYsizeRangeArray.push(rangeReslut)
        }

        // 使用函数将ECEF坐标转换为WGS84坐标数组
        wgs84SameYCoords = ecefToWGS84(CenterXYZ);
        // console.log('y相同x范围WGS84坐标数组：', wgs84SameYCoords);
        // 计算每个瓦片中心的x的范围
        xsize.value = calculateXRange(wgs84SameYCoords)
        console.log('通过原始瓦片计算得到的x范围：', xsize.value);

        return wgs84SameYCoords;
    } catch (error) {
        console.error('处理 .terrain 文件时发生错误:', error);
        return null;
    }
};


// 先计算每个tile的边界范围,egnix下
const calculateXYsize = () => {
    const XsizeUrls = <any>[];
    const YsizeUrls = <any>[];

    // 循环生成 URL 并添加到数组中
    for (let i = 10; i <= 20; i++) {
        const urlx = `http://localhost:3000/DEM/${maxLevel.value}/0/${i}.terrain`;

        const urly = `http://localhost:3000/DEM/${maxLevel.value}/${i}/10.terrain`;
        XsizeUrls.push(urlx);
        YsizeUrls.push(urly);
    }
    YsizeDecodeTerrainArray(XsizeUrls)
    XsizeDecodeTerrainArray(YsizeUrls)

}
calculateXYsize(); // 部署egnix下记得打开-------------------------------------------------

// --测试用例--------------------------------------------------------------------------------
// 先计算每个tile的边界范围,
const calculateXYsizeTest = () => {
    // -----深圳大学测试用例--------
    if (SZU) {
        for (let i = 18489; i <= 18491; i++) {
            const urlx = `public/15/26753/${i}.terrain`;
            XsameUrls.push(urlx);
        }
        for (let i = 26753; i <= 26754; i++) {
            const urly = `public/15/${i}/18489.terrain`;
            YsameUrls.push(urly);
        }
    } else {
        // 循环生成 URL 并添加到数组中,
        for (let i = 10; i <= 110; i++) {
            const urlx = `public/${maxLevel.value}/0/${i}.terrain`;
            XsameUrls.push(urlx);
        }
        for (let i = 834; i <= 838; i++) {
            const urly = `public/${maxLevel.value}/${i}/288.terrain`;
            YsameUrls.push(urly);
        }
    }

    // console.log('XsameUrls', XsameUrls);
    // console.log('YsameUrls', YsameUrls);
    YsizeDecodeTerrainArray(XsameUrls)
    XsizeDecodeTerrainArray(YsameUrls)
}

// calculateXYsizeTest(); // 计算瓦片的xyz范围
// --测试用例--------------------------------------------------------------------------------

// 计算每个点相对于中心点的坐标并保留 z 坐标
const calculateRelativeCoordinates3857 = (point, center) => {
    const deltaX = point.x - center[0];
    const deltaY = point.y - center[1];
    return { "x": deltaX, "y": deltaY, "z": point.z };
};


/**
 * 解码单个terrain地形
 */
const decodeTerrain = () => {
    // 文件的URL
    const fileUrl = 'public/14/13376/9244.terrain';

    // 使用axios来获取文件数据
    axios.get(fileUrl, { responseType: 'arraybuffer' })
        .then(response => {
            // 获取到的数据是ArrayBuffer格式
            const arrayBuffer = response.data;

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

// decodeTerrain();

// 顶点坐标
const cgcsCoordinates = ref<any>([]);
// const allvexXYZ = ref();
interface Coordinate {
    longitude: number;
    latitude: number;
    height: number;
}
const allvexXYZ: Coordinate[] = [];

// 初始化整体中心坐标的累加值
// const xsize = 0.350877192982456; // 瓦片宽度
// const ysize = 0.3515625000000071; // 瓦片高度

let allVertices_3857 = <any>[]; // 存储所有顶点坐标的数组(3857)
const allTerrainData = <any>[]; // 存储所有地形数据的数组


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

        console.log('全部的terrain数据：', decodedDataArray);

        // 获得各瓦片的中心点
        const BboxCenterXYZ = terrainCenterXYZ(decodedDataArray);
        console.log('瓦片中心坐标：', BboxCenterXYZ);

        // 使用函数将ECEF坐标转换为WGS84坐标数组
        const wgs84Coords = ecefToWGS84(BboxCenterXYZ);
        console.log('瓦片中心坐标WGS84坐标数组：', wgs84Coords);

        // 将瓦片中心坐标转为EPSG:3857坐标
        epsg3857terrainCenter.value = wgs84Coords.map(coord => wgs84To3857(coord.lon, coord.lat, coord.alt));
        console.log('瓦片中心坐标EPSG:3857坐标数组：', epsg3857terrainCenter.value);

        let rangeArray
        if (!SZU) {
            // 根据9块瓦片计算各自之间的范围
            rangeArray = calculateCenterAverages(BboxCenterXYZ);
        } else {
            // --根据14级瓦片计算范围
            rangeArray = XYsizeRangeArray
        }

        // 创建一个数组用于存储瓦片范围
        const tileRanges = <any>[];
        const allvexArrayECEF = <any>[];
        console.log('xy范围数组(半瓦片长宽）：', rangeArray);
        let i = 0;
        // 计算每个瓦片的范围
        decodedDataArray.forEach(oneTerrainData => {
            let Xmin, Xmax, Ymin, Ymax
            if (SZU) {
                // 同列情况
                Xmin = oneTerrainData.header.centerX - rangeArray[1].avgXsizeECEF_sameY
                Xmax = oneTerrainData.header.centerX + rangeArray[1].avgXsizeECEF_sameY
                // 同一行的情况
                Ymin = oneTerrainData.header.centerY - rangeArray[0].avgYsizeECEF_sameX
                Ymax = oneTerrainData.header.centerY + rangeArray[0].avgYsizeECEF_sameX
            } else {
                // 同列情况
                Xmin = oneTerrainData.header.centerX - rangeArray.avgXsizeECEF_sameX
                Xmax = oneTerrainData.header.centerX + rangeArray.avgXsizeECEF_sameX
                // 同一行的情况
                Ymin = oneTerrainData.header.centerY - rangeArray.avgYsizeECEF_sameY
                Ymax = oneTerrainData.header.centerY + rangeArray.avgYsizeECEF_sameY

            }
            // console.log('该块范围：', Xmin, Xmax, Ymin, Ymax);


            // 计算顶点坐标ECEF
            // const vexArrayECEF = ref(calculateVerticesCoordinates(oneTerrainData, Xmin, Xmax, Ymin, Ymax)) // 通过相对ECEF计算
            const vexArrayECEF = ref(calculateVerticesCoordinatesLonLat(oneTerrainData, wgs84Coords[i], xsize.value, ysize.value)) // 通过相对经纬度计算
            console.log('计算顶点坐标WGS84', vexArrayECEF.value);
            allvexArrayECEF.push(vexArrayECEF.value)

            // 计算相对坐标和deltaH值，并添加到顶点坐标数组中，返回一个新数组，包含所有瓦片的顶
            let verticesRelativeECEF, wgs84Vertices
            let ECEF = false
            if (SZU) {
                console.log('szu测试');
                verticesRelativeECEF = calculateRelativeCoordinates(oneTerrainData, vexArrayECEF.value, 2 * rangeArray[1].avgXsizeECEF_sameY, 2 * rangeArray[0].avgYsizeECEF_sameX, xsize.value, ysize.value);
                console.log('顶点坐标数组（相对坐标）：', verticesRelativeECEF);

                wgs84Vertices = addDeltaUVDeltaH(wgs84Coords[i], verticesRelativeECEF)
                // console.log('顶点的相对坐标（wgs84）', wgs84Vertices);
                allvexArrayECEF.push(wgs84Vertices)
            } else if (ECEF) {
                verticesRelativeECEF = calculateRelativeCoordinates(oneTerrainData, vexArrayECEF.value, 2 * rangeArray.avgXsizeECEF_sameX, 2 * rangeArray.avgYsizeECEF_sameY, xsize.value, ysize.value);
                console.log('顶点坐标数组（相对坐标）：', verticesRelativeECEF);

                wgs84Vertices = addDeltaUVDeltaH(wgs84Coords[i], verticesRelativeECEF)
                // console.log('顶点的相对坐标（wgs84）', wgs84Vertices);
                allvexArrayECEF.push(wgs84Vertices)
            }

            // 创建包含范围的对象并添加到数组中
            const tileRange = {
                Xmin,
                Xmax,
                Ymin,
                Ymax,
            };
            tileRanges.push(tileRange);
            i++;
        })
        console.log('顶点坐标数组：（wgs84）', allvexArrayECEF);

        // 将 WGS84 坐标转换为 EPSG:3857 坐标
        // 执行坐标转换
        let convertedCoordinates
        if (SZU) {
            convertedCoordinates = allvexArrayECEF[0].map(coord => {
                const convertedCoord = proj4("EPSG:4326", "EPSG:3857", [coord.x, coord.y]);
                return { x: convertedCoord[0], y: convertedCoord[1], z: coord.z };
            });
        } else {
            // 使用嵌套的循环来转换坐标
            convertedCoordinates = allvexArrayECEF.map(innerArray => {
                return innerArray.map(coord => {
                    const convertedCoord = proj4('EPSG:4326', 'EPSG:3857', [coord.x, coord.y]);
                    return { x: convertedCoord[0], y: convertedCoord[1], z: coord.z };
                });
            });
        }

        // 输出转换后的坐标
        console.log('顶点坐标数组：（3857）:', convertedCoordinates);

        console.log('筛选范围:', minMaxValues.minX, minMaxValues.maxX, minMaxValues.minY, minMaxValues.maxY);
        // 对3857进行筛选
        // 根据范围筛选对象
        const filteredData = convertedCoordinates.map(obj => {
            return obj.filter(point => {
                return (
                    point.x >= minMaxValues.minX - 1000 &&
                    point.x <= minMaxValues.maxX + 1000 &&
                    point.y >= minMaxValues.minY - 1000 &&
                    point.y <= minMaxValues.maxY + 1000
                );
            });
        });
        console.log('筛选后的对象：', filteredData);



        // 计算矩形框中心的3857相对坐标
        if (SZU) {
            relativeCoordinatesArray.value = filteredData.map(point => {
                const deltaX = point.x - epsg3857CoordsCenter.value[0];
                const deltaY = point.y - epsg3857CoordsCenter.value[1];
                return { x: deltaX, y: deltaY, z: point.z };
            });
        } else {
            // 计算相对坐标
            relativeCoordinatesArray.value = filteredData.map(pointArray => {
                return pointArray.map(point => {
                    const deltaX = point.x - epsg3857CoordsCenter.value[0];
                    const deltaY = point.y - epsg3857CoordsCenter.value[1];
                    return { x: deltaX, y: deltaY, z: point.z };
                });
            });
        }

        // 输出相对坐标数组
        console.log('顶点相对矩形框中心的3857相对坐标', relativeCoordinatesArray.value);


        // const filteredPoints = computed(() => {
        //     return allvexArrayECEF.map(arr => {
        //         // 对每个数组内的点进行筛选
        //         return arr.filter(point => {
        //             return (
        //                 point.x >= minLon.value - 0.1 &&
        //                 point.x <= maxLon.value + 0.1 &&
        //                 point.y >= minLat.value - 0.1 &&
        //                 point.y <= maxLat.value + 0.1
        //             );
        //         });
        //     });
        // });
        // allVertices = filteredPoints.value

        // console.log('筛选后的对象：', filteredPoints.value);
        //---------------------------------------------------------


        // 转换坐标数组，排除空数组和空对象
        // const transformedArray = filteredPoints.value
        //     .filter(innerArray => innerArray.length > 0) // 排除空数组
        //     .map(innerArray => {
        //         return innerArray
        //             .filter(coord => Object.keys(coord).length > 0) // 排除空对象
        //             .map(coord => transformTo3857Array(coord));
        //     });
        // console.log('转换后的坐标数组：', transformedArray);


        return cgcsCoordinates.value, allTerrainData, relativeCoordinatesArray.value;
    } catch (error) {
        console.error('处理 .terrain 文件时发生错误:', error);
        return null;
    }
};

// 定义ECEF到WGS84的转换函数
const ecefToWgs84 = (u, v, h) => {
    const ecefProjection = '+proj=geocent +datum=WGS84 +units=m +no_defs';
    const wgs84Projection = '+proj=longlat +datum=WGS84 +no_defs';
    const [longitude, latitude] = proj4(ecefProjection, wgs84Projection, [u, v, h]);
    return { longitude, latitude, h };
};

// 定义WGS84到EPSG:3857的转换函数
const wgs84To3857 = (longitude, latitude, h) => {
    const wgs84Projection = '+proj=longlat +datum=WGS84 +no_defs';
    const epsg3857Projection = '+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext +no_defs';
    const [x, y] = proj4(wgs84Projection, epsg3857Projection, [longitude, latitude]);
    return { x, y, h };
};

// // 使用 computed 属性筛选有值的点
// const filteredData = computed(() => {
//     return allVertices.value.map(item => item.filter(point => point.x !== undefined && point.y !== undefined && point.z !== undefined));
// });

// // 监听 allVertices 变化
// watch(allVertices, (newallVertices, oldallVertices) => {
//     console.log('筛选后的范围内顶点数组', filteredData.value);
// });
/**
 * 对含多数组的对象进行范围筛选
 * @param data 传入的顶点坐标数组
 * @param minX 范围
 * @param minY 
 * @param maxX 
 * @param maxY 
 */
const filterPointsByRange = (data, minX, minY, maxX, maxY) => {
    const filteredData = data.filter(point => {
        const { x, y } = point;
        return x >= minX && x <= maxX && y >= minY && y <= maxY;
    });
    return filteredData;
};



/**
 * 计算x方向上的瓦片范围
 * @param sameYArray 中心点对象数组
 * @returns 相邻两个瓦片的x方向范围数值
 */
const calculateXRange = (sameYArray) => {
    let sumXRange = 0; // 用于累加x范围的总和

    for (let i = 0; i < sameYArray.length - 1; i++) {
        const centerX1 = sameYArray[i].lon;
        const centerX2 = sameYArray[i + 1].lon;
        const xRange = centerX2 - centerX1; // 计算x方向上的瓦片范围*2

        sumXRange += xRange;
    }
    // 计算 XRange 属性的均值
    const averageXRange = Math.abs(sumXRange / (sameYArray.length - 1));
    return averageXRange; // 返回x方向均值范围
}

/**
 * 计算y方向上的瓦片范围
 * @param sameXArray 中心点对象数组
 * @returns 相邻两个瓦片的y方向范围数值
 */
const calculateYRange = (sameXArray) => {
    let sumYRange = 0; // 用于累加y范围的总和

    for (let i = 0; i < sameXArray.length - 1; i++) {
        const centerY1 = sameXArray[i].lat;
        const centerY2 = sameXArray[i + 1].lat;

        const yRange = centerY1 - centerY2;

        // 在同一个循环中累加y范围
        sumYRange += yRange;
    }

    // 计算 yRange 属性的均值
    const averageYRange = Math.abs(sumYRange / (sameXArray.length - 1));
    return averageYRange; // 返回y方向均值范围
};



/**
 * 经纬度转terrain瓦片行列号(单个点)
 * @param latitude 纬度
 * @param longitude 经度
 * @param zoom 缩放等级
 */
const latLonToTMS = (latitude, longitude, zoom) => {
    const xTile = Math.floor((longitude + 180) / 360 * Math.pow(2, zoom));
    const yTile = Math.floor((1 - Math.log(Math.tan(latitude * Math.PI / 180) + 1 / Math.cos(latitude * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom));
    const yTileTMS = Math.pow(2, zoom) - yTile - 1; // TMS格式的y坐标与Google Maps相反
    return { x: xTile, y: yTileTMS };
};

/**
 * 将最大矩形框的行列号转为瓦片行列号
 * @param coordinates 最大矩形框数组
 * @param zoom 缩放层级
 */
const convertCoordinatesToTMS = (coordinates, zoom) => {
    const tmsCoordinates = new Set();

    for (const [longitude, latitude] of coordinates) {
        const tms = latLonToTMS(latitude, longitude, zoom);
        tmsCoordinates.add(JSON.stringify(tms)); // 使用 JSON.stringify 将坐标对象转换为字符串
    }

    // 转换回数组
    const uniqueTMSArray = [...tmsCoordinates].map(str => JSON.parse(str as string));

    return uniqueTMSArray;
};




/**

 * 计算给定坐标数组中每个坐标点的瓦片行列号，并将不重复的结果存储在一个数组中
 * @param {Array} coordinates 坐标数组，每个坐标为 [longitude, latitude]
 * @param {number} xsize 瓦片宽度
 * @param {number} ysize 瓦片高度
 * @param {number} originX 原点经度
 * @param {number} originY 原点纬度
 * @returns {Array} 包含不重复瓦片行列号的数组
 */
const calculateUniqueTileXY = (coordinates, xsize, ysize, originX, originY) => {
    const uniqueTiles = new Set(); // 用于存储不重复的瓦片行列号
    console.log("计算瓦片行列号...", xsize, ysize);


    coordinates.forEach(coordinate => {
        const [longitude, latitude] = coordinate;
        let xTile = Math.floor((longitude - originX) / xsize) - 1;
        let yTile = Math.floor((originY - latitude) / ysize) + 1;
        console.log('得到的:', xTile, yTile);


        const totalColumns = Math.ceil((360 / xsize));

        if (xTile < 0) {
            xTile += totalColumns;
        }
        if (yTile < 0) {
            yTile = Math.abs(yTile);
        }

        // 添加当前行列号
        uniqueTiles.add(JSON.stringify({ x: xTile, y: yTile }));
        // 添加当前行列号的上方相邻行列号
        if (yTile > 0) {
            uniqueTiles.add(JSON.stringify({ x: xTile, y: yTile - 1 }));
            uniqueTiles.add(JSON.stringify({ x: xTile, y: yTile + 1 }));
        }

        // 添加当前行列号的左边相邻行列号
        if (xTile > 0) {
            uniqueTiles.add(JSON.stringify({ x: xTile - 1, y: yTile - 1 }));
            uniqueTiles.add(JSON.stringify({ x: xTile - 1, y: yTile }));
            uniqueTiles.add(JSON.stringify({ x: xTile - 1, y: yTile + 1 }));
            uniqueTiles.add(JSON.stringify({ x: xTile + 1, y: yTile - 1 }));
            uniqueTiles.add(JSON.stringify({ x: xTile + 1, y: yTile }));
            uniqueTiles.add(JSON.stringify({ x: xTile + 1, y: yTile + 1 }));

        }
    });


    return Array.from(uniqueTiles).map(tile => JSON.parse(tile as string));
};

/**
 * 计算均值
 */
const averageDeltaCenter = ((deltaCenter) => {
    const sumCenter = deltaCenter.reduce((acc, value) => acc + value, 0);
    return sumCenter / deltaCenter.length;
});

/**
 * 计算框选瓦片的范围
 * @param {Array} objects 对象数组，每个对象应包含 centerX 和 centerY 属性
 * @returns {Object} 包含两个中值的对象，{ centerYAverage: centerY 中值, centerXAverage: centerX 中值 }
 */
const calculateCenterAverages = (objects) => {
    const minmaxrangeXY = <any>[];

    // 第一个对象为中心
    const centerObject = objects[0];
    // 当行号x相同时：
    // 提取第3到第5个对象
    let sumXsizeECEF = 0;
    let sumYsizeECEF = 0;
    for (let i = 3; i < 5; i++) {
        const sameX_XsizeECEF = objects[i + 1].centerX - objects[i].centerX
        const sameX_YsizeECEF = objects[i + 1].centerY - objects[i].centerY
        sumXsizeECEF += sameX_XsizeECEF;
        sumYsizeECEF += sameX_YsizeECEF;
    }
    const avgXsizeECEF_sameX = sumXsizeECEF / 4;
    const avgYsizeECEF_sameX = sumYsizeECEF / 4;
    console.log('当行号相同时计算得到的范围参数：', avgXsizeECEF_sameX, avgYsizeECEF_sameX);

    // 当列号y相同时：
    const avgXsizeECEF_sameY = (objects[7].centerX - objects[4].centerX) / 4;
    let avgYsizeECEF_sameY = (objects[7].centerY - objects[4].centerY) / 4;
    console.log('当列号相同时计算得到的范围参数：', avgXsizeECEF_sameY, avgYsizeECEF_sameY);
    // 将结果添加到数组
    const result = { avgXsizeECEF_sameX, avgYsizeECEF_sameX, avgXsizeECEF_sameY, avgYsizeECEF_sameY };
    minmaxrangeXY.push(result);

    return result;
};

/**
 * 计算在ECEF下的瓦片范围
 * @param objects 传入瓦片中心的ECEF坐标对象数组
 */
const calculateXRangeECEF_SZU = (objects) => {
    let sumXrange = 0
    let sumYrange = 0
    for (let i = 0; i < objects.length - 1; i++) {
        sumXrange = objects[i + 1].centerX - objects[i].centerX
        sumYrange = objects[i + 1].centerY - objects[i].centerY
    }
    const avgXsizeECEF_sameX = sumXrange / (objects.length - 1)
    const avgYsizeECEF_sameX = sumYrange / (objects.length - 1)
    const result = { avgXsizeECEF_sameX, avgYsizeECEF_sameX }
    return result;
}
const calculateYRangeECEF_SZU = (objects) => {
    let sumXrange = 0
    let sumYrange = 0
    for (let i = 0; i < objects.length - 1; i++) {
        sumXrange = objects[i + 1].centerX - objects[i].centerX
        sumYrange = objects[i + 1].centerY - objects[i].centerY
    }
    const avgXsizeECEF_sameY = sumXrange / (objects.length - 1)
    const avgYsizeECEF_sameY = sumYrange / (objects.length - 1)
    const result = { avgXsizeECEF_sameY, avgYsizeECEF_sameY }
    return result;
}

/**
 * 计算在x相同时的范围参数
 */
const calculateCenterAveragesXRange = (data) => {
    const rangeArray = <any>[];

    for (let i = 1; i < data.length; i++) {
        const prev = data[i - 1];
        const current = data[i];
        const deltaX = current.centerX - prev.centerX;
        const deltaY = current.centerY - prev.centerY;

        const avgXszieECEF_sameX = deltaX / (i - 1);
        const avgYszieECEF_sameX = deltaY / (i - 1);

        rangeArray.push({ avgXszieECEF_sameX, avgYszieECEF_sameX });
    }

    return rangeArray;
}


// 保留其centerX、centerY、centerZ
const terrainCenterXYZ = (decodeTerrainArray) => {
    const terrainCenterXYZArray = <any>[]; // 创建一个数组来存储解码后的地形数据和中心点坐标
    for (let i = 0; i < decodeTerrainArray.length; i++) {
        const terrainData = decodeTerrainArray[i];
        const centerX = terrainData.header.centerX;
        const centerY = terrainData.header.centerY;
        const centerZ = terrainData.header.centerZ;
        terrainCenterXYZArray.push({
            centerX: centerX,
            centerY: centerY,
            centerZ: centerZ
        });
    }
    return terrainCenterXYZArray;
}

// ECEF坐标转换为WGS84坐标的函数
const ecefToWGS84 = (ecefArray) => {
    const wgs84Array = ecefArray.map(ecef => {
        const wgs84 = proj4(proj4.defs('EPSG:4978'), proj4.defs('WGS84'), [ecef.centerX, ecef.centerY, ecef.centerZ]);
        return { lon: wgs84[0], lat: wgs84[1], alt: wgs84[2] };
    });
    return wgs84Array;
};
// ECEF坐标转换为WGS84坐标的函数
const vexecefToWGS84 = (ecefArray) => {
    const wgs84Array = ecefArray.map(ecef => {
        const wgs84 = proj4(proj4.defs('EPSG:4978'), proj4.defs('WGS84'), [ecef.u, ecef.v, ecef.h]);
        return { lon: wgs84[0], lat: wgs84[1], alt: wgs84[2] };
    });
    return wgs84Array;
};
// ECEF坐标转WGS84坐标的函数
const ecefToWGS84Array = (ecefArray) => {
    return ecefArray.map(({ u, v, h }) => {
        const a = 6378137.0; // WGS-84椭球体长半轴
        const f = 1 / 298.257223563; // 扁率
        const b = a * (1 - f); // 短半轴
        const e = Math.sqrt((a * a - b * b) / (a * a));
        const asq = Math.pow(a, 2);
        const bsq = Math.pow(b, 2);
        const ep = Math.sqrt((asq - bsq) / bsq);
        const p = Math.sqrt(Math.pow(u, 2) + Math.pow(v, 2));
        const th = Math.atan2(a * h, b * p);

        const lon = Math.atan2(v, u);
        const lat = Math.atan2((h + ep * ep * b * Math.pow(Math.sin(th), 3)), (p - e * e * a * Math.pow(Math.cos(th), 3)));
        const n = a / Math.sqrt(1 - e * e * Math.sin(lat) * Math.sin(lat));
        const alt = p / Math.cos(lat) - n;

        return { lon: lon * 180 / Math.PI, lat: lat * 180 / Math.PI, alt: h };
    });
};
// 定义ECEF到WGS 1984 UTM Zone 49N的转换
const ecefToUtm49N = (u, v, h) => {
    // ECEF的投影定义
    const ecefProjection = '+proj=geocent +datum=WGS84 +units=m +no_defs';

    // WGS 1984 UTM Zone 49N的投影定义
    const utm49NProjection = '+proj=utm +zone=49 +datum=WGS84 +units=m +no_defs +north';

    // 转换坐标
    const [x, y, altitude] = proj4(ecefProjection, utm49NProjection, [u, v, h]);

    return { x, y, altitude };
};
/**
 * 计算lon间瓦片范围
 * @param coordinates 传入wgs84坐标瓦片中心数组，0-4分别为0：中心、1：下、2：上、3：左、4：右
 */
const calculateAverageLonDifference = (coordinates) => {
    const lonRange1 = coordinates[4].lon - coordinates[0].lon
    const lonRange2 = coordinates[0].lon - coordinates[3].lon
    const averageDifference = (lonRange1 + lonRange2) / 2;
    return averageDifference;
};
2
/**
 * 计算lat之间差值均值
 * @param coordinates 传入wgs84坐标瓦片中心数组，0-4分别为0：中心、1：下、2：上、3：左、4：右
 */
const calculateAverageLatDifference = (coordinates) => {
    const latRange1 = coordinates[2].lat - coordinates[0].lat;
    const latRange2 = coordinates[0].lat - coordinates[1].lat;
    const averageDifference = (latRange1 + latRange2) / 2;
    return averageDifference;
};



/**
 * 根据瓦片范围反算出顶点的经纬度坐标
 * @param decodedData 传入的瓦片数据
 * @param minX 瓦片的范围
 * @param maxX 
 * @param minY 
 * @param maxY 
 * @param centerH 中心点高度
 */
const calculateVerticesCoordinates = (decodedData, minX, maxX, minY, maxY) => {
    const maxHeight = decodedData.header.maxHeight; // 最大高度
    const minHeight = decodedData.header.minHeight; // 最小高度

    const coordinates = <any>[];
    const vertexCount = decodedData.vertexData.length / 3;

    for (let i = 0; i < vertexCount; i++) {
        const u = minX + (decodedData.vertexData[i] / 32767) * (maxX - minX);
        const v = minY + (decodedData.vertexData[i + vertexCount] / 32767) * (maxY - minY);
        const h = minHeight + (decodedData.vertexData[i + 2 * vertexCount] / 32767) * (maxHeight - minHeight);

        coordinates.push({ u, v, h });
    }

    return coordinates;
}

/**
 * 根据瓦片经纬度范围进行32767插值计算顶点经纬度坐标
 * @param decodedData 传入的单瓦片经纬度数据
 * @param minX 
 * @param maxX 
 * @param minY 
 * @param maxY 
 */
const calculateVerticesCoordinatesLonLat = (decodedDataLonlat, wgs84CoordsArray, xsize, ysize) => {
    const maxHeight = decodedDataLonlat.header.maxHeight; // 最大高度
    const minHeight = decodedDataLonlat.header.minHeight; // 最小高度
    const mimLon = wgs84CoordsArray.lon - xsize / 2;
    const maxLon = wgs84CoordsArray.lon + xsize / 2;
    const minLat = wgs84CoordsArray.lat - ysize / 2;
    const maxLat = wgs84CoordsArray.lat + ysize / 2;

    const coordinates = <any>[];
    const vertexCount = decodedDataLonlat.vertexData.length / 3;

    for (let i = 0; i < vertexCount; i++) {
        const x = mimLon + (decodedDataLonlat.vertexData[i] / 32767) * xsize;
        const y = minLat + (decodedDataLonlat.vertexData[i + vertexCount] / 32767) * ysize;
        const z = minHeight + (decodedDataLonlat.vertexData[i + 2 * vertexCount] / 32767) * (maxHeight - minHeight);

        coordinates.push({ x, y, z });
    }

    return coordinates;
}

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


/**计算各顶点相对于瓦片中心的相对坐标，仅相对于ECEF下的xy
 * @param terrain 瓦片数据
 * @param vertices 解求得到的顶点数据
 * @param xRang 瓦片经度范围
 * @param yRang 瓦片纬度范围
 * @param averageLonDifference 平均经度差
 * @param averageLatDifference 平均纬度差
 */
const calculateRelativeCoordinates = (terrain, vertices, xRang, yRang, averageLonDifference, averageLatDifference) => {
    const { centerX, centerY } = terrain.header;

    const relativeCoordinates = vertices.map((vertex) => {
        const { u, v, h } = vertex;
        const deltaU = ((u - centerX) / xRang) * averageLatDifference;
        const deltaV = ((v - centerY) / yRang) * averageLonDifference;
        const deltaH = h;

        return { deltaU, deltaV, deltaH };
    });

    return relativeCoordinates;
};


/**计算各顶点相对于瓦片中心的相对坐标，仅相对于ECEF下的xy
 * @param terrain 瓦片数据
 * @param vertices 解求得到的顶点数据
 * @param xRang 瓦片ECEFx范围
 * @param yRang 瓦片ECEFy范围
 * @param averageLonDifference 瓦片平均经度差
 * @param averageLatDifference 瓦片平均纬度差
 */
const calculateRelativeCoordinatesSZU = (terrain, vertices, xRang, yRang, averageLonDifference, averageLatDifference) => {
    const { centerX, centerY } = terrain.header;

    const relativeCoordinates = vertices.map((vertex) => {
        const { u, v, h } = vertex;
        const deltaU = ((u - centerX) / xRang);
        const deltaV = ((v - centerY) / yRang);
        const deltaH = h;

        return { deltaU, deltaV, deltaH };
    });

    return relativeCoordinates;
};

/**
 * 计算经纬度的相对坐标wgs84
 * @param coordinates 
 * @param deltas 
 */
const addDeltaUVDeltaH = (coordinates, deltas) => {
    const [firstLon, firstLat] = [coordinates.lon, coordinates.lat];
    const result = <any>[];

    for (let i = 0; i < deltas.length; i++) {
        const { deltaU, deltaV, deltaH } = deltas[i];
        const newLon = firstLon + deltaU;
        const newLat = firstLat + deltaV;
        const z = deltaH;

        result.push({ x: newLon, y: newLat, z });
    }

    return result;
};

function calculateCenter(coordinates) {
    if (coordinates.length === 0) {
        return null; // 如果没有坐标，返回 null 或者适当的默认值
    }

    let sumLat = 0;
    let sumLon = 0;

    for (const coord of coordinates) {
        sumLat += coord[1];
        sumLon += coord[0];
    }

    const avgLat = sumLat / coordinates.length;
    const avgLon = sumLon / coordinates.length;

    return { x: avgLon, y: avgLat };
}


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
    [
        113.90893845548281,
        22.56588160638905,
        9.391876754235803
    ],
    [
        113.96676472722507,
        22.56320657713132,
        28.869796230507877
    ],
    [
        113.95290379425195,
        22.526455668586735,
        5.264489623885796
    ],
    [
        113.9024307510396,
        22.532674121225835,
        11.579816264166839
    ],
    [
        113.9024307510396,
        22.532674121225835,
        11.579816264166839
    ]
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
        const [longitude, latitude] = obj; // 将一个包含经度和纬度的对象 obj 解构出来，并分别赋值给变量 longitude 和 latitude
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
 * 解求左上和右下两个点
 * @param coordinates 最大框顶点数组
 * @returns 左上和右下两个点的经纬度
 */
const filterLeftTopRightBottomPoints = (coordinates) => {
    let leftTop = [Infinity, -Infinity];
    let rightBottom = [-Infinity, Infinity];

    for (const [lon, lat] of coordinates) {
        if (lon < leftTop[0]) {
            leftTop[0] = lon;
        }
        if (lon > rightBottom[0]) {
            rightBottom[0] = lon;
        }
        if (lat > leftTop[1]) {
            leftTop[1] = lat;
        }
        if (lat < rightBottom[1]) {
            rightBottom[1] = lat;
        }
    }

    return [leftTop, rightBottom];
};


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

// 定义 EPSG:4632 和 EPSG:3857 的投影坐标系定义
// 定义 EPSG:4326 投影
proj4.defs('EPSG:4326', '+proj=longlat +datum=WGS84 +no_defs');
proj4.defs('EPSG:3857', '+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext +no_defs');

// 定义转换函数，将 EPSG:4632 转换为 EPSG:3857
const transformTo3857 = (coords) => {
    return proj4('EPSG:4326', 'EPSG:3857', [coords.x, coords.y]);
};
// 定义转换函数，将 EPSG:4632 转换为 EPSG:3857
const transformTo3857Array = (coords) => {
    const [x, y] = proj4('EPSG:4326', 'EPSG:3857', [coords.x, coords.y]);
    return { x, y, z: coords.z };
};
const convertCoordinatesTo3857 = (coordinates) => {
    // 执行坐标转换
    const resultCoordinates = coordinates.map((coord) => {
        const convertedCoord = proj4('EPSG:4326', 'EPSG:3857', coord);
        return [convertedCoord[0], convertedCoord[1]];
    });
    return resultCoordinates;
};
// 定义ECEF到EPSG:3857的转换函数
const ecefTo3857 = (u, v, h) => {
    // ECEF的投影定义
    const ecefProjection = '+proj=geocent +datum=WGS84 +units=m +no_defs';

    // EPSG:3857的投影定义
    const epsg3857Projection = '+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext +no_defs';

    // 转换坐标
    const [x, y] = proj4(ecefProjection, epsg3857Projection, [u, v]);

    return { x, y, h };
};

// 页面操作入口，全部操作都是会在TileInfo的变化时触发的函数,即页面画框变化
// 监听 TileInfo 的变化，对Ngnix下的terrain进行筛选
watch(TileInfo, (newTileInfo, oldTileInfo) => {
    if (newTileInfo.length >= 2) {
        const latlngArray = convertToLatLngArray(TileInfo.value);
        console.log('latlngArray数据:', latlngArray);
        const maxRectangle = calculateMaxRectangle(latlngArray);
        console.log('最大的矩形框范围：', maxRectangle);
        maxRectangle3857 = convertCoordinatesTo3857(maxRectangle);
        console.log('最大矩形框EPSG:3857 坐标：', maxRectangle3857);

        minMaxValues = maxRectangle3857.reduce((acc, coord) => {
            const [x, y] = coord;
            acc.minX = Math.min(acc.minX, x);
            acc.maxX = Math.max(acc.maxX, x);
            acc.minY = Math.min(acc.minY, y);
            acc.maxY = Math.max(acc.maxY, y);
            return acc;
        }, {
            minX: Infinity,
            maxX: -Infinity,
            minY: Infinity,
            maxY: -Infinity
        });

        console.log('x的最小值:', minMaxValues.minX);
        console.log('x的最大值:', minMaxValues.maxX);
        console.log('y的最小值:', minMaxValues.minY);
        console.log('y的最大值:', minMaxValues.maxY);


        centerBbox.value = calculateCenter(maxRectangle);
        console.log('矩形框中心点：', centerBbox.value);
        // 转换坐标
        epsg3857CoordsCenter.value = transformTo3857(centerBbox.value);
        console.log('矩形框中心点EPSG:3857 坐标：', epsg3857CoordsCenter.value);


        const [leftTop, rightBottom] = filterLeftTopRightBottomPoints(maxRectangle);
        // console.log('左上角点：', leftTop);
        // console.log('右下角点：', rightBottom);
        minLon.value = leftTop[0]
        maxLon.value = rightBottom[0]
        minLat.value = rightBottom[1]
        maxLat.value = leftTop[1]
        console.log('最小经度：', minLon.value, '最大经度：', maxLon.value, '最小纬度：', minLat.value, '最大纬度:', maxLat.value);


        // 创建一个空数组来存储 URL
        let DEMurlArray: string[] = [], uniqueTiles;

        // 计算行列号
        uniqueTiles = calculateUniqueTileXY(maxRectangle, xsize.value, ysize.value, originX, originY);
        console.log('最大框对应的行列号', uniqueTiles);

        // 遍历对象数组并生成 URL 地址
        uniqueTiles.forEach(item => {
            const url = `http://localhost:3000/DEM/${maxLevel.value}/${item.x}/${item.y}.terrain`;
            // const url = `public/${maxLevel.value}/${item.x}/${item.y}.terrain`;// 测试用，记得删

            // 将生成的 URL 存入数组
            DEMurlArray.push(url);
            // 输出数组
        });
        console.log('存储的 URL 地址数组：', DEMurlArray);

        decodeTerrainArray(DEMurlArray);

    }
});
console.log('maxLevel.value:', maxLevel.value);

// --测试用例----------------------------------------------------------------------------------------
// const latlngArray = convertToLatLngArray(originalObjects);
// console.log('latlngArray数据:', latlngArray);
// const maxRectangle = calculateMaxRectangle(latlngArray);
// console.log('最大的矩形框范围：', maxRectangle);
// maxRectangle3857 = convertCoordinatesTo3857(maxRectangle);
// console.log('最大矩形框EPSG:3857 坐标：', maxRectangle3857);

// minMaxValues = maxRectangle3857.reduce((acc, coord) => {
//     const [x, y] = coord;
//     acc.minX = Math.min(acc.minX, x);
//     acc.maxX = Math.max(acc.maxX, x);
//     acc.minY = Math.min(acc.minY, y);
//     acc.maxY = Math.max(acc.maxY, y);
//     return acc;
// }, {
//     minX: Infinity,
//     maxX: -Infinity,
//     minY: Infinity,
//     maxY: -Infinity
// });

// console.log('x的最小值:', minMaxValues.minX);
// console.log('x的最大值:', minMaxValues.maxX);
// console.log('y的最小值:', minMaxValues.minY);
// console.log('y的最大值:', minMaxValues.maxY);


// centerBbox.value = calculateCenter(maxRectangle);
// console.log('矩形框中心点：', centerBbox.value);
// // 转换坐标
// epsg3857CoordsCenter.value = transformTo3857(centerBbox.value);
// console.log('矩形框中心点EPSG:3857 坐标：', epsg3857CoordsCenter.value);


// const [leftTop, rightBottom] = filterLeftTopRightBottomPoints(maxRectangle);
// // console.log('左上角点：', leftTop);
// // console.log('右下角点：', rightBottom);
// minLon.value = leftTop[0]
// maxLon.value = rightBottom[0]
// minLat.value = rightBottom[1]
// maxLat.value = leftTop[1]
// console.log('最小经度：', minLon.value, '最大经度：', maxLon.value, '最小纬度：', minLat.value, '最大纬度:', maxLat.value);

// // --写为json形式传给后端---------------------------------------------------------
// // 创建包含坐标信息的 JavaScript 对象
// const coordinates = {
//     x1: minLon.value,
//     x2: maxLon.value,
//     y1: minLat.value,
//     y2: maxLat.value
// };
// store.commit('updateJSONData', coordinates)//传递到仓库

// // 创建一个空数组来存储 URL
// let DEMurlArray: string[] = [];

// // 监听 xsize 的变化，有变化时执行回调函数
// watch(xsize, (newXsize, oldXsize) => {
//     console.log('xsize 和 ysize 发生了变化:', xsize.value, ysize.value);

//     let uniqueTiles, tilesColRow
//     if (!SZU) {
//         // 1.通过先前计算的瓦片范围,计算行列号
//         uniqueTiles = calculateUniqueTileXY(maxRectangle, xsize.value, ysize.value, originX, originY);
//         console.log('最大框对应的行列号', uniqueTiles);
//         // 遍历对象数组并生成 URL 地址
//         uniqueTiles.forEach(item => {
//             // const url = `http://localhost:3000/DEM/${item.xyl.level}/${item.xyl.x}/${item.xyl.y}.terrain`;
//             // const url = `public/${maxLevel.value}/${item.x}/${item.y}.terrain`;// 测试用，记得删，为ngnix下部署
//             const url = `public/${maxLevel.value}/${item.x}/${item.y}.terrain`;// 测试用，记得删，为ngnix下部署

//             // 将生成的 URL 存入数组
//             DEMurlArray.push(url);
//             // 输出数组
//         });
//     } else {
//         // 2.通过 TMS计算行列号，同时注意将后续的foreach更换
//         const zoom = 14;
//         tilesColRow = convertCoordinatesToTMS(maxRectangle, zoom)
//         console.log('最大框对应的行列号', tilesColRow);
//         // 遍历对象数组并生成 URL 地址
//         tilesColRow.forEach(item => {
//             // const url = `http://localhost:3000/DEM/${item.xyl.level}/${item.xyl.x}/${item.xyl.y}.terrain`;
//             // const url = `public/${maxLevel.value}/${item.x}/${item.y}.terrain`;// 测试用，记得删，为ngnix下部署
//             const url = `public/14/${item.x}/${item.y}.terrain`;// 测试用，记得删，为ngnix下部署

//             // 将生成的 URL 存入数组
//             DEMurlArray.push(url);
//             // 输出数组
//         });
//     }


//     console.log('存储的 URL 地址数组：', DEMurlArray);

//     decodeTerrainArray(DEMurlArray);
// });

// Url: http://localhost:3000/DEM/{maxlevelResults.xyl.level}/{maxlevelResults.xyl.x}/{maxlevelResults.xyl.y}.terrain



// 测试url
const DEMTestArray = ['public/9/834/288.terrain', 'public/9/835/288.terrain', 'public/9/836/288.terrain', 'public/9/837/288.terrain', 'public/9/838/288.terrain']
//const DEMTestArray = ['public/9/836/286.terrain', 'public/9/836/287.terrain', 'public/9/836/288.terrain', 'public/9/836/289.terrain', 'public/9/836/290.terrain']
// 解读terrain
// const decodedDataArray = decodeTerrainArray(DEMurlArray);

// console.log('输出解码后的数组decodedDataArray：', decodedDataArray);

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


// // 导出文本文件
// const exportTxt = () => {
//     const strData = prepareExportData();
//     const result = new Blob([strData], { type: 'text/plain' });
//     const a = document.createElement('a');
//     a.href = URL.createObjectURL(result);
//     a.download = 'exported_data.txt';
//     a.click();
// };

// /**
//  * txt导出
//  */
// const prepareExportData = () => {
//     let exportData = `{\n\t{\n\t\t`;
//     allVertices.value.forEach(coord => {
//         exportData += `\t[${coord.x}, ${coord.y}, ${coord.z} ]\n`;
//     });
//     exportData += `\t},\n}\n`;

//     return exportData;
// };
// const exportTxt = () => {
//     const strData = prepareExportData();
//     const result = new Blob([strData], { type: 'text/plain;charset=utf-8' });
//     saveAS(result, '中心坐标与顶点相对坐标.txt');
// };

// 循环遍历相对坐标数组并生成数据字符串,
// const prepareExportData = () => {
//     let exportData = '';
//     relativeCoordinatesArray.value.forEach((innerArray, outerIndex) => {
//         // exportData += '\n'; // 换行
//         innerArray.forEach((point, innerIndex) => {
//             if (innerIndex > 0) {
//                 //exportData += ', '; // 逗号分隔
//             }
//             exportData += `${formatNumber(point.x)}, ${formatNumber(point.y)}, ${formatNumber(point.z)}` + ',' + '\n';
//         });
//     });
//     return exportData;
// }
const prepareExportData = () => {
    let exportData = '';
    // 遍历epsg3857terrainCenter中的内容
    exportData += "EPSG3857\n";
    // for (let obj of epsg3857terrainCenter.value) {//瓦片中心点3857投影
    //     exportData += `${obj.x}, ${obj.y}, ${obj.h}\n`;
    // }
    exportData += `${formatNumber(centerBbox.value.x)},${formatNumber(centerBbox.value.y)}\n`;
    exportData += `${formatNumber(epsg3857CoordsCenter.value[0])},${formatNumber(epsg3857CoordsCenter.value[1])}\n`;

    // 添加分隔符
    // exportData += "\n";

    // 遍历relativeCoordinatesArray中的内容
    // exportData += "Relative Coordinates:\n";
    // 添加相对坐标数据
    for (let objArray of relativeCoordinatesArray.value) {
        for (let point of objArray) {
            exportData += `${formatNumber(point.x)}, ${formatNumber(point.y)}, ${formatNumber(point.z)}\n`;
        }
    }
    return exportData;
}

const exportTxt = () => {
    const strData = prepareExportData();
    const result = new Blob([strData], { type: 'text/plain;charset=utf-8' });
    saveAs(result, 'exported_data.txt'); // 使用 saveAs 导出文件
}

// 暴露给父组件的方法
defineExpose({
    calculateTilesForLevels,
    showInfoFunction,
})


</script>

<style scoped>
.scrollbar-demo-item {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 50px;
    margin: 10px;
    text-align: center;
    border-radius: 4px;
    background: var(--el-color-primary-light-9);
    color: var(--el-color-primary);

}

.info-div {
    width: 620px;
    height: 630px;
    position: relative;
    top: 100px;
    margin-right: 50%;
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
    width: 95%;
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

.closeBtn {
    position: absolute;
    right: 20px;
    top: 15px;
    cursor: pointer;
}

.closeBtn:hover {
    color: red;
    font-size: 17px;
    font-weight: 500;
}
</style>