<template>
  <div class="login-container">
    <div class="box-item desc">
      <div class="welcome">
        <p>欢迎登录  青轻社区</p>
        <p class="sub-welcome">适合当代码农的[技术社区]</p>
        <p style="font-size: 13px;font-weight: normal">默认账号：admin  默认密码：123456</p>
      </div>
    </div>
    <div class="box-item login">
      <router-view v-slot="{ Component }">
        <transition name="el-fade-in-linear" mode="out-in">
          <component :is="Component" style="height: 100%"/>
        </transition>
      </router-view>
  </div>
  </div>
</template>
<script setup>

</script>
<style lang="less" scoped>

@import 'login.less';


</style>