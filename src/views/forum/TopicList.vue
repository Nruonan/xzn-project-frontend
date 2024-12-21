<script setup>

import LightCard from "../../components/LightCard.vue";
import { Calendar,
  Clock,
  CollectionTag,
  Compass,
  Document,
  Edit,
  EditPen,
  Link,
  Picture,
  Microphone, CircleCheck, Star, FolderOpened, ArrowRightBold} from '@element-plus/icons-vue'
import Weather from "../../components/Weather.vue";
import {computed, reactive, ref, watch} from "vue";
import {get} from "../../net/index.js";
import {ElMessage} from "element-plus";
import TopicEditor from "../../components/TopicEditor.vue";
import {useStore} from '../../store/index.js'
import router from "../../router/index.js";
import TopicDetail from "./TopicDetail.vue";
import TopicTag from "../../components/TopicTag.vue";
import ColorDot from "../../components/ColorDot.vue";
import InteractButton from "../../components/InteractButton.vue";
import TopicCollectList from "../../components/TopicCollectList.vue";
const store = useStore()
const weather = reactive({
  location: {},
  now:{},
  hourly: [],
  success: false
})
const topics = reactive({
  list:[],
  type: 0,
  page: 0,
  end: false,
  top: []
})
let common = reactive({
  data:{
    browser: '',
    ip : 0,
  }
})
const count = reactive({
  uv: 0,
  dau: 0
})
const collects =ref(false)
const editor = ref(false)
get('/api/common',data=>{
  common.data = data
})
get('/api/forum/types',data=>{
  store.forum.types =data
})
watch(()=>topics.type,()=> resetList(),{immediate:true})
const today = computed(()=>{
  const date = new Date();
  return `${date.getFullYear()} 年 ${date.getMonth() + 1} 月 ${date.getDate()} 日`
})

get('api/forum/top-topic',data =>{
    topics.top = data
})
function updateList(){
  if (topics.end)return
  if (topics.type === 6){
    get(`/api/forum/list-topic-follow?page=${topics.page}`,data => {
      if (data){
        data.forEach(d => topics.list.push(d))
        topics.page++
      }
      if(!data || data.length < 10){
        topics.end = true
      }
    })
  }else{
    get(`/api/forum/list-topic?page=${topics.page}&type=${topics.type}`,data => {
      if (data){
        data.forEach(d => topics.list.push(d))
        topics.page++
      }
      if(!data || data.length < 10){
        topics.end = true
      }
    })
  }
}
function onTopicCreate(){
  editor.value = false
  resetList()
}
function resetList(){
  topics.page = 0
  topics.end = false
  topics.list =[]
  updateList()
}
navigator.geolocation.getCurrentPosition(position =>{
    const longitude = position.coords.longitude
    const latitude = position.coords.latitude
    get(`/api/forum/weather?longitude=${longitude}&latitude=${latitude}`,data =>{
        Object.assign(weather, data)
        weather.success = true
    })

},error =>{
  ElMessage.warning('位置信息获取超时，请检查网络设置')
  get(`/api/forum/weather?longitude=113.3646&latitude=22.9386`,data =>{
    Object.assign(weather, data)
    weather.success = true
  })
},{
  timeout: 3000,
  enableHighAccuracy: true
})
function pushTopic(item){
  if(topics.type === 6){
    router.push(`/index/topic-detail/${item.id}`)
  }else{
    router.push(`/index/topic-detail/${item.id}`)
  }
}
get('/api/data/count',data=>{
  console.log(data)
  count.uv = data.uv
  count.dau = data.dau
})
</script>

