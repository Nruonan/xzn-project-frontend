<script setup>
import LightCard from "../../components/LightCard.vue";
import {
  CircleCheck,
  Clock,
  Star
} from '@element-plus/icons-vue'
import {onMounted, reactive} from "vue";
import {useStore} from '@/store/index.js'
import router from "../../router/index.js";
import TopicTag from "../../components/TopicTag.vue";
import {get} from "@/net/index.js";

const store = useStore()
const hotTopics = reactive({
  list: [],
  loading: true
})

function loadHotTopics() {
  hotTopics.loading = true;
  get('/api/forum/hot-topics', data => {
    hotTopics.list = data;
    hotTopics.loading = false;
  })
}

function pushTopic(item) {
  window.open(`/index/topic-detail/${item.id}`, '_blank')
}

// 计算7天前的日期
const sevenDaysAgo = new Date();
sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

onMounted(() => {
  loadHotTopics();
})
</script>

<template>
  <div style="display: flex; margin: 20px auto; gap:20px; max-width: 1040px; padding: 10px;">
    <div style="flex: 1">
      <light-card>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div style="font-size: 20px; font-weight: bold;">
            🔥 热门帖子
          </div>
          <!-- 添加时间范围提示 -->
          <div style="font-size: 14px; color: grey;">
            数据截止: {{ sevenDaysAgo.toLocaleDateString() }} - {{ new Date().toLocaleDateString() }}
          </div>
        </div>
        <el-divider/>
        <div v-loading="hotTopics.loading">
          <div v-if="hotTopics.list.length === 0 && !hotTopics.loading" style="text-align: center; padding: 10px;">
            暂无热门帖子
          </div>
          <div v-for="item in hotTopics.list" :key="item.id"
               style="padding: 3px 0; border-bottom: 1px solid var(--el-border-color); cursor: pointer;"
               @click="pushTopic(item)"
               class="topic-item">
            <!-- 将标题和右侧信息放在同一行 -->
            <div style="display: flex; justify-content: space-between;">
              <span style="margin-left: 10px; font-weight: bold; font-size: 24px;">{{ item.title }}</span>
              <!-- 右侧信息区域 -->
              <div style="text-align: right;">
                <!-- 热度值在上面 -->
                <div style="font-size: 18px; font-weight: bold; color: #ff6600;">
                  热度: {{ item.score }}
                </div>
                <!-- 头像和时间信息在下面 -->
                <div style="margin-top: 10px; display: flex; justify-content: flex-end; align-items: center;">
                  <el-avatar :size="24" :src="store.avatarUserUrl(item.avatar)"></el-avatar>
                  <span style="margin-left: 8px; font-size: 14px;">{{ item.username }}</span>
                  <span style="margin-left: 8px; font-size: 14px; color: grey;">
                    <el-icon style="vertical-align: middle">
                      <Clock/>
                    </el-icon>
                    {{ new Date(item.time).toLocaleDateString() }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </light-card>
    </div>
  </div>
</template>




<style scoped>
.topic-item:hover {
  background-color: var(--el-fill-color-light);
  border-radius: 5px;
  padding: 0 10px;
  margin: 0 -10px;
}
</style>

