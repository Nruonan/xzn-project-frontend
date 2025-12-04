<template>
  <Card :icon="Money" title="我的积分" desc="查看我的积分余额和积分明细">
    <div v-if="loading" class="loading-container">
      <el-icon class="is-loading loading-icon">
        <Loading />
      </el-icon>
      <div class="loading-text">加载中...</div>
    </div>
    
    <div v-else>
      <div class="points-summary">
        <div class="points-balance">
          <div class="balance-label">当前积分余额</div>
          <div class="balance-value">{{ pointsBalance }}</div>
        </div>
        <el-button type="primary" @click="goToPointsDetail" round>
          <el-icon><View /></el-icon>
          查看积分明细
        </el-button>
      </div>
      
      <div class="points-stats">
        <div class="stat-item">
          <div class="stat-label">今日获得</div>
          <div class="stat-value positive">+{{ todayEarned }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">本月获得</div>
          <div class="stat-value positive">+{{ monthEarned }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">累计消费</div>
          <div class="stat-value negative">-{{ totalSpent }}</div>
        </div>
      </div>
    </div>
  </Card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Card from './Card.vue'
import { Money, View, Loading } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { useStore } from '@/store/index.js'
import { getUserPoints, getPointStatistics } from '@/net/api/point.js'

const router = useRouter()
const store = useStore()

// 积分余额和统计信息
const pointsBalance = ref(0)
const todayEarned = ref(0)
const monthEarned = ref(0)
const totalSpent = ref(0)
const loading = ref(true) // 添加加载状态

// 获取用户积分信息
const loadUserPoints = () => {
  loading.value = true // 开始加载
  
  // 使用Promise.all等待两个请求都完成
  Promise.all([
    new Promise((resolve, reject) => {
      // 获取当前积分余额
      getUserPoints((data) => {
        resolve(data)
      }, (message) => {
        console.error('获取用户积分失败:', message)
        reject(message)
      })
    }),
    new Promise((resolve, reject) => {
      // 获取积分统计信息
      getPointStatistics((data) => {
        resolve(data)
      }, (message) => {
        console.error('获取积分统计信息失败:', message)
        reject(message)
      })
    })
  ]).then(([pointsData, statisticsData]) => {
    // 设置积分余额
    pointsBalance.value = pointsData.points || 0
    
    // 设置统计信息
    // 根据后端API返回的字段名设置对应的值
    // 后端返回的字段名：currentPoints, todayConsumedPoints, monthConsumedPoints, totalConsumedPoints
    pointsBalance.value = statisticsData.currentPoints || pointsBalance.value
    todayEarned.value = statisticsData.todayEarnedPoints || 0
    monthEarned.value = statisticsData.monthEarnedPoints || 0
    totalSpent.value = statisticsData.totalConsumedPoints || 0
  }).catch((error) => {
    console.error('加载积分数据失败:', error)
  }).finally(() => {
    loading.value = false // 加载完成
  })
}

// 跳转到积分明细页面
const goToPointsDetail = () => {
  router.push('/index/points-detail')
}

// 初始化
onMounted(() => {
  loadUserPoints()
})
</script>

<style scoped lang="less">
.loading-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 30px 0;
  
  .loading-icon {
    font-size: 24px;
    color: #409eff;
    margin-bottom: 10px;
  }
  
  .loading-text {
    font-size: 14px;
    color: #909399;
  }
}

.points-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 8px;
  
  .points-balance {
    .balance-label {
      font-size: 14px;
      color: #606266;
      margin-bottom: 5px;
    }
    
    .balance-value {
      font-size: 24px;
      font-weight: bold;
      color: #409eff;
    }
  }
}

.points-stats {
  display: flex;
  justify-content: space-around;
  gap: 15px;
  
  .stat-item {
    text-align: center;
    flex: 1;
    padding: 10px;
    background-color: #fafafa;
    border-radius: 6px;
    
    .stat-label {
      font-size: 13px;
      color: #909399;
      margin-bottom: 5px;
    }
    
    .stat-value {
      font-size: 16px;
      font-weight: bold;
    }
    
    .positive {
      color: #67c23a;
    }
    
    .negative {
      color: #f56c6c;
    }
  }
}
</style>