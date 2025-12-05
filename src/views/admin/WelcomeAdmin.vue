<script setup>
import { ref, onMounted } from 'vue'
import { useStore } from '@/store/index.js'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { 
  User, 
  ChatDotSquare, 
  Document, 
  Money, 
  Bell, 
  ToiletPaper,
  DataLine,
  Monitor,
  TrendCharts,
  Timer
} from '@element-plus/icons-vue'
import { get } from '@/net/index.js'

const store = useStore()
const router = useRouter()
const loading = ref(true)
const statistics = ref({
  userCount: 0,
  topicCount: 0,
  commentCount: 0,
  orderCount: 0,
  noticeCount: 0,
  activityCount: 0,
  todayRegisterCount: 0,
  ruleCount: 0,
  productCount: 0
})

// 获取管理员统计数据
const fetchStatistics = () => {
  get('/api/admin/user/statistics', (data) => {
    statistics.value = data
    loading.value = false
  }, (message) => {
    ElMessage.error('获取统计数据失败: ' + message)
    // 使用模拟数据作为后备
    statistics.value = {
      userCount: 0,
      topicCount: 0,
      commentCount: 0,
      orderCount: 0,
      noticeCount: 0,
      ruleCount: 0,
      activityCount: 0,
      todayRegisterCount: 0
    }
    loading.value = false
  })
}

// 快捷操作菜单配置
const quickActions = [
  { title: '用户管理', path: '/admin/user', icon: 'User', type: 'primary' },
  { title: '帖子管理', path: '/admin/forum', icon: 'ChatDotSquare', type: 'success' },
  
  { title: '公告管理', path: '/admin/notice', icon: 'Document', type: 'danger' },
  { title: '积分订单', path: '/admin/point-order', icon: 'Document', type: 'info' }
]

// 处理快捷操作点击
const handleQuickAction = (action) => {
  // 通过事件总线触发父组件的addAdminTab方法
  const adminMenu = [
    {
      title: '技术社区管理', 
      sub: [
        { title: '用户管理', index: '/admin/user' },
        { title: '帖子广场管理', index: '/admin/forum' },
        
        { title: '公告管理', index: '/admin/notice' }
      ]
    }
  ]
  
  const menuItem = adminMenu.flatMap(menu => menu.sub).find(item => item.index === action.path)
  if (menuItem) {
    // 触发自定义事件，让父组件处理标签页添加
    window.dispatchEvent(new CustomEvent('addAdminTab', { detail: menuItem }))
  }
  
  // 路由跳转
  router.push(action.path)
}

onMounted(() => {
  fetchStatistics()
  
  // 监听自定义事件，处理标签页添加
  window.addEventListener('addAdminTab', (event) => {
    // 这个事件会被AdminView组件捕获并处理
  })
})
</script>

