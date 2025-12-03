<template>
  <div class="activity-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>校园活动</h1>
      <p class="page-desc">发现精彩校园活动，丰富你的校园生活</p>
    </div>

    <!-- 搜索栏 -->
    <div class="search-box">
      <el-input
        v-model="searchTitle"
        placeholder="搜索活动标题"
        class="search-input"
        @keyup.enter="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <el-button type="primary" @click="handleSearch">搜索</el-button>
      <el-button @click="resetSearch">重置</el-button>
    </div>

    <!-- 活动列表 -->
    <div class="activity-list" v-loading="loading">
      <div 
        v-for="activity in activityList" 
        :key="activity.id" 
        class="activity-card"
        @click="viewActivityDetail(activity)"
      >
        <div class="activity-image-container">
          <el-image
            :src="activity.picture ? store.avatarUserUrl(activity.picture) : defaultImage"
            class="activity-image"
            fit="cover"
            @error="handleImageError"
          >
            <template #error>
              <div class="image-error">
                <el-icon><Picture /></el-icon>
                <span>暂无图片</span>
              </div>
            </template>
          </el-image>
          <div class="activity-status" :class="getActivityStatusClass(activity)">
            {{ getActivityStatus(activity) }}
          </div>
        </div>
        
        <div class="activity-content">
          <h3 class="activity-title">{{ activity.title }}</h3>
          <div class="activity-info">
            <div class="info-item">
              <el-icon><Location /></el-icon>
              <span>{{ activity.location || '待定' }}</span>
            </div>
            <div class="info-item">
              <el-icon><Calendar /></el-icon>
              <span>{{ formatDateTime(activity.startTime) }}</span>
            </div>
          </div>
          <div class="activity-footer">
            <el-button type="text" @click.stop="viewActivityDetail(activity)">
              查看详情
            </el-button>
          </div>
        </div>
      </div>
      
      <!-- 空状态 -->
      <el-empty v-if="!loading && activityList.length === 0" description="暂无活动数据" />
    </div>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="pagination.pageNum"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[6, 12, 18, 24]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 活动详情弹窗 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="活动详情"
      width="70%"
      :before-close="handleDetailClose"
      class="activity-detail-dialog"
    >
      <div class="detail-container" v-if="currentActivity.id">
        <el-card class="detail-card">
          <div class="detail-header">
            <h2>{{ currentActivity.title }}</h2>
            <el-tag :type="getActivityStatusTagType(currentActivity)" size="large">
              {{ getActivityStatus(currentActivity) }}
            </el-tag>
          </div>
          
          <div class="detail-content">
            <div class="detail-section">
              <h3>基本信息</h3>
              <div class="detail-grid">
                <div class="detail-item">
                  <div class="item-label">
                    <el-icon><Location /></el-icon>
                    活动地点
                  </div>
                  <div class="item-value">{{ currentActivity.location || '待定' }}</div>
                </div>
                
                <div class="detail-item">
                  <div class="item-label">
                    <el-icon><Link /></el-icon>
                    活动链接
                  </div>
                  <div class="item-value">
                    <a v-if="currentActivity.url" :href="currentActivity.url" target="_blank" class="activity-link">
                      {{ currentActivity.url }}
                    </a>
                    <span v-else>暂无链接</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="detail-section">
              <h3>时间安排</h3>
              <div class="detail-grid">
                <div class="detail-item">
                  <div class="item-label">
                    <el-icon><Calendar /></el-icon>
                    开始时间
                  </div>
                  <div class="item-value">{{ formatDateTime(currentActivity.startTime) }}</div>
                </div>
                
                <div class="detail-item">
                  <div class="item-label">
                    <el-icon><Calendar /></el-icon>
                    结束时间
                  </div>
                  <div class="item-value">{{ formatDateTime(currentActivity.endTime) }}</div>
                </div>
              </div>
            </div>
            
            <div class="detail-section" v-if="currentActivity.picture">
              <h3>活动图片</h3>
              <div class="image-container">
                <el-image
                  :src="store.avatarUserUrl(currentActivity.picture)"
                  class="activity-image"
                  fit="cover"
                  :preview-src-list="[store.avatarUserUrl(currentActivity.picture)]"
                >
                  <template #error>
                    <div class="image-error">
                      <el-icon><Picture /></el-icon>
                      <span>图片加载失败</span>
                    </div>
                  </template>
                </el-image>
              </div>
            </div>
          </div>
        </el-card>
      </div>
      
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Location, Calendar, Link, Picture } from '@element-plus/icons-vue'
import { getLatestActivity, getActivityList } from '@/net/api/activity.js'
import { useStore } from '@/store/index.js'

