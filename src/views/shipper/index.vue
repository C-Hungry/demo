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
</style>

<template>
  <div class="common-index">
    <div class="base-header">
      <div class="base-logo">
        <img src="../../images/logo.png" alt="智运 | 无车承运人平台">
      </div>
      <div class="base-menu">
        <div v-for="item in menuItems" class="base-menu-item" v-bind:key="item.path" v-bind:class="$route.path==item.path?'base-selected':''" v-on:click="linkto(item)">{{item.title}}</div>
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
        <div class="base-login-regist">
          <Dropdown trigger="click">
            <a href="javascript:void(0)" style="color: white;">
                {{userInfo.userName}}
                <Icon type="arrow-down-b"></Icon>
            </a>
            <DropdownMenu slot="list">
              <DropdownItem><router-link to="/shipper/drivermanager" style="font-size: 15px; color: #666;">司机管理</router-link></DropdownItem>
              <DropdownItem><router-link to="/shipper/carmanager" style="font-size: 15px; color: #666;">车辆管理</router-link></DropdownItem>
              <DropdownItem divided><router-link to="/shipper/changepass" style="font-size: 15px; color: #666;">修改密码</router-link></DropdownItem>
              <DropdownItem><div style="font-size: 15px; color: #666;" @click="logout">退出登录</div></DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>
    </div>
    <div class="base-router-box">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
import { removeUserInfo, removeToken, getUserInfo } from "../../config/utils";
export default {
  data() {
    return {
      userInfo: {},
      menuItems: [{
          title: "首页",
          path: "/shipper/homepage",
        },
        {
          title: "货源信息",
          path: "/shipper/goodsource",
        },
        {
          title: "订单管理",
          path: "/shipper/ordermanager",
        },
        {
          title: "运单管理",
          path: "/shipper/transportmanager",
        },
      ],
    };
  },
  mounted() {
    this.userInfo = getUserInfo();
  },
  methods: {
    linkto(item) {
      this.$router.push(item.path);
    },
    logout(){
      this.$Modal.confirm({
        title: '操作提示',
        content: '<p>您确定要退出登录吗？</p>',
        loading: true,
        onOk: () => {
          this.$commonService.post("/user/removeToken",{})
            .then(res=>{
              if (!res.success) {
                this.$Message.error('退出登录出现未知错误！');
                return;
              }
              removeUserInfo();
              removeToken();
              this.$router.replace('/common/homepage');
              this.$Modal.remove();
              this.$Message.success('退出登录成功！');
            })
            .catch(res=>{
              this.$Message.error('退出登录出现未知错误！');
            });
        }
      });
    },
  }
};
</script>
