<style scoped lang="less">
  .common-index {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    min-width: 1200px;
    .base-header {
      color: #fff;
      line-height: 60px;
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 60px;
      background-color: #303133;
      display: flex;
      .base-logo {
        font-size: 18px;
        padding: 0 30px;
        cursor: pointer;
      }
      .base-menu {
        flex: 1;
        font-size: 15px;
        padding: 0 0 0 50px;
        .base-menu-item {
          display: inline-block;
          padding: 0 30px;
          cursor: pointer;
        }
        .base-selected {
          font-weight: bold;
        }
      }
      .base-user {
        font-size: 15px;
        padding: 0 30px;
        cursor: pointer;
        .base-download {
          display: inline-block;
          margin-right: 20px;
        }
        .base-login-regist {
          display: inline-block;
        }
      }
    }
    .base-router-box {
      position: absolute;
      top: 60px;
      left: 0;
      right: 0;
      bottom: 0;
      overflow-x: hidden;
      overflow-y: auto;
      background-color: #F1F6FC;
    }
  }
  .form-login-regist {
    text-align: center;
  }
  .form-field {
    width: 80%!important;
    margin: 0 10%!important;
  }
</style>

<template>
  <div class="common-index">
    <div class="base-header">
      <div class="base-logo">
        <img src="../../images/logo.png" alt="智运 | 无车承运人平台">
      </div>
      <div class="base-menu">
        <div class="base-menu-item base-selected" v-on:click="$router.replace('/common/homepage')">首页</div>
        <div class="base-menu-item" v-on:click="showLoginform('/common/goodsource')">货源信息</div>
        <div class="base-menu-item" v-on:click="showLoginform('/common/ordermanager')">订单管理</div>
        <div class="base-menu-item" v-on:click="showLoginform('/common/transportmanager')">运单管理</div>
      </div>
      <div class="base-user">
        <div class="base-download">
          <Dropdown trigger="click">
            <a href="javascript:void(0)" style="color: white;">
                下载APP
            </a>
            <DropdownMenu slot="list" style="margin: 10px; line-height: 0px;">
              <img src="../../images/download-code.jpg" alt="">
            </DropdownMenu>
          </Dropdown>
        </div>
        <div class="base-login-regist" v-on:click="showLoginform('')">
          登录/注册
        </div>
      </div>
    </div>
    <div class="base-router-box">
      <router-view></router-view>
    </div>
    <Modal v-model="frmVisible" width="400" :mask-closable="false">
      <p slot="header" style="text-align:center;font-size: 16px;">
        <span v-bind:style="{ color: frmMode=='login'?'#409EFF':''}" v-on:click="switchTo('login')" style="cursor: pointer;">登录</span>
        <span style="color: #409EFF;">|</span>
        <span v-bind:style="{ color: frmMode=='regist'?'#409EFF':''}" v-on:click="switchTo('regist')" style="cursor: pointer;">注册</span>
      </p>
      <br>
      <div v-if="frmMode=='login'" class="form-login-regist">
        <Input class="form-field" type="text" v-model="frmLogin.userphone" @on-keydown="keydown" placeholder="手机号">
        <Icon type="ios-person-outline" slot="prepend"></Icon>
        </Input>
        <br>
        <Input class="form-field" type="password" v-model="frmLogin.password" @on-keydown="keydown" placeholder="密码">
        <Icon type="ios-locked-outline" slot="prepend"></Icon>
        </Input>
      </div>
      <div v-else class="form-login-regist">
        <div v-if="frmRegist.step==1">
          <div style="display: inline-block;">
            <img v-if="frmRegist.userType=='货主'" src="../../images/consigner-selected.png" alt="" width="100">
            <img v-else v-on:click="frmRegist.userType='货主'" src="../../images/consigner.png" alt="" width="100">
            <br>
            货主
          </div>
           &nbsp;&nbsp;
          <div style="display: inline-block;">
            <img v-if="frmRegist.userType=='承运商'" src="../../images/shipper-selected.png" alt="" width="100">
            <img v-else v-on:click="frmRegist.userType='承运商'" src="../../images/shipper.png" alt="" width="100">
            <br>
            承运商
          </div>
        </div>
        <div v-else-if="frmRegist.step==2">
          <Input class="form-field" type="text" v-model="frmRegist.userphone" placeholder="请输入手机号">
          <Icon type="ipad" slot="prepend"></Icon>
          </Input>
          <br>
          <div class="form-field" style="display: flex;">
            <Input type="password" v-model="frmRegist.userconfirmcode" placeholder="请输入验证码" style="width: 70%;">
            <Icon type="ios-locked-outline" slot="prepend"></Icon>
            </Input>
            <Button v-if="frmMode=='regist'" type="text" :disabled="!frmRegist.canSendConfirmCode" :loading="frmRegist.sendConfirmCodeLoading" @click="sendConfirmCode()" style="width: 30%; outline: none;">{{frmRegist.confirmCodeText}}</Button>
          </div>
          <br>
        </div>
        <div v-else-if="frmRegist.step==3">
          <Input class="form-field" type="text" v-model="frmRegist.userName" placeholder="请输入公司名称">
          <Icon type="ios-person-outline" slot="prepend"></Icon>
          </Input>
          <br>
          <Input class="form-field" type="password" v-model="frmRegist.password" placeholder="请输入密码">
          <Icon type="ios-locked-outline" slot="prepend"></Icon>
          </Input>
          <br>
          <Input class="form-field" type="password" v-model="frmRegist.confirmPassword" placeholder="请确认输入密码">
          <Icon type="ios-locked-outline" slot="prepend"></Icon>
          </Input>
          <br>
        </div>
      </div>
      <div slot="footer">
        <br>
        <Button v-if="frmMode=='login'" type="primary" @click="login()" long class="form-field">{{frmLogin.loginText}}</Button>
        <Button v-if="frmMode=='regist'&&(frmRegist.step==1||frmRegist.step==2)" type="primary" @click="next()" long class="form-field">下一步</Button>
        <Button v-if="frmMode=='regist'&&frmRegist.step==3" type="primary" @click="regist()" long class="form-field">注册</Button>
        <br><br>
      </div>
    </Modal>
  </div>
