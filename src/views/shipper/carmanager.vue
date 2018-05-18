<style scoped lang="less">
  .carmanager {
    padding: 0 10px;
    min-height: 600px;
    position: relative;
  }
</style>

<template>
  <div>
    <frameInfocenterShipper>
      <div class="carmanager">
        <br>
        <Input v-model="keyWord" placeholder="车牌号" style="width: 200px"></Input>
        <Button type="primary" icon="ios-search" v-on:click="query()">查询</Button>
        <Button type="warning" icon="plus-round" v-on:click="add()">新增</Button>
        <br><br>
        <Table :columns="columns" :data="rows"></Table>
        <br>
        <Page :total="totalCount" :current="pageIndex" :page-size="pageSize" @on-change="onPageChange"></Page>
        <br>

        <!-- 新增&编辑 -->
        <Modal v-model="dlgNew.visible" :title="dlgNew.title">
          <Form :label-width="80" style="padding: 0 10px;">
            <FormItem label="车牌号：">
              <Row>
                <Col span="4">
                  <Select v-model="dlgNew.carNum1" placeholder="">
                    <Option v-for="item in '京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼'" :value="item" :key="item">{{ item }}</Option>
                  </Select>
                </Col>
                <Col span="20">
                  <Input v-model="dlgNew.carNum2" placeholder="请输入车牌号" @on-blur="toUpperCase" style="text-transform:uppercase;"></Input>
                </Col>
              </Row>
            </FormItem>
            <FormItem label="车辆类型：">
              <Select v-model="dlgNew.carType">
                <Option v-for="item in carTypeList" :value="item.typeCode" :key="item.valtypeCodeue">{{ item.typeValue }}</Option>
              </Select>
            </FormItem>
            <FormItem label="车长：">
              <Input v-model="dlgNew.carLength" placeholder="请输入车长">
                <span slot="append">米</span>
              </Input>
            </FormItem>
            <FormItem label="载重：">
              <Input v-model="dlgNew.carWeight" placeholder="请输入载重">
                <span slot="append">吨</span>
              </Input>
            </FormItem>
            <FormItem label="设备编号：">
              <Input v-model="dlgNew.equip" placeholder="请输入设备编号"></Input>
            </FormItem>
          </Form>
          <div slot="footer">
            <Button type="primary" @click="addSubmit()">确定</Button>
          </div>
        </Modal>

        <!-- 绑定司机列表 -->
        <Modal v-model="dlgBindDrivers.visible" title="绑定司机" width="800">
          <Table :columns="dlgBindDrivers.columns" :data="dlgBindDrivers.rows"></Table>
          <br>
          <Button type="primary" @click="dlgBindDriversNewShow()">新增</Button>
          <div slot="footer">
            <Button type="primary" @click="dlgBindDrivers.visible=false">关闭</Button>
          </div>
        </Modal>

        <!-- 新增绑定司机 -->
        <Modal v-model="dlgBindDriversNew.visible" title="绑定司机">
          <Select
            v-model="dlgBindDriversNew.keyWords"
            filterable
            remote
            :remote-method="remoteMethod"
            @on-change="dlgBindDriversNewSelectedChanged"
            :loading="dlgBindDriversNew.loading">
            <Option v-for="(option, index) in dlgBindDriversNew.drivierList" :value="option.value" :key="index">{{option.label}}</Option>
          </Select>
          <br>
          <div slot="footer">
            <Button type="primary" @click="dlgBindDriversNewSubmit()">确定</Button>
          </div>
        </Modal>

        <Spin v-if='loading' fix></Spin>
      </div>
    </frameInfocenterShipper>
  </div>
</template>

