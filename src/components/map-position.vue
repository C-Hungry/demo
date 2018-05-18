<style scoped lang="less">
  .model-body {
    display: flex;
    width: 100%;
    height: 100%;
    .map-content {
      flex: 1;
      position: relative;
      .map {
        width: 100%;
        height: 600px;
        .local-search {
          position: absolute;
          top: 0;
          right: 0;
        }
      }
      .btn-custom {
        position: absolute;
        left: 20px;
        padding: 12px;
        width: 54px;
      }
    }
    .address-form {
      padding-left: 20px;
      width: 240px;
      .item {
        .label {
          font-weight: 600;
          font-size: 14px;
          margin: 10px 0;
        }
        .value {

        }
      }
    }
  }
</style>

<style>
  .anchorBL{display:none;}
</style>

<template>
  <div>
    <Modal v-model="visible" :title="title" width="1000">
      <div class="model-body">
        <div class="map-content">
          <baidu-map class="map" :center="center" :zoom="zoom" @ready="handler" :scroll-wheel-zoom="true">
            <!-- 坐标点 -->
            <bm-marker 
              v-if="isShowMarker"
              dragging
              @dragend="onDragend"
              :massClear="false"
              :position="addressForm.center"
              :offset="{width: 6,height: -14}"
              :icon="{url: require('../images/position-active.png'), size: {width: 60, height: 60}}">
            </bm-marker>
            <!-- 圆 -->
            <bm-circle v-if="isShowCircle" :center="addressForm.center" :radius="addressForm.radius" stroke-color="red" :stroke-opacity="0.5" :stroke-weight="2" @lineupdate="updateCirclePath" :editing="true"></bm-circle>
            <!-- 多边形 -->
            <bm-polygon v-if="isShowPolygon" :path="addressForm.polygonPath" stroke-color="red" :stroke-opacity="0.5" :stroke-weight="2" :editing="true" @lineupdate="updatePolygonPath"/>
            <!-- 检索 -->
            <bm-local-search class="local-search" :keyword="keyword" :panel="isShowPanel" :auto-viewport="true" :location="location"></bm-local-search>
            <!-- 定位 -->
            <!-- <bm-geolocation anchor="BMAP_ANCHOR_BOTTOM_RIGHT" :showAddressBar="true" :autoLocation="true"></bm-geolocation> -->
          </baidu-map>
          <Button class="btn-custom" :type="drawingType == 'point' ? 'primary' : 'default'" style="top: 30px;" @click="setDrawingType('point')">点</Button>
          <Button class="btn-custom" :type="drawingType == 'polygon' ? 'primary' : 'default'" style="top: 80px;" @click="setDrawingType('polygon')">区域</Button>
          <Button class="btn-custom" :type="mapType == 'normal' ? 'primary' : 'default'" style="top: 130px;" @click="setMapType('normal')">平面</Button>
          <Button class="btn-custom" :type="mapType == 'satellite' ? 'primary' : 'default'" style="top: 180px;" @click="setMapType('satellite')">卫星</Button>
          <Button class="btn-custom" style="bottom: 90px;" icon="plus-round" @click="addZoom"></Button>
          <Button class="btn-custom" style="bottom: 40px;" icon="minus-round" @click="minusZoom"></Button>
          <Spin v-if="loading" size="large" fix>定位中...</Spin>
        </div>
        <div class="address-form">
          <Form ref="addressForm" :rules="addressFormValidate" :model="addressForm" label-position="top">
            <FormItem label="关键字搜索：">
              <AutoComplete
              v-model="keyword"
              placeholder="关键字搜索"></AutoComplete>
            </FormItem>
            <FormItem :label="addressForm.type == 'sendPlace' ? '发货地：' : '收货地：'" prop="areaCode">
              <Cascader :data="addressData" v-model="addressForm.areaCode" @on-change="onCascaderChange" transfer placeholder="请选择"></Cascader>
            </FormItem>
            </FormItem>
            <FormItem label="详细地址：" prop="addressDetail">
              <Input v-model="addressForm.addressDetail" placeholder="请输入详细地址"></Input>
            </FormItem>
            <FormItem v-if="drawingType == 'point'" label="半径：" prop="radius">
              <Input v-model="addressForm.radius" placeholder="请选择半径">
                <span slot="append">米</span>
              </Input>
            </FormItem>
            <FormItem label="经度：" prop="position">
              <Input v-model="addressForm.center.lng" placeholder="请选择坐标" disabled></Input>
            </FormItem>
            <FormItem label="纬度：" prop="position">
              <Input v-model="addressForm.center.lat" placeholder="请选择坐标" disabled></Input>
            </FormItem>
          </Form>
        </div>
      </div>
      
      <div slot="footer">
        <Button type="primary" size="large" @click="visible=false">取消</Button>
        <Button type="primary" size="large" @click="onBtnOK">确定</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import { getAllArea } from "../config/utils";