<template>
  <div class="admin-welcome" v-loading="loading" element-loading-text="加载数据中...">
    <!-- 欢迎区域 -->
    <div class="welcome-header">
      <div class="welcome-text">
        <h1>欢迎回来，管理员</h1>
        <p>今天是管理码农社区平台的好日子，让我们一起维护这个美好的社区</p>
      </div>
      <div class="admin-info">
        <el-avatar :size="60" :src="store.avatarUserUrl(store.user.avatar)" />
        <div class="admin-detail">
          <div class="admin-name">{{ store.user.username }}</div>
          <div class="admin-role">超级管理员</div>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="statistics-container">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="8" :lg="6">
          <div class="stat-card">
            <div class="stat-icon user">
              <el-icon><User /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ statistics.userCount }}</div>
              <div class="stat-label">总用户数</div>
            </div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8" :lg="6">
          <div class="stat-card">
            <div class="stat-icon topic">
              <el-icon><ChatDotSquare /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ statistics.topicCount }}</div>
              <div class="stat-label">帖子总数</div>
            </div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8" :lg="6">
          <div class="stat-card">
            <div class="stat-icon comment">
              <el-icon><Bell /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ statistics.commentCount }}</div>
              <div class="stat-label">评论总数</div>
            </div>
          </div>
        </el-col>
        
        <el-col :xs="24" :sm="12" :md="8" :lg="6">
          <div class="stat-card">
            <div class="stat-icon order">
              <el-icon><Document /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ statistics.orderCount }}</div>
              <div class="stat-label">订单总数</div>
            </div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8" :lg="6">
          <div class="stat-card">
            <div class="stat-icon notice">
              <el-icon><Document /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ statistics.noticeCount }}</div>
              <div class="stat-label">公告数量</div>
            </div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8" :lg="6">
          <div class="stat-card">
            <div class="stat-icon activity">
              <el-icon><ToiletPaper /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ statistics.activityCount }}</div>
              <div class="stat-label">活动数量</div>
            </div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8" :lg="6">
          <div class="stat-card">
            <div class="stat-icon today">
              <el-icon><Timer /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ statistics.productCount }}</div>
              <div class="stat-label">产品数量</div>
            </div>
          </div>
        </el-col>
         <el-col :xs="24" :sm="12" :md="8" :lg="6">
          <div class="stat-card">
            <div class="stat-icon today">
              <el-icon><Timer /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ statistics.ruleCount }}</div>
              <div class="stat-label">规则数量</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 快捷操作 -->
    <div class="quick-actions">
      <el-card header="快捷操作">
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :md="8" :lg="6" v-for="(action, index) in quickActions" :key="index">
            <el-button :type="action.type" plain class="action-btn" @click="handleQuickAction(action)">
              <el-icon><component :is="action.icon" /></el-icon>
              <span>{{ action.title }}</span>
            </el-button>
          </el-col>
        </el-row>
      </el-card>
    </div>

    <!-- 系统信息 -->
    <div class="system-info">
      <el-card header="系统信息">
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :md="8">
            <div class="info-item">
              <div class="info-label">
                <el-icon><Monitor /></el-icon>
                <span>系统版本</span>
              </div>
              <div class="info-value">青轻社区 v2.1.0</div>
            </div>
          </el-col>
          <el-col :xs="24" :sm="12" :md="8">
            <div class="info-item">
              <div class="info-label">
                <el-icon><DataLine /></el-icon>
                <span>运行环境</span>
              </div>
              <div class="info-value">Node.js + Vue 3</div>
            </div>
          </el-col>
          <el-col :xs="24" :sm="12" :md="8">
            <div class="info-item">
              <div class="info-label">
                <el-icon><TrendCharts /></el-icon>
                <span>上次更新</span>
              </div>
              <div class="info-value">2023-11-15</div>
            </div>
          </el-col>
        </el-row>
      </el-card>
    </div>
  </div>
</template>

<style scoped>
.admin-welcome {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 55px);
}

.welcome-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 20px;
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  border-radius: 10px;
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.welcome-text h1 {
  margin: 0 0 10px 0;
  font-size: 28px;
  font-weight: 600;
}

.welcome-text p {
  margin: 0;
  font-size: 16px;
  opacity: 0.9;
}

.admin-info {
  display: flex;
  align-items: center;
}

.admin-detail {
  margin-left: 15px;
}

.admin-name {
  font-size: 18px;
  font-weight: 600;
}

.admin-role {
  font-size: 14px;
  opacity: 0.8;
}

.statistics-container {
  margin-bottom: 30px;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  color: white;
}

.stat-icon.user {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.topic {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-icon.comment {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}



.stat-icon.order {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.stat-icon.notice {
  background: linear-gradient(135deg, #30cfd0 0%, #330867 100%);
}

.stat-icon.activity {
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
}

.stat-icon.today {
  background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
}

.stat-icon .el-icon {
  font-size: 24px;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.quick-actions {
  margin-bottom: 30px;
}

.action-btn {
  width: 100%;
  height: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 15px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.action-btn .el-icon {
  font-size: 20px;
  margin-bottom: 5px;
}

.action-btn span {
  font-size: 14px;
}

.system-info .info-item {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.info-label {
  display: flex;
  align-items: center;
  margin-right: 10px;
  color: #606266;
}

.info-label .el-icon {
  margin-right: 5px;
  color: #409EFF;
}

.info-value {
  font-weight: 600;
  color: #303133;
}

@media (max-width: 768px) {
  .welcome-header {
    flex-direction: column;
    text-align: center;
  }
  
  .admin-info {
    margin-top: 15px;
  }
  
  .admin-detail {
    margin-left: 0;
    margin-top: 10px;
    text-align: center;
  }
}
</style>