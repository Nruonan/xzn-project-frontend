<script setup>


import {get} from "@/net/index.js";
import {reactive} from "vue";
import {useStore} from "@/store/index.js";
import router from "../router/index.js";
const store = useStore()
const follows = reactive({
  data: []
})

get('/follow/follow-list',data =>{
  console.log(data)
  follows.data = data
})
function openUserDetail(id) {
  window.open(`/index/user-detail/${id}`, '_blank');
}
const emits = defineEmits(['skip'])
</script>

<template>
  <div class="follow-list">
    <div v-for="(item, index) in follows.data" :key="index" class="follow-item">
      <el-avatar :size="30" :src="store.avatarUserUrl(item.avatar)" @click="openUserDetail(item.id);  emits('skip')" style="cursor: pointer"></el-avatar>
      <div>{{ item.username }}</div>
    </div>
  </div>
</template>

<style scoped>
.follow-list {
  display: flex;
  flex-wrap: wrap; /* 允许换行 */
  justify-content: space-between; /* 子元素之间的间距 */
}

.follow-item {
  width: calc(33.33% - 20px); /* 每个item占据大约三分之一的空间，减去间距 */
  box-sizing: border-box;
  padding: 10px;
  text-align: center; /* 可选：居中文本 */
}
</style>
