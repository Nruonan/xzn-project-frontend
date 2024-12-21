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
  <div  style="display:flex;">
    <div v-for="(item, index) in follows.data" :key="index" class="follow-item">
      <div style="flex: 1; margin-right: 10px">
        <el-avatar :size="30" :src="store.avatarUserUrl(item.avatar)" @click="openUserDetail(item.id);  emits('skip')" style="cursor: pointer"></el-avatar>
        <div>{{ item.username }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
