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
└─main<br>
      ├─java<br>
      │  └─com<br>
      │      └─CIM<br>
      │          └─CIM_Spring<br>
      │              │  Application.java //启动类<br>
      │              │<br>
      │              ├─common<br>
      │              │      CustomException.java //自定义的全局异常<br>
      │              │      GlobalExceptionHandler.java //异常处理器<br>
      │              │      JacksonObjectMapper.java //对象映射器，进行序列化/反序列化<br>
      │              │      Result.java //前后端通信协议<br>
      │              │<br>
      │              ├─config<br>
      │              │      DLLInitConfiguration.java //控制DLL对应的的Java接口实例化的配置文件，主要目的是业务层的进一步解耦<br>
      │              │      WebMvcConfig.java //WebMVC配置类，目前作用是将序列化对象映射器装入SpringMVC框架转换器集合中<br>
      │              │<br>
      │              ├─controller<br>
      │              │      TinTerrainController.java //TinTerrain表现层控制器<br>
      │              │<br>
      │              ├─DLL<br>
      │              │      TinTerrainDLL.java //tin-terrain.dll对应的Java接口，通过此接口的子类实现对dll函数的调用<br>
      │              │<br>
      │              ├─dto<br>
      │              │      IODir.java //输入输出目录的数据传输对象，用于接收前端传入的一对输入输出路径<br>
      │              │<br>
      │              └─service<br>
      │                  │  TinTerrainService.java //TinTerrainDLL接口业务层接口<br>
      │                  │<br>
      │                  └─impl<br>
      │                          TinTerrainServiceImpl.java //TinTerrainDLL接口业务层接口的实现<br>
      │<br>
      └─resources //以下的dll是tin-terrain及其依赖dll<br>
              application.yml //application配置了数据源，端口等常见配置内容<br>
              gdal204.dll<br>
              libcurl.dll<br>
              proj.dll<br>
              proj_7_2.dll<br>
              proj_9_1.dll<br>
              sqlite3.dll<br>
              tiff.dll<br>
              tin-terrain.dll<br>
2.目前可接受一个tinterrain下的Post请求，接收一个tif文件路径和一个目录，将dll处理的结果存放在指定的目录中
## 实现难点
JNA接口的映射规则:
java接口和c++类中的方法/函数同名且同参数，Java和C++中的类型映射如下
| C++类型   | Java类型      |
|---------|-------------|
| bool    | boolean     |
| char    | byte        |
| wchar_t | char        |
| short   | short       |
| int     | int         |
| float   | float       |
| double  | double      |
| long    | NativeLong  |
| String  | const char* |


## 部署方式
1.使用下面的命令将项目打包为jar（使用Maven更加方便，或者IDE自带的MavenUI操作插件）

```
mvn package
```

2.将jar文件与其他dll文件放在同一目录下，然后使用下面命令运行jar包

```
java -jar .\CIM_Spring-1.0-SNAPSHOT.jar
```


## 使用方式
前端（5173或3000的跨域请求已被允许）向后端80端口发送请求，传输的是bbox的四个顶点坐标，返回浏览器下载dll生成的坐标txt文件

## 现存问题
未来要解决部署时的DLL依赖库最小化问题

## 更新日志
2024.1.9新增技术文档