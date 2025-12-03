<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getActivityDetail } from '@/net/api/activity'
import { useStore } from '@/store/index.js'
import { ArrowLeft, Calendar, Location, Link, Picture } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const store = useStore()
const activity = ref({})
const loading = ref(true)

// 获取活动详情
const fetchActivityDetail = () => {
  const id = route.params.id
  if (!id) {
    ElMessage.error('活动ID不能为空')
    router.push('/index/activity')
    return
  }
  
  loading.value = true
  getActivityDetail(id, (data) => {
    activity.value = data || {}
    loading.value = false
  }, (error) => {
    ElMessage.error('获取活动详情失败: ' + (error.message || '未知错误'))
    loading.value = false
    router.push('/index/activity')
  })
}

// 返回上一页
const goBack = () => {
  router.go(-1)
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 计算活动状态
const getActivityStatus = (startTime, endTime) => {
  const now = new Date()
  const start = new Date(startTime)
  const end = new Date(endTime)
  
  if (now < start) {
    return { text: '即将开始', type: 'info' }
  } else if (now >= start && now <= end) {
    return { text: '进行中', type: 'success' }
  } else {
    return { text: '已结束', type: 'info' }
  }
}

// 处理图片加载错误
const handleImageError = (e) => {
  e.target.src = 'https://via.placeholder.com/800x400?text=活动图片'
}

// 初始化
onMounted(() => {
  fetchActivityDetail()
})
</script>

<template>
  <div class="activity-detail-container">
    <div class="header">
      <el-button @click="goBack" type="primary" plain :icon="ArrowLeft">返回</el-button>
    </div>

    <div v-loading="loading" class="activity-content">
      <div v-if="activity.id" class="activity-detail">
        <!-- 活动图片 -->
        <div class="activity-image" v-if="activity.picture">
          <img
            :src="store.avatarUserUrl(activity.picture)"
            :alt="activity.title"
            @error="handleImageError"
          />
        </div>

        <!-- 活动信息 -->
        <div class="activity-info">
          <div class="activity-header">
            <h1 class="activity-title">{{ activity.title }}</h1>
            <div class="activity-status" :class="getActivityStatus(activity.startTime, activity.endTime).type">
              {{ getActivityStatus(activity.startTime, activity.endTime).text }}
            </div>
          </div>

          <div class="activity-meta">
            <div class="meta-item" v-if="activity.startTime">
              <el-icon><Calendar /></el-icon>
              <span>{{ formatDate(activity.startTime) }} - {{ formatDate(activity.endTime) }}</span>
            </div>
            <div class="meta-item" v-if="activity.location">
              <el-icon><Location /></el-icon>
              <span>{{ activity.location }}</span>
            </div>
            <div class="meta-item" v-if="activity.link">
              <el-icon><Link /></el-icon>
              <a :href="activity.link" target="_blank" class="activity-link">{{ activity.link }}</a>
            </div>
          </div>

          <div class="activity-description" v-if="activity.description">
            <h3>活动介绍</h3>
            <div class="description-content" v-html="activity.description"></div>
          </div>

          <div class="activity-content-detail" v-if="activity.content">
            <h3>活动详情</h3>
            <div class="content-detail" v-html="activity.content"></div>
          </div>
        </div>
      </div>

      <div v-else-if="!loading" class="empty-container">
        <el-empty description="活动不存在或已被删除" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.activity-detail-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  margin-bottom: 20px;
}

.activity-content {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.activity-image {
  width: 100%;
  height: 400px;
  overflow: hidden;
}

.activity-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.activity-info {
  padding: 30px;
}

.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.activity-title {
  font-size: 28px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.activity-status {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  color: white;
}

.activity-status.success {
  background-color: #67c23a;
}

.activity-status.info {
  background-color: #909399;
}

.activity-meta {
  margin-bottom: 30px;
}

.meta-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  font-size: 16px;
  color: #666;
}

.meta-item .el-icon {
  margin-right: 8px;
  font-size: 18px;
}

.activity-link {
  color: #409eff;
  text-decoration: none;
  word-break: break-all;
}

.activity-link:hover {
  text-decoration: underline;
}

.activity-description,
.activity-content-detail {
  margin-bottom: 30px;
}

.activity-description h3,
.activity-content-detail h3 {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 15px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.description-content,
.content-detail {
  font-size: 16px;
  line-height: 1.8;
  color: #555;
}

.empty-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
}

@media (max-width: 768px) {
  .activity-detail-container {
    padding: 15px;
  }
  
  .activity-image {
    height: 250px;
  }
  
  .activity-info {
    padding: 20px;
  }
  
  .activity-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .activity-title {
    font-size: 24px;
  }
}
</style>