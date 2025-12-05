<template>
  <div class="search-page">
    <div class="search-header">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索社区帖子相关内容..."
        class="search-input"
        @keyup.enter="handleSearch"
      >
        <template #append>
          <el-button :icon="Search" @click="handleSearch" />
        </template>
      </el-input>
    </div>

    <div class="search-results" v-if="hasSearched">
      <div class="results-info" v-if="searchResults.length > 0">
        找到 {{ total }} 条相关结果，关键字: "{{ currentKeyword }}"
      </div>
      <div class="no-results" v-else>
        没有找到与 "{{ currentKeyword }}" 相关的内容
      </div>

      <div class="topic-list" v-if="searchResults.length > 0">
        <div v-for="topic in searchResults" :key="topic.id" class="topic-card" @click="navigateToTopic(topic.id)">
          <div class="topic-header">
            <div class="topic-title">{{ topic.title }}</div>
            <div class="topic-type">
              <el-tag size="small" :type="getTypeTagType(topic.type)">{{ getTypeName(topic.type) }}</el-tag>
            </div>
          </div>
          
          <div class="topic-content" v-if="topic.text">
            {{ topic.text.substring(0, 150) }}{{ topic.text.length > 150 ? '...' : '' }}
          </div>
          
          <div class="topic-images" v-if="topic.images && topic.images.length > 0">
            <el-image 
              v-for="(image, index) in topic.images.slice(0, 3)" 
              :key="index"
              :src="image" 
              class="topic-image"
              fit="cover"
              :preview-src-list="topic.images"
            />
            <div v-if="topic.images.length > 3" class="more-images">
              +{{ topic.images.length - 3 }}
            </div>
          </div>
          
          <div class="topic-footer">
            <div class="topic-info">
              <el-avatar :size="24" :src="store.avatarUserUrl(topic.avatar)" />
              <span class="username">{{ topic.username }}</span>
              <span class="time">{{ formatTime(topic.time) }}</span>
            </div>
            <div class="topic-stats">
              <span class="stat-item">
                <el-icon><ChatDotRound /></el-icon>
                {{ topic.like }}
              </span>
              <span class="stat-item">
                <el-icon><Star /></el-icon>
                {{ topic.collect }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="pagination" v-if="searchResults.length > 0">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Search, ChatDotRound, Star } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { apiSearchTopics } from '@/net/api/forum.js'
import { useStore } from '@/store/index.js'

const router = useRouter()
const store = useStore()

// 搜索相关状态
const searchKeyword = ref('')
const currentKeyword = ref('')
const hasSearched = ref(false)
const searchResults = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 搜索方法
const handleSearch = () => {
  if (!searchKeyword.value.trim()) {
    ElMessage.warning('请输入搜索关键词')
    return
  }
  
  currentKeyword.value = searchKeyword.value.trim()
  currentPage.value = 1
  hasSearched.value = true
  loadSearchResults()
}

// 加载搜索结果
const loadSearchResults = () => {
  apiSearchTopics(
    currentKeyword.value,
    currentPage.value,
    pageSize.value,
    (data) => {
      searchResults.value = data|| []
      total.value = data.length || 0
    },
    (error) => {
      ElMessage.error('搜索失败: ' + (error.message || '未知错误'))
      searchResults.value = []
      total.value = 0
    }
  )
}

// 分页处理
const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
  loadSearchResults()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  loadSearchResults()
}

// 导航到帖子详情
const navigateToTopic = (id) => {
  router.push(`/index/topic-detail/${id}`)
}

// 获取类型名称
const getTypeName = (type) => {
  const types = {
    'post': '帖子',
    'ask': '求助',
    'share': '分享',
    'discuss': '讨论',
    'news': '公告'
  }
  return types[type] || '帖子'
}

// 获取类型标签颜色
const getTypeTagType = (type) => {
  const types = {
    'post': '',
    'ask': 'warning',
    'share': 'success',
    'discuss': 'info',
    'news': 'danger'
  }
  return types[type] || ''
}

// 格式化时间
const formatTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  const now = new Date()
  const diff = now - date
  
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前'
  if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前'
  if (diff < 604800000) return Math.floor(diff / 86400000) + '天前'
  
  return date.toLocaleDateString()
}

// 初始化
onMounted(() => {
  // 如果URL中有搜索参数，自动执行搜索
  const keyword = router.currentRoute.value.query.keyword
  if (keyword) {
    searchKeyword.value = keyword
    currentKeyword.value = keyword
    hasSearched.value = true
    loadSearchResults()
  }
})
</script>

<style scoped lang="less">
.search-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: var(--el-bg-color);
  min-height: 100vh;
}

.search-header {
  margin-bottom: 20px;
}

.search-input {
  width: 100%;
}

.search-results {
  margin-top: 20px;
}

.results-info {
  margin-bottom: 15px;
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.no-results {
  text-align: center;
  padding: 40px 0;
  color: var(--el-text-color-secondary);
}

.topic-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.topic-card {
  background-color: var(--el-bg-color-overlay);
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  cursor: pointer;
}

.topic-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.15);
}

.topic-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.topic-title {
  font-size: 16px;
  font-weight: bold;
  color: var(--el-text-color-primary);
  flex: 1;
  margin-right: 8px;
}

.topic-content {
  margin-bottom: 12px;
  font-size: 14px;
  color: var(--el-text-color-regular);
  line-height: 1.5;
}

.topic-images {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.topic-image {
  width: 100px;
  height: 100px;
  border-radius: 4px;
  object-fit: cover;
}

.more-images {
  width: 100px;
  height: 100px;
  border-radius: 4px;
  background-color: var(--el-fill-color-light);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.topic-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.topic-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.username {
  font-size: 14px;
  color: var(--el-text-color-primary);
}

.time {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.topic-stats {
  display: flex;
  gap: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style>