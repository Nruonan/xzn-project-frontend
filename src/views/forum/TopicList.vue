<script setup>

import LightCard from "../../components/LightCard.vue";
import {
  ArrowRightBold,
  Calendar,
  CircleCheck,
  Clock,
  CollectionTag,
  Compass,
  Document,
  Edit,
  EditPen,
  FolderOpened,
  Link,
  Microphone,
  Picture,
  Star
} from '@element-plus/icons-vue'
import {computed, onMounted, reactive, ref, watch} from "vue";
import {ElMessage} from "element-plus";
import TopicEditor from "../../components/TopicEditor.vue";
import {useStore} from '@/store/index.js'
import router from "../../router/index.js";
import TopicTag from "../../components/TopicTag.vue";
import ColorDot from "../../components/ColorDot.vue";
import TopicCollectList from "../../components/TopicCollectList.vue";
import {
  apiCommonData,
  apiCount,
  apiForumHotTopics,
  apiForumTopicList,
  apiForumTopicListByFollow,
  apiForumTopTopics,
  apiForumWeather
} from "@/net/api/forum.js";

const store = useStore()
const weather = reactive({
  location: {},
  now: {},
  hourly: [],
  success: false
})
const topics = reactive({
  list: [],
  type: 0,
  page: 0,
  end: false,
  top: []
})
const hotTopics = ref(0)
let common = reactive({
  data: {
    browser: '',
    ip: 0,
  }
})
const count = reactive({
  uv: 0,
  dau: 0
})
const collects = ref(false)
const editor = ref(false)

watch(() => topics.type, () => resetList(), {immediate: true})
const today = computed(() => {
  const date = new Date();
  return `${date.getFullYear()} 年 ${date.getMonth() + 1} 月 ${date.getDate()} 日`
})

function updateList() {
  if (topics.end) {
    return
  }
  if (topics.type === 6) {
    apiForumTopicListByFollow(topics.page, data => {
      if (data) {
        data.forEach(d => topics.list.push(d))
        topics.page++
      }
      if (!data || data.length < 10) {
        topics.end = true
      }
    })
  } else {
    apiForumTopicList(topics.page, topics.type, data => {
      if (data) {
        data.forEach(d => topics.list.push(d))
        topics.page++
      }
      if (!data || data.length < 10) {
        topics.end = true
      }
    })

  }
}

function onTopicCreate() {
  editor.value = false
  resetList()
}

function resetList() {
  topics.page = 0
  topics.end = false
  topics.list = []
  updateList()
}

navigator.geolocation.getCurrentPosition(position => {
  const longitude = position.coords.longitude
  const latitude = position.coords.latitude
  apiForumWeather(longitude, latitude, data => {
    Object.assign(weather, data)
    weather.success = true
  })
}, error => {
  console.info(error)
  ElMessage.warning('位置信息获取超时，请检测网络设置')
  apiForumWeather(113.40529, 22.90499, data => {
    Object.assign(weather, data)
    weather.success = true
  })
}, {
  timeout: 3000,
  enableHighAccuracy: true
})

function pushTopic(item) {
  router.push(`/index/topic-detail/${item.id}`)
}

onMounted(() => {
  apiCount(count)
  apiForumTopTopics(data => topics.top = data)
  apiCommonData(data => common.data = data)
  apiForumHotTopics(data => hotTopics.value = data)
})
</script>

