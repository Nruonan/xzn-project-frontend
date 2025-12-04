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
        在这里管理平台的所有积分日志记录
      </div>
      
      <!-- 操作区域 -->
      <div style="display: flex; justify-content: space-between; margin-bottom: 15px">
        <div>
          <!-- 左侧可以放置操作按钮，如导出等 -->
        </div>
        <div style="display: flex; gap: 10px">
          <el-form :inline="true" :model="{ searchType, searchUsername }">
            <el-form-item label="用户名">
              <el-input v-model="searchUsername" placeholder="请输入用户名" clearable />
            </el-form-item>
            <el-form-item label="动作类型">
              <el-select v-model="searchType" placeholder="请选择动作类型" clearable style="width: 150px">
                <el-option label="发帖" value="post" />
                <el-option label="评论" value="comment" />
                <el-option label="点赞" value="like" />
              </el-select>
            </el-form-item> 
          </el-form>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="resetSearch">重置</el-button>
        </div>
      </div>
      
      <!-- 表格区域 -->
      <el-table :data="tableData" border stripe>
        <el-table-column prop="id" label="日志ID" width="100" />
        <el-table-column prop="uid" label="用户ID" width="100" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="type" label="类型" min-width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.type === 'exchange'" type="danger">兑换</el-tag>
            <el-tag v-else-if="scope.row.type === 'post'" type="success">发帖</el-tag>
            <el-tag v-else-if="scope.row.type === 'sign'" type="primary">签到</el-tag>
            <el-tag v-else>{{ scope.row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="score" label="积分变动" min-width="120" align="center">
          <template #default="scope">
            <span :class="scope.row.score > 0 ? 'positive' : 'negative'">
              {{ scope.row.score > 0 ? '+' : '' }}{{ scope.row.score }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="refId" label="关联ID" width="120" />
        <el-table-column prop="remark" label="备注" min-width="150" show-overflow-tooltip />
        <el-table-column prop="createTime" label="创建时间" width="180">
          <template #default="scope">
            {{ formatDateTime(scope.row.createTime) }}
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <div class="pagination-area">
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
import { ElMessage } from 'element-plus'
import { get } from '@/net'

// 搜索条件
const searchType = ref('')
const searchUsername = ref('')

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

// 获取表格数据
const getTableData = () => {
  const params = {
    pageNum: pagination.pageNum,
    pageSize: pagination.pageSize,
    type: searchType.value || undefined,
    username: searchUsername.value || undefined
  }
  
  // 构建查询字符串
  const queryString = Object.keys(params)
    .filter(key => params[key] !== undefined && params[key] !== '')
    .map(key => `${key}=${encodeURIComponent(params[key])}`)
    .join('&')
  
  const url = queryString ? `/api/admin/point/log/list?${queryString}` : '/api/admin/point/log/list'
  
  get(url, (data) => {
    tableData.value = data.records || []
    pagination.total = data.total || 0
  }, (message) => {
    ElMessage.error(message || '获取积分日志列表失败')
    tableData.value = []
    pagination.total = 0
  })
}

// 搜索处理
const handleSearch = () => {
  pagination.pageNum = 1
  getTableData()
}

// 重置搜索
const resetSearch = () => {
  searchType.value = ''
  searchUsername.value = ''
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

<style scoped>
.point-log-admin {
  padding: 10px 20px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.desc {
  margin-bottom: 15px;
  color: #606266;
  font-size: 14px;
}

.pagination-area {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.positive {
  color: #67c23a;
  font-weight: bold;
}

.negative {
  color: #f56c6c;
  font-weight: bold;
}
</style>