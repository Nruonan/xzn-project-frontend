<script setup>

import Card from "../../components/Card.vue";
import {get} from "../../net/index.js";
import {reactive} from "vue";

const now = new Date();
const month = now.getMonth() + 1;
const day = now.getDate();
const weekday = now.getDay();
const hotList = reactive({
  data:{
    list:[{
      name:'',
      url:'',
    }]
  }
})
const hour = function (){
  let h = now.getHours();
  if (h >= 0 && h < 5) {
    return '凌晨';
  } else if (h >= 5 && h < 12) {
    return '早上';
  } else if (h >= 12 && h < 14) {
    return '中午';
  } else if (h >= 14 && h < 18) {
    return '下午';
  } else {
    return '晚上';
  }
};
function  truncatedTitle(title) {
  return title.length > 20 ? title.substring(0, 19) + '...' : title;
}

get('/api/new',data=>{
  hotList.data = data
  console.log(hotList.data)
})
</script>

<template>
  <div style="display: flex; padding: 30px">
    <card class="card" style="padding: 10px">
      <div style="font-size: 20px;font-weight: bold">百度热榜</div>
      <ol class="hot">
        <li v-for="(item, index) in hotList.data[0]" :key="index">
          <el-link :href="item.url">{{ truncatedTitle(item.title) }}</el-link>
        </li>
      </ol>
    </card>
    <card class="card">
      <div style="font-size: 20px;font-weight: bold">抖音热榜</div>
      <ol class="hot">
        <li v-for="(item, index) in hotList.data[1]" :key="index">
          <el-link :href="item.url">{{ truncatedTitle(item.title) }}</el-link>
        </li>
      </ol>
    </card>
    <card class="card">
      <div style="font-size: 20px;font-weight: bold">微博热搜</div>
      <ol class="hot">
        <li v-for="(item, index) in hotList.data[2]" :key="index">
          <el-link :href="item.url">{{ truncatedTitle(item.title) }}</el-link>
        </li>
      </ol>
    </card>
    <card style="margin-left: 20px; width: 250px;height: 200px; padding: 10px">
      <div style="font-size: 17px;color:grey;">
        <div>📣 摸鱼提醒：</div>
        <div style="margin-top: 5px">
          今天是 {{month}}月{{day}}日，周 {{weekday}} 的{{ hour()}}
          认认真真地上班，根本不叫赚钱，这是劳动换取报酬。只有偷懒，在上班的时候浑水摸鱼，那才是从你老板那赚到了钱。
        </div>
        <div style="margin-top: 4px" v-if="weekday <= 5">
          离周末还有{{5 - weekday}}天
        </div>
        <div style="margin-top: 4px" v-else>
          正值周末，多陪陪家人
        </div>
      </div>
    </card>
  </div>
  <div style="display: flex; margin-left: 30px">
    <card class="card">
      <div style="font-size: 20px;font-weight: bold">知乎热议</div>
      <ol class="hot">
        <li v-for="(item, index) in hotList.data[3]" :key="index">
          <el-link :href="item.url">{{ truncatedTitle(item.title) }}</el-link>
        </li>
      </ol>
    </card>
    <card class="card">
      <div style="font-size: 20px;font-weight: bold">B站热榜</div>
      <ol class="hot">
        <li v-for="(item, index) in hotList.data[4]" :key="index">
          <el-link :href="item.url">{{ truncatedTitle(item.title) }}</el-link>
        </li>
      </ol>
    </card>
    <card class="card">
      <div style="font-size: 20px;font-weight: bold">头条热榜</div>
      <ol class="hot">
        <li v-for="(item, index) in hotList.data[5]" :key="index">
          <el-link :href="item.url">{{ truncatedTitle(item.title) }}</el-link>
        </li>
      </ol>
    </card>
  </div>
</template>

<style scoped>
.card{
  width: 350px;
  height: 400px;
  border-radius: 15px;
  margin-right: 15px;
}
.hot{
  margin-top: 10px;
  font-size: 19px;
  color: grey
}
</style>