<template>
  <div style="display: flex; margin: 20px auto; gap:20px; max-width: 925px;">
    <div style="flex: 1">
      <light-card >
          <div class="create-topic" @click="editor = true">
            <el-icon><EditPen/></el-icon>
            点击发表主题...
          </div>
        <div style="margin-top: 10px;display: flex;gap: 13px;font-size: 18px;color: grey">
          <el-icon><Edit /></el-icon>
          <el-icon><Document /></el-icon>
          <el-icon><Compass /></el-icon>
          <el-icon><Picture /></el-icon>
          <el-icon><Microphone /></el-icon>
        </div>
      </light-card>
      <light-card style="margin-top: 10px">
        <div v-for="item in topics.top" class="top-topic" @click="router.push(`/index/topic-detail/${item.id}`)">
          <el-tag type="info" size="small">置顶</el-tag>
          <div>{{item.title}}</div>
          <div>{{new Date(item.time).toLocaleDateString()}}</div>
        </div>
      </light-card>
      <light-card style="margin-top: 10px;display: flex;gap: 7px" >
        <div :class="`type-select-card ${topics.type === item.id ? 'active' : ''}`" v-for="item in store.forum.types"
             @click="topics.type = item.id">
          <color-dot :color="item.color"></color-dot>
           <span style="margin-left: 4px"> {{item.name}}</span>
        </div>
      </light-card>
      <transition name="el-fade-in" mode="out-in">
        <div v-if="topics.list?.length">
          <div style="margin-top: 10px; display: flex;flex-direction: column;gap:10px" v-infinite-scroll="updateList">
            <light-card  v-for="item in topics.list" class="topic-card" key="item.id"
                     @click="pushTopic(item)">
          <div style="display: flex">
            <div>
              <el-avatar :size="30" :src="store.avatarUserUrl(item.avatar)"></el-avatar>
            </div>
            <div style="margin-left: 7px; transform: translateY(-2px)">
              <div style="font-size: 13px; font-weight: bold">{{item.username}}</div>
              <div style="font-size: 12px;color: grey; margin-top: 4px">
                <el-icon><Clock/></el-icon>
                <div style="margin-left: 2px; display: inline-block; transform: translateY(-2px)">{{new Date(item.time).toLocaleString()}}</div>
              </div>
            </div>
          </div>
          <div style="margin-top: 10px;">
            <topic-tag :type="item.type"></topic-tag>
            <span style="font-weight: bold;margin-left: 7px">{{item.title}}</span>
          </div>
          <div class="topic-content">{{item.text}}</div>
          <div style="display: grid; grid-template-columns: repeat(3,1fr); grid-gap: 10px">
            <el-image class="topic-image" v-for="img in item.images" :src="img" fit="cover"></el-image>
          </div>
              <div style="display: flex;gap: 20px;font-size: 13px;margin-top: 10px;opacity: 0.8">
                <div>
                  <el-icon style="vertical-align: middle"><CircleCheck/></el-icon> {{item.like}}点赞
                </div>
                <div>
                  <el-icon style="vertical-align: middle"><Star/></el-icon> {{item.collect}}收藏
                </div>
              </div>
        </light-card>
          </div>
        </div>
      </transition>


    </div>
    <div style="width: 280px">
      <div style="position: sticky;top: 20px">
        <light-card>
          <div class="collect-list-button" @click="collects = true">
            <span style="margin-right: 5px"> <el-icon style="margin-right: 5px;transform: translateY(2px)"><FolderOpened/></el-icon>查看我的收藏</span>
            <el-icon style="transform: translateY(3px)"><ArrowRightBold/></el-icon>
          </div>
        </light-card>
        <light-card style="margin-top: 10px">
          <div style="font-weight: bold;" >
            <el-icon><CollectionTag/></el-icon>
            论坛公告
          </div>
          <el-divider style="margin: 10px 0"/>
          <div style="font-size: 14px;margin-top: 10px;color: grey" >
            2024年《粤港澳大湾区发展规划纲要》迎来发布5周年，港澳进一步融入国家发展大局。5年来，大湾区科创产业加速布局、软硬联通不断拓展、协同融合持续深化，
            作为中国开放程度最高、经济活力最强的区域之一，粤港澳大湾区全面开放新格局正在形成。
          </div>
        </light-card>
        <light-card style="margin-top: 10px">
          <div style="font-weight: bold">
            <el-icon><Calendar/></el-icon>
            天气信息
          </div>
          <weather :data="weather" />
        </light-card>
        <light-card style="margin-top: 10px" element-loading-text="正在加载数据...">
          <div class="info-text">
            <div>当前日期</div>
            <div>{{today}}</div>
          </div>
          <div class="info-text">
            <div>当前IP地址</div>
            <div>{{ common.data.ip }}</div>
          </div>
          <div class="info-text">
            <div>当前浏览器</div>
            <div>{{ common.data.browser }}</div>
          </div>
          <div class="info-text">
            <div>当日访问人数(ip)</div>
            <div>{{count.uv}}</div>
          </div>
          <div class="info-text">
            <div>当日活跃人数</div>
            <div>{{count.dau}}</div>
          </div>
        </light-card>
        <div style="font-size: 14px; margin-top: 10px; color: grey">
          <el-icon><Link/></el-icon>
          友情链接
          <el-divider style="margin:10px 0"/>
        </div>
        <div style="display: grid;grid-template-columns: repeat(2,1fr);grid-gap: 10px;margin-top: 10px">
          <div class="friend-link">
            <a href="https://topjavaer.cn" target="_blank" rel="noopener noreferrer">
              <el-image style="height: 100%" src="https://topjavaer.cn/logo.svg"/>
            </a>
          </div>
          <div class="friend-link">
            <a href="https://javaguide.cn" target="_blank" rel="noopener noreferrer">
              <el-image style="height: 100%" src="https://javaguide.cn/logo.png"/>
            </a>
          </div>
          <div class="friend-link">
            <a href="https://www.yuque.com/" target="_blank" rel="noopener noreferrer">
              <el-image style="height: 100%" src="https://mdn.alipayobjects.com/huamei_0prmtq/afts/img/A*IVdnTJqUp6gAAAAAAAAAAAAADvuFAQ/original"/>
            </a>
          </div>
        </div>
      </div>

    </div>
    <TopicEditor  :show="editor" @success="onTopicCreate" @close="editor=false" ></TopicEditor>
    <topic-collect-list :show="collects" @close="collects = false"></topic-collect-list>
  </div>
