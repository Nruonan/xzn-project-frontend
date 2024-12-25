<script setup>
import {reactive} from "vue";
import {useStore} from "@/store/index.js";
import {apiFansDetail} from "@/net/api/forum.js";
const store = useStore()
const fans = reactive({
  data: []
})

apiFansDetail(data => fans.data = data)
function refreshPage(){
  location.reload()
}
function openUserDetail(id) {
  window.open(`/index/user-detail/${id}`, '_blank');
}
const emits = defineEmits(['skip'])
</script>

<template>
  <div style="display:flex;">
    <div v-for="(item,index) in fans.data" :key="index">
      <div flex="1" style="margin-right: 10px">
        <el-avatar :size="30" :src="store.avatarUserUrl(item.avatar)" @click="openUserDetail(item.id);  emits('skip')" style="cursor: pointer"></el-avatar>
        <div>{{item.username}}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>