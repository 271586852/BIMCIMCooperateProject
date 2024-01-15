import { createStore } from 'vuex'


export default createStore({
    //创建数据仓库
    state: {
        name: 'mayun',
        Measure: false,
        location: [false], // 新增的属性，用来存储点击位置的经纬度
        printResult: '输出printResult', // 定义一个 state 来存储 printResult
        viewRectangle: [false],

        AreaMeasureStatus: false,
        EntityObjects: [false],
        isDropdownVisible: false,
        SelectTileInfo: [false],
        // 用户中心user管理状态
        userVisible: false,
        LoadMega: false,
        vuexUrl: "localhost:4000", // localhost:4000
        vuexWsPort: "2333",// 2333
    },

    //使用以下方法调用


    //同步调用
    mutations: {
        setMeasure(state, Measure) {
            state.Measure = Measure
        },
        setName(state, name) {
            state.name = name
        },
        updateLocation(state, location) { // 新增的 mutation，用来更新 location 的值
            state.location = location
        },
        setPrintResult(state, result) { // 定义一个 mutation 来更新 printResult
            state.printResult = result
        },
        updateViewRectangle(state, data) { // 新增的 mutation，用来更新 location 的值
            state.viewRectangle = data
        },
        updateVuexUrl(state, data) {
            state.vuexUrl = data
        },
        updateVuexWsPort(state, data) {
            state.vuexWsPort = data
        },
        updateAreaMeasureStatus(state, data) {
            state.AreaMeasureStatus = data
        },
        updateEntityObjects(state, data) {
            state.EntityObjects = data
        },
        updateVisible(state, { id, visible }) {
            const EntityObject = state.EntityObjects.find(eo => eo.id === id);
            if (EntityObject) {
                EntityObject.visible = visible;
            }
        },
        toggleDropdown(state) {
            state.isDropdownVisible = !state.isDropdownVisible;
        },
        updateSelectTileInfo(state, data) {
            state.SelectTileInfo = data
        },
        // 用户中心管理
        updateUserVisible(state, data) {
            state.userVisible = !state.userVisible;
        },
        updateLoadMega(state, data) {
            state.loadMega = data;
        },
    },
    //异步调用
    actions: {
        async updateLocationAsync({ commit }, location) { // 异步操作
            // 这里可以执行一些异步操作，比如发送 AJAX 请求
            // 然后，你可以在这个操作完成后，通过 commit 方法来触发一个 mutation
            commit('updateLocation', location)
        },
        toggleDropdown({ commit }) {
            commit('toggleDropdown');
            console.log('已调用toggleDropdown');
          },
    }
})