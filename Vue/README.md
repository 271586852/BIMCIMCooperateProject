## 1.项目基本组成介绍

​	项目中引入组件包 **[element-plus](https://element-plus.gitee.io/zh-CN/)**: "^2.4.2"，部分图标也从中引用，另外还引用了阿里矢量图标，其本地css等文件在**\src\assets**

中引入；

​	利用[Vuex](https://vuex.vuejs.org/zh/)实现**状态管理模式 + 库**其中实现各组件间数据的交互与传值，以及一些同步异步的方法调用

### 1.1 Mega.vue

组合式风格MegaAPI调用，实现了鼠标点击出现经纬度高度、视图范围，

### 1.2 TopNavigation.vue

顶部导航栏实现，点击事件窗口输出，视窗窗口输出，图层展示，用户中心设置等，界面信息基本存在此组件中，其样式存于src/style文件夹下

### 1.3 store/.index.js

**vuex**文件，包括组件间所要互相传值的变量，以及一些更新变量的方法



# ----12月3号---

完善一下图层控件UI，进行图层展示、隐藏、增加、删除，对于一些参数细节仍待调整，如下为界面效果图

![01](img\01.png)

![02](img\02.png)

![03](img\03.png)

![04](D:\FolderProject_SZU\test1\img\04.png)