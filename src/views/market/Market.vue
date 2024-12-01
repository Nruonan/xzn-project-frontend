<script setup >
import {get} from "../../net/index.js";
import {useStore} from "../../store/index.js";
const store = useStore()
get('/api/ticket/types',data=>{
  store.ticket.types = data;
})
</script>

<template>
    <router-view v-slot="{ Component }">
        <transition name="el-fade-in-linear" mode="out-in">
          <keep-alive include="TicketList">
              <component :is="Component" style="height: 100%"/>
          </keep-alive>
        </transition>
    </router-view>
</template>

<style scoped>

</style>