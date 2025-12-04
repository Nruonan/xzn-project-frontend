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
            <el-tag v-else-if="scope.row.type === 'like'" type="primary">点赞</el-tag>
            <el-tag v-else-if="scope.row.type === 'collect'" type="info">收藏</el-tag>
            <el-tag v-else-if="scope.row.type === 'comment'" type="warning">评论</el-tag>
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
import { getUserPoints, getPointsLogList } from '@/net/api/point.js'

const store = useStore()

// 积分余额
const pointsBalance = ref(0)

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

// 获取用户积分
const loadUserPoints = () => {
  getUserPoints((data) => {
    pointsBalance.value = data || 0
  }, (message) => {
    console.error('获取用户积分失败:', message)
  })
}

// 获取表格数据
const getTableData = () => {
  // 添加类型过滤条件
  let type = 0;
  console.log(searchType);
  if (searchType.value) {
    if (searchType.value === 'earn') {
      // 获得积分的类型
      type = 1 // 假设这些是获得积分的类型
    } else if (searchType.value === 'spend') {
      // 消费积分的类型
      type = 2 // 假设兑换是消费积分的类型
    } else {
      // 所有类型
      type = 0
    }
  }
  
  getPointsLogList(
    pagination.pageNum,
    pagination.pageSize,
    type,
    (data) => {
      tableData.value = data.records || []
      pagination.total = data.total || 0
      
      // 如果有日期范围过滤，在前端进行过滤（假设API不支持日期范围查询）
      if (searchDateRange.value && searchDateRange.value.length === 2) {
        const [startDate, endDate] = searchDateRange.value
        const filteredData = tableData.value.filter(item => {
          const itemDate = new Date(item.createTime).toISOString().split('T')[0]
          return itemDate >= startDate && itemDate <= endDate
        })
        
        // 更新总数和当前页数据
        pagination.total = filteredData.length
        const start = (pagination.pageNum - 1) * pagination.pageSize
        const end = start + pagination.pageSize
        tableData.value = filteredData.slice(start, end)
      }
    }, (message) => {
      console.error('获取积分明细失败:', message)
      tableData.value = []
      pagination.total = 0
    }
  )
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

// 初始化
onMounted(() => {
  loadUserPoints()
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