</template>

<style scoped lang="less">
.collect-list-button{
  font-size: 14px;
  display: flex;
  justify-content: space-between;
  transition: .3s;

  &:hover{
    cursor: pointer;
    opacity: 0.6;
  }
}
.top-topic {
  display: flex;

  div:first-of-type {
    font-size: 14px;
    margin-left: 10px;
    font-weight: bold;
    opacity: 0.8;
    transition: color .3s;

    &:hover {
      color: grey;
    }
  }

  div:nth-of-type(2) {
    flex: 1;
    color: grey;
    font-size: 13px;
    text-align: right;
  }

  &:hover {
    cursor: pointer;
  }
}
.type-select-card {
  background-color: #f5f5f5;
  padding: 2px 7px;
  font-size: 14px;
  border-radius: 3px;
  box-sizing: border-box;
  transition: background-color .3s;

  &.active {
    border: solid 1px #ead4c4;
  }

  &:hover {
    cursor: pointer;
    background-color: #dadada;
  }
}

.topic-card{
  padding: 20px;
  transition: scale .1s;
  &:hover{
    scale: 1.015;
    cursor: pointer;
  }
  .topic-content{
      font-size: 14px;
      color: grey;
      margin: 5px 0;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 3;
      overflow: hidden;
      text-overflow: ellipsis;
  }

  .topic-image{
    height: 100%;
    width: 100%;
    border-radius: 5px;
    max-height: 110px;
  }
}
.info-text{
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: grey;
}
.friend-link {
  border-radius: 5px;
  overflow: hidden;
}
.create-topic{
  background: #efefef;
  border-radius: 5px;
  height: 40px;
  font-size: 14px;
  line-height: 40px;
  padding: 0 10px;
  color: grey;
  &:hover {
    cursor: pointer;
  }
}
.dark{
  .create-topic {
    background: #343434;
  }
  .type-select-card{
    background: #282828;

    &.active{
      border: solid 1px #64594b;
    }
    &:hover{
      background-color: #5e5e5e;
    }
  }
}
</style>