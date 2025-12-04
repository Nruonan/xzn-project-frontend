<template>
  <div class="point-log-admin" style="padding: 10px 20px">
    <el-card>
      <template #header>
        <div class="card-header">
          <el-icon><Document /></el-icon>
          积分日志管理
        </div>
      </template>
      
      <div class="desc">
        在这里查看平台的所有积分变动记录
      </div>
      
      <!-- 搜索区域 -->
      <div style="display: flex; justify-content: space-between; margin-bottom: 15px">
        <div></div>
        <div style="display: flex; gap: 10px">
          <el-input
              v-model="searchUid"
              placeholder="请输入用户ID进行搜索"
              clearable
              style="width: 200px"
              @keyup.enter="handleSearch"
          />
          <el-select v-model="searchType" placeholder="请选择类型" clearable style="width: 150px">
            <el-option label="兑换" value="exchange" />
            <el-option label="发帖" value="post" />
            <el-option label="签到" value="sign" />
          </el-select>
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </div>
      </div>
      
      <!-- 表格区域 -->
      <el-table :data="tableData" border style="width: 100%">
        <el-table-column prop="id" label="日志ID" min-width="100" />
        <el-table-column prop="uid" label="用户ID" min-width="100" />
        <el-table-column prop="type" label="类型" min-width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.type === 'exchange'" type="danger">兑换</el-tag>
            <el-tag v-else-if="scope.row.type === 'post'" type="success">发帖</el-tag>
            <el-tag v-else-if="scope.row.type === 'sign'" type="primary">签到</el-tag>
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
        <el-table-column prop="refId" label="关联ID" min-width="100" />
        <el-table-column prop="remark" label="备注" min-width="150" show-overflow-tooltip />
        <el-table-column prop="createTime" label="创建时间" min-width="180">
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
import { Document, Search } from '@element-plus/icons-vue'
import { reactive, ref, onMounted } from 'vue'

// 搜索条件
const searchUid = ref('')
const searchType = ref('')

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

// 模拟静态数据
const mockData = [
  { id: 1, uid: 1001, type: 'exchange', score: -100, refId: 2001, remark: '兑换保温杯', createTime: '2023-12-01 10:30:00' },
  { id: 2, uid: 1002, type: 'post', score: +10, refId: 3001, remark: '发布技术文章奖励', createTime: '2023-12-01 11:15:00' },
  { id: 3, uid: 1003, type: 'sign', score: +5, refId: null, remark: '每日签到奖励', createTime: '2023-12-01 08:45:00' },
  { id: 4, uid: 1001, type: 'exchange', score: -50, refId: 2002, remark: '兑换笔记本', createTime: '2023-12-02 14:20:00' },
  { id: 5, uid: 1004, type: 'post', score: +10, refId: 3002, remark: '分享学习心得', createTime: '2023-12-02 16:10:00' },
  { id: 6, uid: 1005, type: 'sign', score: +5, refId: null, remark: '每日签到奖励', createTime: '2023-12-02 09:30:00' },
  { id: 7, uid: 1002, type: 'exchange', score: -200, refId: 2003, remark: '兑换蓝牙耳机', createTime: '2023-12-03 15:45:00' },
  { id: 8, uid: 1006, type: 'post', score: +10, refId: 3003, remark: '发布问题求助', createTime: '2023-12-03 10:20:00' },
  { id: 9, uid: 1007, type: 'sign', score: +5, refId: null, remark: '每日签到奖励', createTime: '2023-12-03 08:15:00' },
  { id: 10, uid: 1003, type: 'exchange', score: -80, refId: 2004, remark: '兑换鼠标', createTime: '2023-12-04 13:40:00' }
]

// 获取表格数据
const getTableData = () => {
  // 模拟分页和筛选
  let filteredData = [...mockData]
  
  // 根据搜索条件过滤
  if (searchUid.value) {
    filteredData = filteredData.filter(item => item.uid.toString().includes(searchUid.value))
  }
  
  if (searchType.value) {
    filteredData = filteredData.filter(item => item.type === searchType.value)
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
  searchUid.value = ''
  searchType.value = ''
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
.point-log-admin {
  .desc {
    color: #bababa;
    font-size: 13px;
    margin-bottom: 20px;
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