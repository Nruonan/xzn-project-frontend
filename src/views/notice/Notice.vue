<script setup >
import {useStore} from "@/store/index.js";
const store = useStore()

</script>

<template>
  <router-view v-slot="{ Component }">
    <transition name="el-fade-in-linear" mode="out-in">
      <keep-alive include="NoticeList">
        <component :is="Component" style="height: 100%"/>
      </keep-alive>
    </transition>
  </router-view>
</template>

<style scoped>

</style>