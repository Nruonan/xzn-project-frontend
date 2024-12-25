<script setup>
import {onMounted, provide, ref} from "vue";
import {getUserInfo} from "@/net/api/user.js";
import {isUnauthorized} from "@/net/index.js";

const loading = ref(false)
provide('userLoading',loading)

onMounted(() =>{
  if(!isUnauthorized()){
    getUserInfo(loading)
  }
})
</script>

<template>
  <div>
    <router-view></router-view>
  </div>
</template>

<style scoped>

</style>
