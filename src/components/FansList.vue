<script setup>


import {get} from "@/net/index.js";
import {reactive} from "vue";
import {useStore} from "@/store/index.js";
const store = useStore()
const fans = reactive({
  data: []
})

get('/follow/fans-list',data =>{
  console.log(data)
  fans.data = data
})
function refreshPage(){
  location.reload()
}
function openUserDetail(id) {
  window.open(`/index/user-detail/${id}`, '_blank');
}
const emits = defineEmits(['skip'])
</script>

<template>
  <div>
    <div v-for="(item,index) in fans.data" :key="index">
      <el-avatar :size="30" :src="store.avatarUserUrl(item.avatar)" @click="openUserDetail(item.id);  emits('skip')" style="cursor: pointer"></el-avatar>
      <div>{{item.username}}</div>
    </div>
  </div>
</template>

<style scoped>

</style>