// 使用store
const store = useStore()

// 默认图片
const defaultImage = 'https://cube.elemecdn.com/6/94/4d3ea53c4e4c9b5cc8b5c0b2e3e5epng.png'

// 响应式数据
const loading = ref(false)
const activityList = ref([])
const searchTitle = ref('')
const detailDialogVisible = ref(false)
const currentActivity = reactive({
  id: null,
  title: '',
  url: '',
  location: '',
  picture: '',
  startTime: '',
  endTime: '',
  time: ''
})

// 分页数据
const pagination = reactive({
  pageNum: 1,
  pageSize: 12,
  total: 0
})

// 获取活动列表
const getActivityListData = () => {
  loading.value = true
  getActivityList(pagination.pageNum, pagination.pageSize, searchTitle.value, (data) => {
    activityList.value = data.records || []
    pagination.total = data.total || 0
    loading.value = false
  }, (error) => {
    ElMessage.error('获取活动列表失败')
    loading.value = false
  })
}

// 获取最新活动
const getLatestActivityData = () => {
  getLatestActivity((data) => {
    if (data && data.id) {
      activityList.value.unshift(data)
      pagination.total += 1
    }
  }, (error) => {
    console.error('获取最新活动失败:', error)
  })
}

// 搜索
const handleSearch = () => {
  pagination.pageNum = 1
  getActivityListData()
}

// 重置搜索
const resetSearch = () => {
  searchTitle.value = ''
  pagination.pageNum = 1
  getActivityListData()
}

// 分页大小变化
const handleSizeChange = (size) => {
  pagination.pageSize = size
  getActivityListData()
}

// 当前页变化
const handleCurrentChange = (page) => {
  pagination.pageNum = page
  getActivityListData()
}

// 查看活动详情
const viewActivityDetail = (activity) => {
  Object.assign(currentActivity, activity)
  detailDialogVisible.value = true
}

// 关闭详情弹窗
const handleDetailClose = () => {
  detailDialogVisible.value = false
}

// 打开活动链接
const openActivityLink = () => {
  if (currentActivity.url) {
    window.open(currentActivity.url, '_blank')
  }
}

// 格式化日期时间
const formatDateTime = (dateTime) => {
  if (!dateTime) return ''
  const date = new Date(dateTime)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).replace(/\//g, '-')
}

// 获取活动状态
const getActivityStatus = (activity) => {
  const now = new Date()
  const startTime = new Date(activity.startTime)
  const endTime = new Date(activity.endTime)
  
  if (now < startTime) {
    return '即将开始'
  } else if (now >= startTime && now <= endTime) {
    return '进行中'
  } else {
    return '已结束'
  }
}

// 获取活动状态标签类型
const getActivityStatusTagType = (activity) => {
  const status = getActivityStatus(activity)
  switch (status) {
    case '即将开始':
      return 'info'
    case '进行中':
      return 'success'
    case '已结束':
      return 'danger'
    default:
      return 'info'
  }
}

// 获取活动状态样式类
const getActivityStatusClass = (activity) => {
  const status = getActivityStatus(activity)
  return `status-${status.replace('即将开始', 'upcoming').replace('进行中', 'ongoing').replace('已结束', 'ended')}`
}