</template>

<script>
  import { saveToken, saveUserInfo, saveAllArea } from "../../config/utils";
  export default {
    data() {
      return {
        frmVisible: false,
        frmMode: 'login',
        frmLogin: {
          userphone: "",
          password: "",
          loginLoading: false,
          loginText: "登录",
        },
        frmRegist: {
          step: 1,
          userName: "",
          userType: "",
          userphone: "",
          userconfirmcode: "",
          password: "",
          confirmPassword: "",
          //界面状态维护参数
          canSendConfirmCode: true,
          sendConfirmCodeLoading: false,
          confirmCodeText: "发送验证码",
          timerid: 0,
        }
      };
    },
    mounted() {},
    methods: {

      showLoginform() {

        this.frmMode = "login";
        this.frmVisible = true;
      },

      switchTo(mode) {

        if(this.frmLogin.loginLoading||this.frmRegist.sendConfirmCodeLoading||!this.frmRegist.canSendConfirmCode){
          this.$Message.warning('请等待当前操作完成！');
          return;
        }

        this.frmMode = mode;

        this.frmLogin.userphone = "";
        this.frmLogin.password = "";
        this.frmLogin.loginLoading = false;
        this.frmLogin.loginText = "登录";

        this.frmRegist.step = 1;
        this.frmRegist.userType = "";
        this.frmRegist.userphone = "";
        this.frmRegist.userconfirmcode = "";
        this.frmRegist.password = "";
        this.frmRegist.confirmPassword = "";
        this.frmRegist.canSendConfirmCode = true;
        this.frmRegist.sendConfirmCodeLoading = false;
        this.frmRegist.confirmCodeText = "发送验证码";
        this.frmRegist.timerid = 0;
      },
      next() {
        if (this.frmRegist.step == 1) {
          if (!this.frmRegist.userType) {
            this.$Message.warning('请选择用户类型！');
            return;
          }
          this.frmRegist.step = this.frmRegist.step + 1;
        } else if (this.frmRegist.step == 2) {
          if (!this.frmRegist.userphone) {
            this.$Message.warning('请输入手机号码！');
            return;
          }
          if (!new RegExp("^\\d{11}$").test(this.frmRegist.userphone)) {
            this.$Message.warning('手机号码格式不正确！');
            return;
          }
          if (!this.frmRegist.userconfirmcode) {
            this.$Message.warning('请输入短信验证码！');
            return;
          }
          if (!new RegExp("^\\d{6}$").test(this.frmRegist.userconfirmcode)) {
            this.$Message.warning('短信验证码格式不正确！');
            return;
          }
          this.$commonService
            .get("/user/checkSmsCode", {
              telephone: this.frmRegist.userphone,
              code: this.frmRegist.userconfirmcode
            })
            .then(res => {
              if (!res.success) {
                this.$Message.error(res.msg);
                return;
              }
              this.frmRegist.step = this.frmRegist.step + 1;
            })
            .catch(res => {
              this.$Message.error('获取验证码出现未知错误！');
            });
        }
      },
      countDown(count) {
        this.frmRegist.confirmCodeText = "重新发送(" + count + ")";
        this.frmRegist.canSendConfirmCode = false;
        if (count <= 0) {
          clearTimeout(this.frmRegist.timerid);
          this.frmRegist.confirmCodeText = "重新发送";
          this.frmRegist.canSendConfirmCode = true;
          return;
        }
        this.frmRegist.timerid = setTimeout(() => {
          this.countDown(--count);
        }, 1000);
      },
      sendConfirmCode() {
        if (!this.frmRegist.userphone) {
          this.$Message.warning('请输入手机号码！');
          return;
        }
        if (!new RegExp("^\\d{11}$").test(this.frmRegist.userphone)) {
          this.$Message.warning('手机号码格式不正确！');
          return;
        }
        this.frmRegist.sendConfirmCodeLoading = true;
        this.frmRegist.confirmCodeText = "发送中...";
        this.$commonService
          .get("/user/createCode", {
            telephone: this.frmRegist.userphone,
            flag: "false"
          })
          .then(res => {
            if (!res.success) {
              this.$Message.error(res.msg);
              this.frmRegist.sendConfirmCodeLoading = false;
              this.countDown(0);
              return;
            }
            this.$Message.success("发送验证码成功！");
            this.frmRegist.sendConfirmCodeLoading = false;
            this.countDown(120);
          })
          .catch(res => {
            this.$Message.error("发送验证码出现未知错误！");
            this.frmRegist.sendConfirmCodeLoading = false;
            this.countDown(0);
          });
      },
      regist() {
        if (!this.frmRegist.userName) {
          this.$Message.warning('请输入公司名称！');
          return;
        }
        if (!this.frmRegist.password) {
          this.$Message.warning('请输入登录密码！');
          return;
        }
        if (this.frmRegist.password.length < 6 || this.frmRegist.password.length > 12 || !/^[0-9a-zA-Z]*$/.test(this.frmRegist.password)) {
          this.$Message.warning('新密码应该为6-12位长度字母或数字！');
          return;
        }
        if (!this.frmRegist.confirmPassword) {
          this.$Message.warning('请输入确认密码！');
          return;
        }
        if (this.frmRegist.password != this.frmRegist.confirmPassword) {
          this.$Message.warning('登录密码与确认密码不一致！');
          return;
        }
        this.$commonService
          .post("/user/registerUser", {
            user: {
              delFlag: 0,
              id: 0,
              isActive: 0,
              isToken: 0,
              password: this.frmRegist.password,
              telephone: this.frmRegist.userphone,
              tmsuserId: 0,
              userGoodsToken: {},
              userName: this.frmRegist.userName,
              userTransportToken: {},
              userType: this.frmRegist.userType == "货主" ? 1 : this.frmRegist.userType == "承运商" ? 2 : 0
            }
          })
          .then(res => {
            if (!res.success) {
              this.$Message.warning(res.msg);
              return;
            }
            this.$Message.success('注册成功！');
            this.frmVisible = false;
          });
      },
      login() {
        if (!this.frmLogin.userphone) {
          this.$Message.warning('请输入手机号码！');
          return;
        }
        if (!new RegExp("^\\d{11}$").test(this.frmLogin.userphone)) {
          this.$Message.warning('手机号码格式不正确！');
          return;
        }
        if (!this.frmLogin.password) {
          this.$Message.warning('请输入密码！');
          return;
        }
        this.frmLogin.loginLoading = true;
        this.frmLogin.loginText = "登录中...";
        this.$commonService.post("/user/login", {
            telephone: this.frmLogin.userphone,
            password: this.frmLogin.password,
          })
          .then(res => {
            this.frmLogin.loginLoading = false;
            if (!res.success) {
              this.frmLogin.loginText = "登录";
              this.$Message.error(res.msg);
              return;
            }

            saveToken(res.msg);
            saveUserInfo(res.data);
            // 获取省市区信息
            this.getAllArea();
            
            if (res.data.userType == 1) {
              //货主
              this.$Message.success("登录成功！");
              this.$router.replace("/consigner/goodsource");
            } else if (res.data.userType == 2) {
              //承运商
              this.$Message.success("登录成功！");
              this.$router.replace("/shipper/goodsource");
            } else {
              this.loginText = "登录";
              this.$Message.error("您使用的账号无法登录当前系统！");
            }
          })
          .catch(res => {
            this.frmLogin.loginLoading = false;
            this.frmLogin.loginText = "登录";
            this.$Message.error("登录出现未知错误！");
          });
      },
      keydown(e) {
        var eCode = e.keyCode ? e.keyCode : e.which ? e.which : e.charCode;
        if (eCode == 13) {
          this.login();
        }
      },
      // 获取省份
      getAllArea() {
        this.$commonService
          .get("/area/getAllAreas",{
            pId: 1,
            level: 1
          })
          .then(res=>{
            if (!res.success) {
              this.$vux.toast.text("获取省市区信息失败", "default");
              return;
            }
            saveAllArea(res.data);
          })
          .catch(err=>{

          });
      },
    }
  };
</script>
