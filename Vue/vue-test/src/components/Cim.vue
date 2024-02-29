<template>
  <div>
    <div id="player"></div>
    <!-- 底部信息输出 -->
    <div id="bottomInfo" ref="bottomInfo">
      <!-- <div id="resizer" @mousedown="startResize"></div> -->
      <div id="toptext">
        <span id="text-span">控制台</span>
      </div>
      <div id="divlogs">{{ logs }}</div>
    </div>
  </div>
</template>

<script>
import { onMounted, ref, watch, computed } from "vue";
import { useStore } from "vuex";
import "/src/assets/me.min.js"

const activeName = ref("first");
const logs = ref(""); // 创建一个响应式引用来存储日志信息
const bottomInfo = ref(null); // 创建一个引用来存储 #bottomInfo 元素

export default {
  methods: {
    startResize(event) {
      this.isResizing = true;
      this.lastY = event.clientY;
    },
    doResize(event) {
      if (!this.isResizing) return;
      const deltaY = this.lastY - event.clientY; // 取反
      const newHeight = this.$refs.bottomInfo.offsetHeight + deltaY;
      this.$refs.bottomInfo.style.height = `${newHeight}px`;
      this.lastY = event.clientY;
    },
    stopResize() {
      this.isResizing = false;
    }
  },
  mounted() {
    window.addEventListener("mousemove", this.doResize);
    window.addEventListener("mouseup", this.stopResize);
  },
  beforeDestroy() {
    window.removeEventListener("mousemove", this.doResize);
    window.removeEventListener("mouseup", this.stopResize);
  },

  setup() {
    const api = ref(null);
    const store = useStore();

    const printResult = computed(() => store.state.printResult);
    const Mouseposition_status = computed(
      () => store.state.Mouseposition_status
    );

    // 调用 printResult 函数
    console.log("cim.vue", printResult.value);
    console.log("cim.vue", Mouseposition_status.value);

    const res = computed(() => {
      // console.log(store.state.name)
      return store.state.name;
    });

    onMounted(async () => {
      const script = document.createElement("script");

      // 重写 console.log 方法
      const originalConsoleLog = console.log;
      console.log = (...args) => {
        originalConsoleLog(...args); // 调用原始的 console.log 方法
        const now = new Date();
        const space = "---";
        const timestamp = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
        const formattedArgs = args.map(
          arg => (typeof arg === "object" ? JSON.stringify(arg, null, 2) : arg) // 如果参数是对象，使用 JSON.stringify 将其转换为字符串
        );
        logs.value += `${timestamp}${space}${formattedArgs.join(" ")}\n`; // 在日志信息前添加当前的时间
      };

      script.src = "/src/assets/me.min.js";
      // --------------------------------------------
      script.onload = () => {
        //1.云渲染

        //2.本机
        api.value = new me.MegaEarthApi({
          url: "localhost:4003", //  客户端所在主机ip，若是本机连接可填 localhost
          wsPort: "2334", //  选填，客户端开启的通信端口，默认为 2333
          container: "player" //  挂载视频的div ID
        });
        // console.log("输出api");
        const MegaAPI = api._rawValue;
        // console.log("api", api);
        // console.log("api.value", api.value);
        // console.log("api.", MegaAPI);

        const resReady = MegaAPI.ready(); //true / false
        console.log("resReady:", resReady);
        logs.value += `resReady: ${resReady}\n`; // 更新 logs

        MegaAPI.on("open", () => {
          console.log("系统完成加载, 此时api可调用");
        });

        MegaAPI.on("error", e => {
          console.log("系统错误", e);
        });
        MegaAPI.on("close", e => {
          console.log("系统关闭", e);
        });

        if (MegaAPI.control.enableLeftMouseClick(true))
          console.log("点击事件开启成功");
        if (MegaAPI.control.enableCameraChanged(true))
          console.log("相机移动事件开启成功");
        if (MegaAPI.control.enableStudioKeyFrameChanged(true))
          console.log("录播室关键帧事件开启成功");
        // MegaAPI.measureHandler.start({
        //         type:0
        // }).then(res => {
        //     console.log('面积量测开始start', res)
        // })
        // MegaAPI.measureHandler.stop().then(res => {
        //     console.log('面积量测结束stop', res)
        // })

        // -------------------------------------------------------------------------------------------------
        MegaAPI.onEvent(e => {
          console.log("onEvent", e.type, e.data); // 事件类型、事件反馈结果
          console.log("进入OnEvent");
          if (e.type === "LeftMouseClick") {
            // 点击事件反馈，需要在api.control处开启点击事件
            console.log("点击位置经纬度:", e.data.location); // 点击位置经纬度，[经度，纬度，高度]
            store.commit("updateLocation", e.data.location);
          }

          if (e.type === "CameraChanged") {
            // 相机移动事件反馈，需要在api.control处开启相机移动事件
            console.log("当前相机参数:", e.data.camera); // 当前相机参数，详见api.camera.get()
            console.log("当前可视区域的经纬度范围:", e.data.viewRectangle); // 当前可视区域的经纬度范围，详见api.camera.getViewRectangle()
            console.log("当前可视区域的经纬度范围west:", e.data.viewRectangle.west);
            store.commit("updateViewRectangle", e.data.viewRectangle);
          }
          if (e.type === "StudioKeyFrameChanged") {
            // 录播室关键帧监听事件反馈，需要在api.control处开启该事件
            // 每个轨道的每个点都视为一个关键帧，所以由webgl转化而来的studio，每播放一个点位就会有五个回调信息，
            // e.data.keyFrame.trackName 分别对应 cameraLongitude cameraLatitude cameraHeight CameraPitch cameraYaw
            // 为了保证播放一个关键帧只有一个回调执行可以加个判断条件
            if (e.data.keyFrame.trackName === "cameraLongitude") {
              console.log("帧:", e.data.keyFrame);
            }
          }

          if (e.type === "Measurement") {
            // 量测事件反馈，需要在api.measureHandler处开启量测
            console.log("0-面积测量 1-三角测量:", e.data.type); // 0-面积测量 1-三角测量

            console.log(e.data.area, "平方米"); // 面积测量时有值，单位：平方米

            console.log(e.data.distance, "两点距离（米）"); // 三角测量时有值，两点距离，单位：米
            console.log(e.data.horizontal, "两点间水平距离(m)"); // 三角测量时有值，两点间水平距离，单位：米
            console.log(e.data.vertical, "两点间垂直距离(m)"); // 三角测量时有值，两点间垂直距离，单位：米
          }
        });
        const cameraoptions = {
          position: [114.03568267822266, 22.541633507784642, 350],
          rotation: [80, -45, 0]
        };

        MegaAPI.camera
          .set(cameraoptions)
          .then(res => {
            console.log("结果res", res);
          })
          .catch(error => {
            console.log("错误error", error, error.code);
          });

        MegaAPI.weather.get().then(res => {
          console.log("天气weather", res);
        });

        MegaAPI.camera.get().then(res => {
          console.log("相机camera", res);
        });
      };

      // ----------------------------
      document.body.appendChild(script);
    });

    // 监听 logs 变量的变化，当 logs 变量的值改变时，滚动到 #bottomInfo 元素的底部
    watch(logs, () => {
      bottomInfo.value.scrollTop = bottomInfo.value.scrollHeight;
    });

    return {
      api,
      logs,
      bottomInfo,
      res
    };
  },

  data() {
    return {
      activeName: "first",
      isResizing: false,
      lastY: 0
    };
  }
};
</script>