// 图片加载错误处理
const handleImageError = (e) => {
  e.target.src = defaultImage
}

// 初始化
onMounted(() => {
  getActivityListData()
  getLatestActivityData()
})
</script>

<style scoped>
.activity-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
}

.page-header h1 {
  font-size: 2.5rem;
  color: #303133;
  margin-bottom: 10px;
}

.page-desc {
  font-size: 1.1rem;
  color: #909399;
}

.search-box {
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
  gap: 10px;
}

.search-input {
  width: 300px;
}

.activity-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.activity-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
}

.activity-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.activity-image-container {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.activity-image {
  width: 100%;
  height: 100%;
  transition: transform 0.3s ease;
}

.activity-card:hover .activity-image {
  transform: scale(1.05);
}

.activity-status {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  color: #fff;
}

.status-upcoming {
  background-color: #409EFF;
}

.status-ongoing {
  background-color: #67C23A;
}

.status-ended {
  background-color: #F56C6C;
}

.image-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #909399;
}

.image-error .el-icon {
  font-size: 24px;
  margin-bottom: 10px;
}

.activity-content {
  padding: 15px;
}

.activity-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.activity-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 15px;
}

.info-item {
  display: flex;
  align-items: center;
  color: #606266;
  font-size: 14px;
}

.info-item .el-icon {
  margin-right: 5px;
  color: #409EFF;
}

.activity-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.activity-time {
  font-size: 12px;
  color: #909399;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

/* 详情弹窗样式 */
.activity-detail-dialog .detail-container {
  padding: 0;
}

.activity-detail-dialog .detail-card {
  border-radius: 8px;
  overflow: hidden;
}

.activity-detail-dialog .detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.activity-detail-dialog .detail-header h2 {
  margin: 0;
  color: #303133;
  font-weight: 600;
}

.activity-detail-dialog .detail-content {
  padding: 0 10px;
}

.activity-detail-dialog .detail-section {
  margin-bottom: 25px;
}

.activity-detail-dialog .detail-section h3 {
  margin: 0 0 15px 0;
  color: #409EFF;
  font-size: 16px;
  font-weight: 600;
  border-left: 4px solid #409EFF;
  padding-left: 10px;
}

.activity-detail-dialog .detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 15px;
}

.activity-detail-dialog .detail-item {
  background-color: #f8f9fa;
  border-radius: 6px;
  padding: 15px;
  transition: all 0.3s ease;
}

.activity-detail-dialog .detail-item:hover {
  background-color: #ecf5ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.activity-detail-dialog .item-label {
  display: flex;
  align-items: center;
  font-weight: 600;
  color: #606266;
  margin-bottom: 8px;
}

.activity-detail-dialog .item-label .el-icon {
  margin-right: 8px;
  color: #409EFF;
}

.activity-detail-dialog .item-value {
  color: #303133;
  font-size: 14px;
  word-break: break-all;
}

.activity-detail-dialog .image-container {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}

.activity-detail-dialog .activity-image {
  max-width: 100%;
  height: 300px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.activity-detail-dialog .activity-image:hover {
  transform: scale(1.02);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.activity-link {
  color: #409EFF;
  text-decoration: none;
  transition: color 0.3s ease;
}

.activity-link:hover {
  color: #66b1ff;
  text-decoration: underline;
}

@media (max-width: 768px) {
  .activity-container {
    padding: 10px;
  }
  
  .page-header h1 {
    font-size: 2rem;
  }
  
  .search-box {
    flex-direction: column;
    align-items: center;
  }
  
  .search-input {
    width: 100%;
    max-width: 300px;
  }
  
  .activity-list {
    grid-template-columns: 1fr;
  }
  
  .activity-detail-dialog .detail-grid {
    grid-template-columns: 1fr;
  }
  
  .activity-detail-dialog .detail-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .activity-detail-dialog .detail-header h2 {
    margin-bottom: 10px;
  }
}
</style>