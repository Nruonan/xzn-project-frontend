<script setup>
import {onMounted, provide, ref} from "vue";
import {apiUserInfo} from "@/net/api/user.js";
import {isUnauthorized} from "@/net/index.js";
import zhCn from 'element-plus/es/locale/lang/zh-cn'
const loading = ref(false)
provide('userLoading',loading)

onMounted(() =>{
  if(!isUnauthorized()){
    apiUserInfo(loading)
  }
})
</script>

<template>
  <el-config-provider :locale="zhCn">
    <div class="wrapper">
      <router-view></router-view>
    </div>
  </el-config-provider>
</template>

<style scoped>
.wrapper {
  line-height: 1.5;
}
</style>
