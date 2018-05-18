<style scoped lang="less">
  .homepage {
    position: fixed;
    top: 60px;
    bottom: 0;
    left: 0;
    right: 0;
    background-image:url('../../images/homepage1.jpg');
    background-repeat:no-repeat;
    background-attachment:fixed;
    background-position:center;
    background-size: 100% 100%;
    .content {
      height: 100%;
      background-image:url('../../images/homepage2.png');
      background-repeat:no-repeat;
      background-attachment:fixed;
      background-position: center;
      background-size: 80%;
    }
  }
</style>

<template>
  <div class="homepage">
    <div class="content"></div>
  </div>
</template>

<script>
import { getUserInfo } from '../../config/utils';
  export default {
    mounted(){
      var userInfo = getUserInfo();
      if(userInfo&&userInfo.userType==1){
        this.$router.replace("/consigner/homepage");
        return;
      }
      if(userInfo&&userInfo.userType==2){
        this.$router.replace("/shipper/homepage");
        return;
      }
    }
  }
</script>
