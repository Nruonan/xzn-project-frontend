<template>
  <div class="points-detail" style="max-width: 950px; margin: 20px auto; padding: 0 20px;">
    <el-card>
      <template #header>
        <div class="card-header">
          <el-icon><Money /></el-icon>
          我的积分明细
        </div>
      </template>
      
      <div class="points-summary">
        <div class="points-balance">
          <div class="balance-label">当前积分余额</div>
          <div class="balance-value">{{ pointsBalance }}</div>
        </div>
      </div>
      
      <!-- 搜索区域 -->
      <div style="display: flex; justify-content: space-between; margin-bottom: 15px">
        <div></div>
        <div style="display: flex; gap: 10px">
          <el-select v-model="searchType" placeholder="请选择类型" clearable style="width: 150px">
            <el-option label="全部" value="" />
            <el-option label="获得" value="earn" />
            <el-option label="消费" value="spend" />
          </el-select>
          <el-date-picker
            v-model="searchDateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 220px"
          />
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </div>
      </div>
      
      <!-- 表格区域 -->
      <el-table :data="tableData" border style="width: 100%">
        <el-table-column prop="id" label="记录ID" min-width="100" />
        <el-table-column prop="type" label="类型" min-width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.type === 'exchange'" type="danger">兑换</el-tag>
            <el-tag v-else-if="scope.row.type === 'post'" type="success">发帖</el-tag>
            <el-tag v-else-if="scope.row.type === 'sign'" type="primary">签到</el-tag>
            <el-tag v-else-if="scope.row.type === 'comment'" type="warning">评论</el-tag>
            <el-tag v-else>{{ scope.row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="score" label="积分变动" min-width="100">
          <template #default="scope">
            <span :class="scope.row.score > 0 ? 'positive' : 'negative'">
              {{ scope.row.score > 0 ? '+' : '' }}{{ scope.row.score }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="说明" min-width="150" show-overflow-tooltip />
        <el-table-column prop="createTime" label="时间" min-width="180">
          <template #default="scope">
            {{ formatDateTime(scope.row.createTime) }}
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <div style="margin-top: 20px; display: flex; justify-content: center">
        <el-pagination
          v-model:current-page="pagination.pageNum"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { Money, Search } from '@element-plus/icons-vue'
import { reactive, ref, onMounted } from 'vue'
import { useStore } from '@/store/index.js'

const store = useStore()

// 积分余额
const pointsBalance = ref(1250)

// 搜索条件
const searchType = ref('')
const searchDateRange = ref('')

// 分页数据
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

// 表格数据
const tableData = ref([])

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

// 模拟静态数据（当前用户的数据）
const mockData = [
  { id: 1, uid: store.user.id, type: 'sign', score: +5, remark: '每日签到奖励', createTime: '2023-12-01 08:45:00' },
  { id: 2, uid: store.user.id, type: 'post', score: +10, remark: '发布技术文章奖励', createTime: '2023-12-01 11:15:00' },
  { id: 3, uid: store.user.id, type: 'exchange', score: -100, remark: '兑换保温杯', createTime: '2023-12-01 10:30:00' },
  { id: 4, uid: store.user.id, type: 'sign', score: +5, remark: '每日签到奖励', createTime: '2023-12-02 09:30:00' },
  { id: 5, uid: store.user.id, type: 'comment', score: +2, remark: '评论奖励', createTime: '2023-12-02 14:10:00' },
  { id: 6, uid: store.user.id, type: 'exchange', score: -50, remark: '兑换笔记本', createTime: '2023-12-02 14:20:00' },
  { id: 7, uid: store.user.id, type: 'sign', score: +5, remark: '每日签到奖励', createTime: '2023-12-03 08:15:00' },
  { id: 8, uid: store.user.id, type: 'post', score: +10, remark: '发布问题求助', createTime: '2023-12-03 10:20:00' },
  { id: 9, uid: store.user.id, type: 'exchange', score: -200, remark: '兑换蓝牙耳机', createTime: '2023-12-03 15:45:00' },
  { id: 10, uid: store.user.id, type: 'sign', score: +5, remark: '每日签到奖励', createTime: '2023-12-04 08:30:00' }
]

// 获取表格数据
const getTableData = () => {
  // 模拟分页和筛选（只显示当前用户的数据）
  let filteredData = mockData.filter(item => item.uid === store.user.id)
  
  // 根据搜索条件过滤
  if (searchType.value) {
    if (searchType.value === 'earn') {
      filteredData = filteredData.filter(item => item.score > 0)
    } else if (searchType.value === 'spend') {
      filteredData = filteredData.filter(item => item.score < 0)
    }
  }
  
  if (searchDateRange.value && searchDateRange.value.length === 2) {
    const [startDate, endDate] = searchDateRange.value
    filteredData = filteredData.filter(item => {
      const itemDate = new Date(item.createTime).toISOString().split('T')[0]
      return itemDate >= startDate && itemDate <= endDate
    })
  }
  
  // 设置总数
  pagination.total = filteredData.length
  
  // 模拟分页
  const start = (pagination.pageNum - 1) * pagination.pageSize
  const end = start + pagination.pageSize
  tableData.value = filteredData.slice(start, end)
}

// 搜索处理
const handleSearch = () => {
  pagination.pageNum = 1
  getTableData()
}

// 重置搜索
const resetSearch = () => {
  searchType.value = ''
  searchDateRange.value = ''
  pagination.pageNum = 1
  getTableData()
}

// 分页大小改变
const handleSizeChange = (val) => {
  pagination.pageSize = val
  pagination.pageNum = 1
  getTableData()
}

// 当前页改变
const handleCurrentChange = (val) => {
  pagination.pageNum = val
  getTableData()
}

// 组件挂载时获取数据
onMounted(() => {
  getTableData()
})
</script>

<style lang="less" scoped>
.points-detail {
  .card-header {
    display: flex;
    align-items: center;
    font-size: 16px;
    font-weight: bold;
    
    .el-icon {
      margin-right: 8px;
    }
  }
  
  .points-summary {
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
        font-size: 28px;
        font-weight: bold;
        color: #409eff;
      }
    }
  }
  
  .positive {
    color: #67c23a;
    font-weight: bold;
  }
  
  .negative {
    color: #f56c6c;
    font-weight: bold;
  }
}
</style>