<script>
  import frameInfocenterShipper from "../../components/frame-infocenter-shipper";
  export default {
    components: {
      frameInfocenterShipper
    },
    data() {
      return {

        loading: false,
        keyWord: "",
        pageSize: 10,
        pageIndex: 1,
        totalCount: 0,

        carTypeList: [],

        columns: [
          {
            title: '车辆',
            key: 'carNumber'
          },
          {
            title: '车型',
            key: 'carTypeName'
          },
          {
            title: '车长（米）',
            key: 'carLength'
          },
          {
            title: '载重（吨）',
            key: 'carCapacity'
          },
          {
            title: '设备信息',
            key: 'identifyId'
          },
          {
            title: '操作',
            width: 200,
            align: "center",
            render: (h, params) => {
              return h('div', [
                h('Button', {
                  props: {
                    type: 'primary',
                    size: 'small'
                  },
                  style:{
                    marginRight: "2px"
                  },
                  on: {
                    click: () => {
                      this.dlgBindDriversShow(params.row.id);
                    }
                  }
                }, '司机'),
                h('Button', {
                  props: {
                    type: 'primary',
                    size: 'small'
                  },
                  style:{
                    marginRight: "2px"
                  },
                  on: {
                    click: () => {
                      this.modify(params.row.id);
                    }
                  }
                }, '编辑'),
                h('Button', {
                  props: {
                    type: 'error',
                    size: 'small'
                  },
                  style:{
                    marginRight: "2px"
                  },
                  on: {
                    click: () => {
                      this.del(params.row.id);
                    }
                  }
                }, '删除')
              ]);
            }
          },
        ],
        rows: [],

        dlgNew:{

          visible: false,

          title: "新增车辆",

          carNum1: "陕",
          carNum2: "",
          carType: -1,
          carLength: "",
          carWeight: "",
          equip: "",
        },

        dlgBindDrivers: {

          visible: false,

          carId: 0,

          columns: [
            {
              title: '司机姓名',
              key: 'driverName'
            },
            {
              title: '手机号码',
              key: 'telephone'
            },
            {
              title: '操作',
              width: 200,
              align: "center",
              render: (h, params) => {
                return h('div', [
                  h('Button', {
                    props: {
                      type: 'error',
                      size: 'small'
                    },
                    style:{
                      marginRight: "2px"
                    },
                    on: {
                      click: () => {
                        this.dlgBindDriverUnbind(params.row.driverId);
                      }
                    }
                  }, '解绑')
                ]);
              }
            },
          ],

          rows: [],
        },

        dlgBindDriversNew: {

          visible: false,

          loading: false,

          keyWords: "",

          carId: 0,

          driverId: 0,

          drivierList: [],
        },
      };
    },
    methods: {
      toUpperCase(e){
        this.dlgNew.carNum2 = this.dlgNew.carNum2.toUpperCase();
      },
      dlgBindDriverUnbind(driverId){
        this.$Modal.confirm({
          title: '提示',
          content: '<p>确定解绑？</p>',
          onOk: () => {

            this.$shipperService
              .post("/vehicleManagement/Unbinding", {
                carId: this.dlgBindDrivers.carId,
                driverId: driverId
              })
              .then(res => {

                if (!res.success) {
                  this.$Message.error(res.msg);
                  return;
                }

                this.$Message.info("解绑成功！");
                this.dlgBindDriversQuery();
              })
              .catch(res => {
                this.$Message.error("解绑出现未知错误！");
              });
          }
        });
      },
      dlgBindDriversNewSelectedChanged(item){
        for(var i = 0; i < this.dlgBindDriversNew.drivierList.length; i++){
          if(this.dlgBindDriversNew.drivierList[i].value == item){
            this.dlgBindDriversNew.driverId = this.dlgBindDriversNew.drivierList[i].id;
            return;
          }
        }
      },
      dlgBindDriversNewSubmit(){

        if(!this.dlgBindDriversNew.carId){
          this.$Message.warning("请选择车辆");
          return;
        }
        if(!this.dlgBindDriversNew.driverId){
          this.$Message.warning("请选择司机");
          return;
        }

        this.$shipperService
          .post("/vehicleManagement/binding", {
            carId: this.dlgBindDriversNew.carId,
            driverId: this.dlgBindDriversNew.driverId
          })
          .then(res => {

            if (!res.success) {
              this.$Message.error(res.msg);
              return;
            }

            this.$Message.info("绑定司机成功！");
            this.dlgBindDriversQuery();
            this.dlgBindDriversNew.visible = false;
          })
          .catch(res => {
            this.$Message.error("查询司机出现未知错误！");
          });
      },
      remoteMethod (query) {
        this.dlgBindDriversNew.loading = true;
          this.$shipperService
            .post("/vehicleManagement/fuzzyQuery", {
              keywords: query
            })
            .then(res => {

              this.dlgBindDriversNew.loading = false;
              if (!res.success) {
                this.$Message.error(res.msg);
                return;
              }
              const list = res.data.map(item => {
                return {
                    id: item.driverId,
                    value: item.driverName + " " + item.telephone,
                    label: item.driverName + " " + item.telephone
                };
              });
              this.dlgBindDriversNew.drivierList = list;
            })
            .catch(res => {

              this.dlgBindDriversNew.loading = false;
              this.$Message.error("查询司机出现未知错误！");
            });
      },
      dlgBindDriversNewShow(){
        
        this.dlgBindDriversNew.carId = this.dlgBindDrivers.carId;
        this.dlgBindDriversNew.keyWords = "";
        this.dlgBindDriversNew.drivierList = [];
        this.remoteMethod("");
        this.dlgBindDriversNew.visible = true;
      },
      dlgBindDriversQuery(){
        this.$shipperService
          .post("/vehicleManagement/queryBindingInformation", {
            carId: this.dlgBindDrivers.carId
          })
          .then(res => {
            if (!res.success) {
              this.$Message.error(res.msg);
              return;
            }
            this.dlgBindDrivers.rows = res.data;
            this.dlgBindDrivers.visible = true;
          })
          .catch(res => {
            this.$Message.error("查询车辆司机出现未知错误！");
          });
      },
      dlgBindDriversShow(id){
        this.dlgBindDrivers.carId = id;
        this.dlgBindDriversQuery();
      },


      del(id){

        this.$Modal.confirm({
          title: '提示',
          content: '<p>确定删除车辆？</p>',
          onOk: () => {
            this.$shipperService
              .post("/vehicleManagement/delete", {
                id: id
              })
              .then(res => {
                if (!res.success) {
                  this.$Message.error(res.msg);
                  return;
                }
                this.$Message.info("删除车辆成功！");
                this.query();
              })
              .catch(res => {
                this.$Message.error("删除车辆出现未知错误！");
              });
          }
        });
      },

      modify(id){

        this.$shipperService
          .post("/vehicleManagement/selectById", {
            id: id
          })
          .then(res => {
            if (!res.success) {
              this.$Message.error(res.msg);
              return;
            }
            this.dlgNew.title = "修改";
            this.dlgNew.id = res.data.id;
            this.dlgNew.carNum1 = res.data.carNumber.substr(0,1);
            this.dlgNew.carNum2 = res.data.carNumber.substr(1,6);
            this.dlgNew.carType = res.data.carType;
            this.dlgNew.carLength = res.data.carLength;
            this.dlgNew.carWeight = res.data.carCapacity;
            this.dlgNew.equip = res.data.identifyId;
            this.dlgNew.visible = true;
          })
          .catch(res => {
            this.$Message.error("查询车辆信息出现未知错误！");
          });
      },

      add() {

        this.dlgNew.title = "新增车辆";
        this.dlgNew.id = 0;
        this.dlgNew.carNum1 = "陕";
        this.dlgNew.carNum2 = "";
        this.dlgNew.carType = -1;
        this.dlgNew.carLength = "";
        this.dlgNew.carWeight = "";
        this.dlgNew.equip = "";
        this.dlgNew.visible = true;
      },
      addSubmit(){

        if (!this.dlgNew.carNum2) {
          this.$Message.warning("请输入车牌号！");
          return;
        }
        if (!/^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼]{1}[A-Z]{1}[A-Z0-9]{5}$/.test(this.dlgNew.carNum1+this.dlgNew.carNum2)) {
          this.$Message.warning("车牌号格式不正确！");
          return;
        }
        if(this.dlgNew.carType == -1){
          this.$Message.warning("请选择车辆类型！");
          return;
        }
        if (!this.dlgNew.carLength) {
          this.$Message.warning("请输入车长！");
          return;
        }
        if (!/^([1-9]\d*|0)(\.\d{1,2})?$/.test(this.dlgNew.carLength)) {
          this.$Message.warning("车长格式不正确！");
          return;
        }
        if (!this.dlgNew.carWeight) {
          this.$Message.warning("请输入载重！");
          return;
        }
        if (!/^([1-9]\d*|0)(\.\d{1,2})?$/.test(this.dlgNew.carWeight)) {
          this.$Message.warning("载重格式不正确！");
          return;
        }

        this.loading = true;
        if(this.dlgNew.id){

          this.$shipperService
            .post("/vehicleManagement/update", {
              appInCarDto: {
                id: this.dlgNew.id,
                carCapacity: this.dlgNew.carWeight,
                carLength: this.dlgNew.carLength,
                carNumber: this.dlgNew.carNum1+this.dlgNew.carNum2,
                carType: this.dlgNew.carType,
                identifyId: this.dlgNew.equip,
              }
            })
            .then(res => {
              this.loading = false;
              if (!res.success) {
                this.$Message.error(res.msg);
                return;
              }
              this.$Message.info("修改车辆成功！");
              this.dlgNew.visible = false;
              this.query();
            })
            .catch(res => {
              this.loading = false;
              this.$Message.error("新增车辆出现未知错误！");
            });
            return;
        }

        this.$shipperService
          .post("/vehicleManagement/insert", {
            appInCarDto: {
              carCapacity: this.dlgNew.carWeight,
              carLength: this.dlgNew.carLength,
              carNumber: this.dlgNew.carNum1+this.dlgNew.carNum2,
              carType: this.dlgNew.carType,
              identifyId: this.dlgNew.equip,
            }
          })
          .then(res => {
            this.loading = false;
            if (!res.success) {
              this.$Message.error(res.msg);
              return;
            }
            this.$Message.info("新增车辆成功！");
            this.dlgNew.visible = false;
            this.query();
          })
          .catch(res => {
            this.loading = false;
            this.$Message.error("新增车辆出现未知错误！");
          });
      },
      onPageChange(index) {
        this.pageIndex = index;
        this.query();
      },
      query(){

        this.loading = true;
        this.$shipperService
        .post("/vehicleManagement/selectAll", {
          carNumber: this.keyWord,
          currentPage: this.pageIndex,
          pageSize: this.pageSize,
          id: 1,
        })
        .then(res => {
          this.loading = false;
          if (!res.success) {
            this.$Message.error(res.msg);
            return;
          }
          
          this.rows = res.data;
          this.totalCount = res.total;
        })
        .catch(res => {
          this.loading = false;
          this.$Message.error("查询车辆出现未知错误！");
        });
      },
    },
    mounted(){

      this.$commonService
        .get("/system/getSystemDic", {
          key: "carType"
        })
        .then(res => {

          if (!res.success) {
            this.$Message.error(res.msg);
            return;
          }
          this.carTypeList = res.data;
          this.carTypeList.splice(0,0,{
            typeCode: -1,
            typeValue: "请选择"
          });
        })
        .catch(res => {
          this.$Message.error("获取车辆类型出现未知错误！");
        });
        
      this.query();
    }
  };
</script>
