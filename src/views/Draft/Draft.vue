<script setup lang="js">
import {useStore} from "@/store/index.js";
import {onMounted} from "vue";
const store = useStore()

</script>

<template>
  <div>
    <router-view v-slot="{ Component }">
      <transition name="el-fade-in-linear" mode="out-in">
        <keep-alive include="DraftList">
          <component :is="Component" style="height: 100%"/>
        </keep-alive>
      </transition>
    </router-view>
    <el-backtop  class="back_top" style="" target=".main-content-page .el-scrollbar__wrap" :right="20" bottom="70"></el-backtop>
  </div>
</template>

<style scoped>
.back_top{
  background-color: var(--el-button-bg-color);

  &:hover{
    cursor: pointer;
    background-color: var(--el-border-color);
  }
}
</style>