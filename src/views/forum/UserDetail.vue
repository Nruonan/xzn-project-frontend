<script setup>
import {useStore} from "../../store/index.js";
import {useRoute} from "vue-router";
import {reactive, ref} from "vue";
import {get} from "../../net/index.js";
import {Clock, Female, Male} from "@element-plus/icons-vue";
import TopicTag from "../../components/TopicTag.vue";
import LightCard from "../../components/LightCard.vue";
import router from "../../router/index.js";
import FansList from "@/components/FansList.vue";
import FollowList from "@/components/FollowList.vue";

const store = useStore()
const route = useRoute()
const follow = ref(-1)
const fans = ref(0)
const follows = ref(0)
const loading = ref(true)
// 当前页面用户id
const userId = route.params.id;
const user = reactive({
    id:'',
    username:'',
    avatar:'',
    desc:'',
    gender:'',
    qq:'',
    wx:'',
    phone:'',
    email:'',
    follow:0,
    topics:[]
})

function init(){
  get(`/api/user/detail?id=${userId}`,data =>{
    user.id = data.id
    user.username = data.username
    user.avatar = data.avatar
    user.wx = data.wx
    user.qq = data.qq
    user.phone = data.phone
    user.email = data.email
    user.gender = data.gender
    user.desc = data.desc
    user.follow = data.follow
    user.topics = data.topics
    follow.value = data.follow
    loading.value=false
  })
}
init()
get(`/follow/fans?id=${userId}`,data =>{
  fans.value = data
})
get(`/follow/follows?id=${userId}`,data =>{
  follows.value = data
})

function Follow(id){
  get(`follow?id=${id}`,()=>{
    if (follow.value === 0) {
      follow.value = 1; // 关注
      fans.value += 1
    } else {
      follow.value = 0; // 取消关注
      fans.value -= 1
    }
  })
  console.log(follow.value)
}
function isFollow(){
  if (follow.value === 1) {
    return "已关注" // 关注
  } else {
    return "关注" // 取消关注
  }
}
const fan = reactive({
  show: false,
  data: []
})
const fol = reactive({
  show: false,
  data: []
})

</script>

<template>
  <el-card class="detail-main"   shadow = "never" v-loading="loading">
      <div style="display: flex;">
        <div style="flex: 1;">
          <el-avatar fit="fill" shape="square" :size="120" :src="store.avatarUserUrl(user.avatar)"/>
        </div>
        <div style="flex: 5;">
          <div style="margin-top: 30px;">
            <span style="font-size: 22px;font-weight: bold">
              {{user.username}}
            </span>
            <span style="margin-left: 30px">
              <el-button type="primary" v-if="store.user.id === user.id" @click="fan.show = true">粉丝</el-button>
              <span v-else>粉丝：</span>
              <span style="margin-left: 5px">{{fans}}</span>
            </span>
            <span style="margin-left: 30px">
               <el-button type="primary" v-if="store.user.id === user.id" @click="fol.show = true">关注</el-button>
              <span v-else>关注：</span>
              <span style="margin-left: 5px">{{follows}}</span>
            </span>
          </div>
          <div style="margin-top: 8px;font-size: 15px;color: grey">
           <span style="color: hotpink" v-if="user.gender === 1">
                  <el-icon><Female/></el-icon>
                </span>
            <span style="color: dodgerblue" v-if="user.gender === 0">
                  <el-icon><Male/></el-icon>
                </span>
            <span style="margin-left: 7px" >
              {{user.desc}}
            </span>
            <div style="margin-top: 17px;font-size: 13px;color: grey">
              <span v-if="user.qq">QQ: {{user.qq}}</span>
              <span style="margin-left: 5px" v-if="user.wx">微信: {{user.wx}}</span>
              <span style="margin-left: 5px" v-if="user.phone">电话: {{user.phone}}</span>
              <span style="margin-left: 5px" v-if="user.email">邮箱: {{user.email}}</span>
            </div>
          </div>
        </div>
        <div style="flex: 0">
          <el-button type="primary"  @click=Follow(user.id) v-if="user.id !== store.user.id">
            {{isFollow()}}
          </el-button>
        </div>
      </div>
      <hr>
      <el-scrollbar height="650px">
        <div v-if="store.user.id !== user.id">
          <div style="margin: 10px 0;">

          </div>
        </div>
        <hr>
        <div v-for="item in user.topics">
          <el-card shadow="hover" style="margin-top: 15px; display: flex; flex-direction: column; position: relative; cursor: pointer" @click="router.push(`/index/topic-detail/${item.id}`)">
            <div style="display: flex; flex: 1;">
              <div>
                <topic-tag :type="item.type" style="transform: translateY(-5px)"></topic-tag>
                <span style="margin-left: 5px; font-size: 18px; font-weight: bold;">{{item.title}}</span>

              </div>
            </div>
            <div style="position: absolute; bottom: 10px; right: 10px; display: flex; align-items: center;">
              <el-icon><Clock/></el-icon>
              <span style="margin-left: 2px; display: inline-block; color: grey">{{new Date(item.time).toLocaleString()}}</span>
            </div>
          </el-card>
        </div>
      </el-scrollbar>
    <el-drawer v-model="fan.show" title="粉丝列表">
      <fans-list @skip="fan.show = false;"/>
    </el-drawer>
    <el-drawer v-model="fol.show" title="关注列表">
      <follow-list @skip="fol.show = false;"/>
    </el-drawer>
  </el-card>
</template>

<style scoped>
.detail-main{
  width: 900px;
  max-height: 840px;
  margin: 20px auto;
  border-radius: 5px;
}
</style>