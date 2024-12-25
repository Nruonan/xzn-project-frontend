<script setup lang="js">
import {get} from "@/net/index.js";
import {useStore} from "@/store/index.js";
import {onMounted} from "vue";
import {apiFollowList, apiForumTypes} from "@/net/api/forum.js";
const store = useStore()


onMounted(() => {
  apiForumTypes()
  apiFollowList()
})
</script>

<template>
  <div>
    <router-view v-slot="{ Component }">
      <transition name="el-fade-in-linear" mode="out-in">
        <keep-alive include="TopicList">
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