<style scoped>
#player {
  position: absolute;
  margin-top: 60px;
  left: 0;
  height: calc(100vh - 100px); /* 假设 #bottomInfo 的高度为 100px */
  width: 100%;
  background-color: white;
}
#bottomInfo {
  /* position: absolute; */
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 20%;
  resize: vertical; /* 允许用户垂直调整元素的大小 */
  overflow: auto; /*如果内容超出 #bottomInfo 的大小，显示滚动条 */
  background-color: rgb(240, 239, 239);
  border: 2px solid rgb(228, 231, 237);
  white-space: pre-line; /* 保留空格和换行符 */
  /* display: flex; */
  /* justify-content: center; */
  align-items: center;
  overflow-x: hidden;
  /* cursor: ns-resize; */
}

#divlogs {
  position: absolute;
  /* border: 10px; */
  white-space: pre-line; /* 保留空格和换行符 */
  /* resize: vertical; 允许用户垂直调整元素的大小 */
  /*overflow: auto;  如果内容超出 #bottomInfo 的大小，显示滚动条 */
  overflow-x: hidden;
  padding-left: 50px; /* 文本离左边有 10px 的距离 */
  padding-bottom: 30px;
  /* padding-top: 50px; */
}
.el-tabs__nav-wrap is-top {
  overflow: hidden;
  margin-bottom: -1px;
  position: fixed;
  z-index: 10;
  width: 100%;
  background-color: rgb(240, 239, 239);
}
#toptext {
  position: sticky;
  /* position: sticky;  */
  /* bottom: 0%; */
  padding-left: 2%;
  display: flex;
  align-items: center;
  height: 18%;
  margin-top: 0%;
  top: 0px;
  width: 100%;
  background-color: rgb(240, 239, 239);
  border: 2px solid rgb(228, 231, 237);
  z-index: 10;
  font-weight: bold;
}
#text-span:hover {
  color: rgb(64, 158, 255);
}
#resizer {
  height: 5px;
  width: 100%;
  cursor: ns-resize;
  background-color: rgba(0, 0, 0, 0.1);
}
</style>