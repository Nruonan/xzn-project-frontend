<template>
  <Card :icon="Money" title="我的积分" desc="查看我的积分余额和积分明细">
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
  </Card>
</template>

<script setup>
import Card from './Card.vue'
import { Money, View } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { useStore } from '@/store/index.js'
import { ref, onMounted } from 'vue'

const router = useRouter()
const store = useStore()

// 模拟积分数据
const pointsBalance = ref(1250)
const todayEarned = ref(15)
const monthEarned = ref(120)
const totalSpent = ref(350)

// 跳转到积分明细页面
const goToPointsDetail = () => {
  // 跳转到用户积分明细页面
  router.push({
    name: 'points-detail'
  })
}

// 组件挂载时可以在这里请求真实数据
onMounted(() => {
  // 这里可以调用API获取真实的积分数据
  // 例如：
  // apiGetUserPoints(store.user.id, (data) => {
  //   pointsBalance.value = data.balance
  //   todayEarned.value = data.todayEarned
  //   monthEarned.value = data.monthEarned
  //   totalSpent.value = data.totalSpent
  // })
})
</script>

<style scoped lang="less">
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