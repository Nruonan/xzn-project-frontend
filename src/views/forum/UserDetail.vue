<script setup>
import {useStore} from "../../store/index.js";
import {useRoute} from "vue-router";
import {reactive, ref} from "vue";
import {get} from "../../net/index.js";
import {Clock, Female, Male} from "@element-plus/icons-vue";
import TopicTag from "../../components/TopicTag.vue";

import router from "../../router/index.js";
import {apiFansDetail, apiFollowDetail} from "@/net/api/forum.js";

const store = useStore()
const route = useRoute()
const follow = ref(-1)
const fans = ref(0)
const follows = ref(0)
const together = ref(0)
const loading = ref(true)
// 当前页面用户id
const userId = route.params.id;
const activeTab = ref('topics') // 控制当前显示内容的响应式变量

// 添加粉丝和关注数据
const fansData = ref([])
const followsData = ref([])

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
function findTogether(){
  if(store.user.id.toString() !== userId.toString()){
    get(`/follow/together?id=${userId}`,data =>{
      together.value = data
    })
  }else{
    together.length = 0
  }
}
findTogether()

// 加载粉丝数据
function loadFansData() {
  if (fansData.value.length === 0) {
    apiFansDetail(data => {
      fansData.value = data
    })
  }
}

// 加载关注数据
function loadFollowsData() {
  if (followsData.value.length === 0) {
    apiFollowDetail(data => {
      followsData.value = data
    })
  }
}

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

function openUserDetail(id) {
  window.open(`/index/user-detail/${id}`, '_blank');
}

// 切换tab时加载对应数据
function handleTabChange(tab) {
  activeTab.value = tab
  if (tab === 'fans' && fansData.value.length === 0) {
    loadFansData()
  } else if (tab === 'follows' && followsData.value.length === 0) {
    loadFollowsData()
  }
}
</script>

<template>
  <el-card class="detail-main"   shadow = "never" v-loading="loading">
    <div style="margin-bottom: 5px" v-if="store.user.id.toString() !== userId.toString()">
      <el-button type="info" size="small" @click="router.push('/index')">
        返回
      </el-button>
    </div>
    <div style="display: flex;">
      <div style="flex: 1;">
        <el-avatar fit="fill" shape="square" :size="120" :src="store.avatarUserUrl(user.avatar)"/>
      </div>
      <div style="flex: 5;">
        <div style="margin-top: 30px;">
            <span style="font-size: 22px;font-weight: bold">
              {{user.username}}
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
        <el-button type="primary"  @click="Follow(user.id)" v-if="user.id !== store.user.id">
          {{isFollow()}}
        </el-button>
      </div>
    </div>
    <el-scrollbar height="600px">

      <!-- 原有的共同关注部分保持不变 -->
      <div v-if="store.user.id.toString() !== user.id.toString()&& together.length > 0">
        <div>
          <b>共同关注</b>
          <div style="display: flex">
            <div v-for="item in together.slice(0,10)" style="margin: 5px;">
              <div style="flex: 1">
                <el-avatar :src=store.avatarUserUrl(item.avatar) size="default" @click="openUserDetail(item.id)" style="cursor: pointer"></el-avatar>
                <div style="margin-left: 5px; color: grey; font-size: 13px">
                  {{item.username}}
                </div>
              </div>
            </div>
          </div>
        </div>
        <hr>
      </div>

      <!-- 使用Tabs组件替代原来的按钮 -->
      <hr>
      <el-tabs v-model="activeTab" @tab-change="handleTabChange" style="margin-top: 15px;">
        <el-tab-pane label="创建的帖子" name="topics"></el-tab-pane>
        <el-tab-pane :label="`粉丝 (${fans})`" name="fans"></el-tab-pane>
        <el-tab-pane :label="`关注 (${follows})`" name="follows"></el-tab-pane>
      </el-tabs>

      <!-- 根据activeTab显示不同内容 -->
      <div v-if="activeTab === 'topics'">
        <div v-for="item in user.topics" :key="item.id">
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
      </div>

      <!-- 粉丝列表 -->
      <div v-else-if="activeTab === 'fans'">
        <div v-if="fansData.length === 0" style="text-align: center; padding: 20px;">
          暂无粉丝数据
        </div>
        <div v-else class="user-grid">
          <div v-for="fan in fansData" :key="fan.id"
               class="user-item"
               @click="openUserDetail(fan.id)"
          >
            <el-avatar :src="store.avatarUserUrl(fan.avatar)" :size="80" style="cursor: pointer"></el-avatar>
            <div class="username">{{ fan.username }}</div>
          </div>
        </div>
      </div>

      <!-- 关注列表 -->
      <div v-else-if="activeTab === 'follows'">
        <div v-if="followsData.length === 0" style="text-align: center; padding: 20px;">
          暂无关注数据
        </div>
        <div v-else class="user-grid">
          <div v-for="follow in followsData" :key="follow.id"
               class="user-item"
               @click="openUserDetail(follow.id)"
          >
            <el-avatar :src="store.avatarUserUrl(follow.avatar)" :size="80" style="cursor: pointer"></el-avatar>
            <div class="username">{{ follow.username }}</div>
          </div>
        </div>
      </div>
    </el-scrollbar>
  </el-card>
</template>

<style scoped>
.detail-main{
  width: 900px;
  max-height: 840px;
  margin: 20px auto;
  border-radius: 5px;
}

/* 用户网格布局样式 */
.user-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 20px;
  padding: 15px;
}

.user-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}

.username {
  margin-top: 8px;
  font-size: 14px;
  text-align: center;
  word-break: break-all;
}
</style>