<template>
  <div style="display: flex; margin: 20px auto; gap:20px; max-width: 940px; padding: 20px;">
    <div style="flex: 1">
      <light-card>
        <div class="create-topic" @click="editor = true">
          <el-icon>
            <EditPen/>
          </el-icon>
          点击发表主题...
        </div>
        <div style="margin-top: 10px;display: flex;gap: 13px;font-size: 18px;color: grey">
          <el-icon>
            <Edit/>
          </el-icon>
          <el-icon>
            <Document/>
          </el-icon>
          <el-icon>
            <Compass/>
          </el-icon>
          <el-icon>
            <Picture/>
          </el-icon>
          <el-icon>
            <Microphone/>
          </el-icon>
        </div>
      </light-card>
      <light-card style="margin-top: 10px">
        <div v-for="item in topics.top" class="top-topic"
             @click="router.push(`/index/topic-detail/${item.id}`)">
          <el-tag size="small" type="info">置顶</el-tag>
          <div>{{ item.title }}</div>
          <div>{{ new Date(item.time).toLocaleDateString() }}</div>
        </div>
      </light-card>
      <light-card style="margin-top: 10px;display: flex;gap: 7px">
        <div v-for="item in store.forum.types"
             :class="`type-select-card ${topics.type === item.id ? 'active' : ''}`"
             @click="topics.type = item.id">
          <color-dot :color="item.color"></color-dot>
          <span style="margin-left: 4px"> {{ item.name }}</span>
        </div>
      </light-card>
      <transition mode="out-in" name="el-fade-in">
        <div v-if="topics.list?.length">
          <div v-infinite-scroll="updateList"
               style="margin-top: 10px; display: flex;flex-direction: column;gap:10px">
            <light-card v-for="item in topics.list" key="item.id" class="topic-card"
                        @click="pushTopic(item)">
              <div style="display: flex">
                <div>
                  <el-avatar :size="30" :src="store.avatarUserUrl(item.avatar)"></el-avatar>
                </div>
                <div style="margin-left: 7px; transform: translateY(-2px)">
                  <div style="font-size: 13px; font-weight: bold">{{ item.username }}</div>
                  <div style="font-size: 12px;color: grey; margin-top: 4px">
                    <el-icon>
                      <Clock/>
                    </el-icon>
                    <div
                        style="margin-left: 2px; display: inline-block; transform: translateY(-2px)">
                      {{ new Date(item.time).toLocaleString() }}
                    </div>
                  </div>
                </div>
              </div>
              <div style="margin-top: 10px;">
                <topic-tag :type="item.type"></topic-tag>
                <span style="font-weight: bold;margin-left: 7px">{{ item.title }}</span>
              </div>
              <div class="topic-content">{{ item.text }}</div>
              <div style="display: grid; grid-template-columns: repeat(3,1fr); grid-gap: 10px">
                <el-image v-for="img in item.images" :src="img" class="topic-image"
                          fit="cover"></el-image>
              </div>
              <div style="display: flex;gap: 20px;font-size: 13px;margin-top: 10px;opacity: 0.8">
                <div>
                  <el-icon style="vertical-align: middle">
                    <CircleCheck/>
                  </el-icon>
                  {{ item.like }}点赞
                </div>
                <div>
                  <el-icon style="vertical-align: middle">
                    <Star/>
                  </el-icon>
                  {{ item.collect }}收藏
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
            <span style="margin-right: 5px"> <el-icon
                style="margin-right: 5px;transform: translateY(2px)"><FolderOpened/></el-icon>查看我的收藏</span>
            <el-icon style="transform: translateY(3px)">
              <ArrowRightBold/>
            </el-icon>
          </div>
        </light-card>
        <light-card style="margin-top: 10px; padding: 20px;">
          <div style="font-weight: bold; display: flex; align-items: center;">
            <el-icon>
              <CollectionTag/>
            </el-icon>
            <span style="margin-left: 5px;">论坛热帖</span>
          </div>
          <el-divider style="margin: 10px 0;"/>
          <ul style="list-style: none; padding: 0;">
            <li v-for="(item, index) in hotTopics" :key="index" class="hot-topic-item">
              <div style="display: flex; align-items: center; margin-top: 7px">
                <topic-tag :type="item.type" style="margin-right: 10px;"></topic-tag>
                <el-link style="font-size: 14px; color: #333;"
                         @click="router.push(`/index/topic-detail/${item.id}`)">
                  {{ item.title.length > 10 ? item.title.substring(0, 10) + '...' : item.title }}
                </el-link>
              </div>
            </li>
          </ul>
        </light-card>

        <light-card style="margin-top: 10px">
          <div style="font-weight: bold">
            <el-icon>
              <Calendar/>
            </el-icon>
            天气信息
          </div>
          <Weather :data="weather"/>
        </light-card>
        <light-card element-loading-text="正在加载数据..." style="margin-top: 10px">
          <div class="info-text">
            <div>当前日期</div>
            <div>{{ today }}</div>
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
            <div>{{ count.uv }}</div>
          </div>
          <div class="info-text">
            <div>当日活跃人数</div>
            <div>{{ count.dau }}</div>
          </div>
        </light-card>
        <div style="font-size: 14px; margin-top: 10px; color: grey">
          <el-icon>
            <Link/>
          </el-icon>
          友情链接
          <el-divider style="margin:10px 0"/>
        </div>
        <div
            style="display: grid;grid-template-columns: repeat(2,1fr);grid-gap: 10px;margin-top: 10px">
          <div class="friend-link">
            <a href="https://topjavaer.cn" rel="noopener noreferrer" target="_blank">
              <el-image src="https://topjavaer.cn/logo.svg" style="height: 100%"/>
            </a>
          </div>
          <div class="friend-link">
            <a href="https://javaguide.cn" rel="noopener noreferrer" target="_blank">
              <el-image src="https://javaguide.cn/logo.png" style="height: 100%"/>
            </a>
          </div>
          <div class="friend-link">
            <a href="https://www.yuque.com/" rel="noopener noreferrer" target="_blank">
              <el-image src="https://mdn.alipayobjects.com/huamei_0prmtq/afts/img/A*IVdnTJqUp6gAAAAAAAAAAAAADvuFAQ/original"
                        style="height: 100%"/>
            </a>
          </div>
        </div>
      </div>

    </div>
    <TopicEditor :show="editor" @close="editor=false" @success="onTopicCreate"></TopicEditor>
    <topic-collect-list :show="collects" @close="collects = false"></topic-collect-list>
  </div>
</template>

<style lang="less" scoped>
.collect-list-button {
  font-size: 14px;
  display: flex;
  justify-content: space-between;
  transition: .3s;

  &:hover {
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

.topic-card {
  padding: 20px;
  transition: scale .1s;

  &:hover {
    scale: 1.015;
    cursor: pointer;
  }

  .topic-content {
    font-size: 14px;
    color: grey;
    margin: 5px 0;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .topic-image {
    height: 100%;
    width: 100%;
    border-radius: 5px;
    max-height: 110px;
  }
}

.info-text {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: grey;
}

.friend-link {
  border-radius: 5px;
  overflow: hidden;
}

.create-topic {
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

.dark {
  .create-topic {
    background: #343434;
  }

  .type-select-card {
    background: #282828;

    &.active {
      border: solid 1px #64594b;
    }

    &:hover {
      background-color: #5e5e5e;
    }
  }
}
</style>