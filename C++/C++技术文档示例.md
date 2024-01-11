<!-- 前端、后端、C++算法三部分开发者在各自文件夹中编写此技术文档,文档中实现流程尽可能详细 -->

# C++ dem2tintiles工作流


## 简介
输入tif格式的dem数据，输出在不同层级下对应瓦片的terrian格式以及xyz相对坐标（相对于EPSG3857坐标系，即伪墨卡托投影），并制作成dll

## 技术栈
Windows10
tin-terrain（项目地址：https://github.com/heremaps/tin-terrain）
Boost ：**版本未知**
GDAL ：**版本未知**

## 实现流程
### dll入口函数
由于tin-terrain项目是以命令行输入的，因此本函数将输入的参数重新整理成命令行的形式输入到项目中。
```
int dem2tintiles(const char* input, const char* outputdir, float error)
```
input:输入的tif格式dem文件路径，对应tin-terrain项目中的“input ”
outputdir:输出文件夹，对应项目中的“output-dir”
error:执行地理生成或地理数据处理时所允许的最大几何误差，对应tin-terrain项目中的“max-error”


### 导入dem到一个RasterDouble类型的对象中（RasterIO.cpp）
```
bool load_raster_file(const std::string& file_name, RasterDouble& target_raster, bool validate_projection)
```
const std::string& file_name:输入的tif格式dem文件路径
RasterDouble& target_raster：RasterDouble 通常是一个Raster类的double类型的实例化
bool validate_projection：是否对加载的dem的投影信息进行验证，默认为TRUE

该项目仅支持EPSG3857的投影坐标系，若其不符合该坐标系，会尝试重新投影到EPSG3857，如果投影失败（通过判断投影后的结果是不是EPSG3857），会返回错误信息： 
“input raster file must be in EPSG:3857 (Web Mercator) format already tyired to reproject to EPSG:3857,but failed" you can reproject raster terrain using GDAL by yourself" as follows: 'gdalwarp -t_srs EPSG:3857 input.tif output.tif'”

### 将dem分成不同层级的RasterOverview（用RasterOverviews中的指针对所有的RasterOverview进行处理），后续会分别处理每一层的RasterOverview。
```
struct RasterOverview
{
    int zoom_level;
    double resolution;  
    UniqueRasterPointer raster;   
};
```

### 遍历不同层级的RasterOverview。根据高程数据边界框、所在瓦片缩放级别及分区大小，将高程划分成多个分区。每个分区用一个矩形框表示，然后将分区以 Partition 结构体形式存储在 vector 中并返回。(dem2tintiles_workflow.cpp)
```
std::vector<Partition> create_partitions_for_zoom_level(const RasterDouble& dem, int zoom)
```
const RasterDouble& dem 储存了double变量的raster对象
int zoom                缩放层级

### 将给定的DEM数据按照指定的缩放级别分割成多个瓦片，然后对每个瓦片生成三角网格，将结果（terrian和xyz坐标）分别保存到指定输出目录中。
```
bool create_tiles_for_zoom_level(const RasterDouble& dem,
                                 const std::vector<Partition>& partitions,
                                 int zoom,
                                 const std::string& output_basedir,
                                 const double method_parameter,
                                 const std::string& meshing_method,
                                 MeshWriter& mesh_writer, 
                                 std::pair<double,double>cen_pos)
```
const RasterDouble& dem：储存double变量的raster对象 
const std::vector<Partition>& partitions,
int zoom,缩放层级
const std::string& output_basedir,输出路径
const double method_parameter,    max_error
const std::string& meshing_method,生成网格的函数方法
MeshWriter& mesh_writer,    用于写入生成的三角网格的MeshWriter对象
std::pair<double,double>cen_pos)  dem的中心点坐标（EPSG：3857）


## 部署方式
visual studio2022中生成dll

## 使用方式
入口函数int dem2tintiles传入参数const char* input（输入dem文件路径）、const char* outputdir（输出文件夹路径）、float error（算法处理中所允许的最大误差）

## 更新日志
2024.1.9 新增技术文档