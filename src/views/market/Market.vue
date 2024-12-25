<script setup >
import {useStore} from "@/store/index.js";
import {onMounted} from "vue";
import {apiTicketTypes} from "@/net/api/ticket.js";
const store = useStore()

onMounted(() => apiTicketTypes())
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