import { setInterval, clearInterval, clearTimeout, setTimeout } from 'timers';
var mapTimeout = null;
export default {
  data () {

    const validateAddressDetail = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入发货详情地址'));
      } else if (value.length > 20) {
        callback(new Error('详情地址不能超过20个字'));
      } else {
        callback();
      }
    }

    const validateRadius = (rule, value, callback) => {
      if (value && !new RegExp("^[1-9][0-9]{0,6}$").test(value)) {
        callback(new Error('数值范围为1~9999999的整数'));
      } else {
        callback();
      }
    }

    return {
      visible: false,
      title: "区域选择",
      type: "",
      loading: false,
      keyword: '',
      center: {lng: 116.405419, lat: 39.912725},
      isShowPanel: false,
      isShowMarker: true,
      isShowCircle: false,
      isShowPolygon: false,
      detailAddress: '',
      location: '', // 搜索限制地区
      mapType: 'normal', // 地图类型
      drawingType: 'point', // 绘制类型
      polygonPath: [], // 多边形路径
      zoom: 16,
      map: null, //
      addressData: getAllArea(),
      addressFormValidate: {
        areaCode: [
          {required: true,type: "array",message: "请选择省市区"}
        ],
        addressDetail: [
          {required: true, message: "请输入详细地址"},
          { validator: validateAddressDetail}
        ],
        radius: [
          {required: true, message: "请输入半径"},
          { validator: validateRadius}
        ],
        center: [
          {
            required: true,
            type: "object", 
            fields: {
              lng: {type: "number", required: true, message: "请选择坐标"},
              lat: {type: "number", required: true, message: "请选择坐标"},
            }
          }
        ]
      },
      addressForm: {
        type: "",
        areaCode: [],
        addressDetail: '',
        fullAddress: '',
        center: {lng: 0,lat: 0},// 坐标中心点
        polygonPath: [], // 采用多边形绘制的轨迹
        radius: 200 // 采用点绘制时的半径（米）
      }
    }
  },
  watch: {
    keyword(newVal) {
      if (newVal) {
        this.isShowPanel = true;
      }
    }
  },
  methods: {
    onBtnOK() {
      this.$refs['addressForm'].validate((valid)=>{
        if (valid) {
          if (this.drawingType == 'point') {
            this.addressForm.polygonPath = [];
          }
          else {
            this.addressForm.radius = 0;
          }
          this.$emit('on-change',this.addressForm);
          this.visible = false;
        }
      })
    },
    // 三级级联change事件
    onCascaderChange(value, selectedData) {
      if (value.length > 0) {
        this.isShowMarker = true;

        this.location = selectedData[0].label + selectedData[1].label + selectedData[2].label;
        this.addressForm.fullAddress = selectedData[0].label + selectedData[1].label + selectedData[2].label;
        // 位置逆解析
        let _this = this;    
        new BMap.Geocoder().getPoint(_this.location, function (res) {
          _this.center = res;
          _this.addressForm.center = res;
          // 获取详细地址
          new BMap.Geocoder().getLocation(res, function(data) {
            _this.addressForm.addressDetail = data.addressComponents.street + data.addressComponents.streetNumber;
          })
        });
      }
    },
    // 地图ready事件
    handler ({BMap, map}) {
      this.map = map;
    },
    // 初始化
    init(type) {
      try {
        let _this = this;

        this.type = type;
 
        this.visible = true;
        this.loading = true;
        this.isShowCircle = true;
        this.setDrawingType('point');
        
        // 获取当前位置
        new BMap.Geolocation().getCurrentPosition(function(r){
          _this.loading = false;
          if(this.getStatus() == BMAP_STATUS_SUCCESS){
            _this.center = r.point;
            _this.addressForm.center = r.point;
            _this.getLocation(r.point);
          } 
          else {
            _this.$Message.error('获取当前位置失败，请刷新重试！')
          }       
        },{enableHighAccuracy: true})

        // 监听地图点击事件
        this.map.addEventListener('click',function(e) {
          _this.isShowMarker = true;
          _this.isShowPanel = false;
          _this.map.clearOverlays();
          if (_this.drawingType == 'point') {
            _this.addressForm.center = e.point;
          } 
          else {
            _this.addressForm.polygonPath.push(e.point);
            let view = _this.map.getViewport(_this.addressForm.polygonPath);
            _this.addressForm.center = view.center;
          }
          _this.getLocation(_this.addressForm.center);

        })
      }
      catch (error) {
        this.$Message.error("加载地图失败，请刷新重试！");
      }
    },
    // 监听当前点拖拽
    onDragend(target) {
      this.addressForm.center = target.point;
      this.getLocation(target.point);
    },
    // 设置绘制方式   点 多边形
    setDrawingType(type) {
      this.map.clearOverlays();
      this.drawingType = type;
      if (type == 'point') {
        this.isShowCircle = true;
        this.isShowPolygon = false;
        this.addressForm.polygonPath = [];
      }
      else {
        this.isShowCircle = false;
        this.isShowPolygon = true;
      }
    },
    // 设置地图类型
    setMapType(type) {
      this.mapType = type;
      this.map.setMapType(type == 'normal' ? BMAP_NORMAL_MAP : BMAP_SATELLITE_MAP);
    },
    // 缩放级别+1
    addZoom() {
      if (this.zoom >= 18) {
        return;
      } else {
        this.zoom++;
      }
    },
    // 缩放级别-1
    minusZoom() {
      if (this.zoom <= 1) {
        return;
      } else {
        this.zoom--;
      }
    },
    // 更新多边形后回调
    updatePolygonPath (e) {
      this.addressForm.polygonPath = e.target.getPath();
      let view = this.map.getViewport(this.addressForm.polygonPath);
      this.addressForm.center = view.center;
      this.getLocation(view.center);
    },
    // 更新圆形后回调
    updateCirclePath (e) {
      this.addressForm.center = e.target.getCenter();
      this.addressForm.radius = Math.floor(e.target.getRadius());
    },
    // 位置逆解析 回填三级级联及详细地址
    getLocation(point) {
      let _this = this;
      new BMap.Geocoder().getLocation(point, function(data) {
        _this.addressForm.addressDetail = data.addressComponents.street + data.addressComponents.streetNumber;
        _this.queryAddressCode(data.addressComponents);
      })
    },
    // 获取行政编号
    queryAddressCode(data) {

      let codeArr = [];
      let cityArr = [];
      let countryArr= [];

      this.addressData.forEach((item)=>{
        if (item.label == data.province) {
          codeArr.push(item.value);
          this.addressForm.fullAddress = item.label;
          cityArr = item.children;
        }
      })

      cityArr.forEach((item)=>{
        item.children.forEach((sub)=>{
          if (sub.label == data.district) {
            codeArr.push(item.value);
            codeArr.push(sub.value);
            this.addressForm.fullAddress = this.addressForm.fullAddress + item.label + sub.label;
          }
        })
      })

      if (codeArr.length == 3) {
        this.addressForm.areaCode = codeArr
      }
      else {
        this.addressForm.areaCode = [];
        this.$Message.error('找不到所选区域的行政编码！请联系客服处理，电话：400 1617 400！');            
      }
    }
  },
  mounted() {
    
  },
}
</script>