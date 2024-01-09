<!-- 前端、后端、C++算法三部分开发者各自编写此文档,文档中实现流程尽可能详细  -->

# 基于SpringBoot的后台


## 简介
项目后台

## 技术栈
1.Spring5.3.6
2.SpringMVC5.3.6
3.SpringBoot2.4.5
4.JNA（Java Native Access）5.5.0
5.MyBatisPlus3.4.2
## 实现流程
1.项目结构
src<br>
└─main
      ├─java
      │  └─com
      │      └─CIM
      │          └─CIM_Spring
      │              │  Application.java //启动类
      │              │
      │              ├─common
      │              │      CustomException.java //自定义的全局异常
      │              │      GlobalExceptionHandler.java //异常处理器
      │              │      JacksonObjectMapper.java //对象映射器，进行序列化/反序列化
      │              │      Result.java //前后端通信协议
      │              │
      │              ├─config
      │              │      DLLInitConfiguration.java //控制DLL对应的的Java接口实例化的配置文件，主要目的是业务层的进一步解耦
      │              │      WebMvcConfig.java //WebMVC配置类，目前作用是将序列化对象映射器装入SpringMVC框架转换器集合中
      │              │
      │              ├─controller
      │              │      TinTerrainController.java //TinTerrain表现层控制器
      │              │
      │              ├─DLL
      │              │      TinTerrainDLL.java //tin-terrain.dll对应的Java接口，通过此接口的子类实现对dll函数的调用
      │              │
      │              ├─dto
      │              │      IODir.java //输入输出目录的数据传输对象，用于接收前端传入的一对输入输出路径
      │              │
      │              └─service
      │                  │  TinTerrainService.java //TinTerrainDLL接口业务层接口
      │                  │
      │                  └─impl
      │                          TinTerrainServiceImpl.java //TinTerrainDLL接口业务层接口的实现
      │
      └─resources //以下的dll是tin-terrain及其依赖dll
              application.yml //application配置了数据源，端口等常见配置内容
              gdal204.dll
              libcurl.dll
              proj.dll
              proj_7_2.dll
              proj_9_1.dll
              sqlite3.dll
              tiff.dll
              tin-terrain.dll
2.目前
## 实现难点


## 部署方式


## 使用方式


## 更新日志