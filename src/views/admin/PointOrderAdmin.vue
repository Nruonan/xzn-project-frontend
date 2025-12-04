<template>
  <div class="point-order-admin" style="padding: 10px 20px">
    <el-card>
      <template #header>
        <div class="card-header">
          <el-icon><ShoppingCart /></el-icon>
          积分订单管理
        </div>
      </template>
      
      <div class="desc">
        在这里管理平台的所有积分订单
      </div>
      
      <!-- 操作区域 -->
      <div style="display: flex; justify-content: space-between; margin-bottom: 15px">
        <div>
          <!-- 左侧可以放置操作按钮，如导出等 -->
        </div>
        <div style="display: flex; gap: 10px">
          <el-form :inline="true" :model="{ searchStatus, searchUsername }">
            <el-form-item label="订单状态">
              <el-select v-model="searchStatus" placeholder="请选择状态" clearable style="width: 150px">
                <el-option label="待处理" value="0" />
                <el-option label="已发货" value="1" />
                <el-option label="已完成" value="2" />
                <el-option label="已取消" value="3" />
              </el-select>
            </el-form-item>
            <el-form-item label="用户名">
              <el-input v-model="searchUsername" placeholder="请输入用户名" clearable />
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
        <el-table-column prop="id" label="订单号" width="180" />
        <el-table-column prop="uid" label="用户ID" width="100" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column label="商品信息" min-width="200">
          <template #default="scope">
            <div class="product-info">
              <el-image
                v-if="scope.row.productImage"
                :src="scope.row.productImage"
                :preview-src-list="[scope.row.productImage]"
                fit="cover"
                class="product-image"
              />
              <span>{{ scope.row.productName }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="count" label="数量" width="80" align="center" />
        <el-table-column prop="payScore" label="积分" width="100" align="center" />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="scope">
            <el-tag
              :type="scope.row.status === 0 ? 'warning' : 
                     scope.row.status === 1 ? 'primary' : 
                     scope.row.status === 2 ? 'success' : 'danger'"
            >
              {{ scope.row.status === 0 ? '待处理' : 
                 scope.row.status === 1 ? '已发货' : 
                 scope.row.status === 2 ? '已完成' : '已取消' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="下单时间" width="180">
          <template #default="scope">
            {{ formatDateTime(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="viewOrderDetail(scope.row)">
              <el-icon><Document /></el-icon>
              详情
            </el-button>
            <el-button 
              v-if="scope.row.status === 0" 
              size="small" 
              type="primary"
              @click="updateOrderStatus(scope.row, 1)"
            >
              发货
            </el-button>
            <el-button 
              v-if="scope.row.status === 1" 
              size="small" 
              type="success"
              @click="updateOrderStatus(scope.row, 2)"
            >
              完成
            </el-button>
            <el-button 
              v-if="scope.row.status === 0" 
              size="small" 
              type="danger"
              @click="updateOrderStatus(scope.row, 3)"
            >
              取消
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页区域 -->
      <div class="pagination-area">
        <el-pagination
          v-model:current-page="pagination.pageNum"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    
    <!-- 订单详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="订单详情"
      width="50%"
    >
      <div v-if="selectedOrder" class="view-content">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="订单号">{{ selectedOrder.id }}</el-descriptions-item>
          <el-descriptions-item label="用户ID">{{ selectedOrder.uid }}</el-descriptions-item>
          <el-descriptions-item label="用户名">{{ selectedOrder.username }}</el-descriptions-item>
          <el-descriptions-item label="订单状态">
            <el-tag
              :type="selectedOrder.status === 0 ? 'warning' : 
                     selectedOrder.status === 1 ? 'primary' : 
                     selectedOrder.status === 2 ? 'success' : 'danger'"
            >
              {{ selectedOrder.status === 0 ? '待处理' : 
                 selectedOrder.status === 1 ? '已发货' : 
                 selectedOrder.status === 2 ? '已完成' : '已取消' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="商品名称">{{ selectedOrder.productName }}</el-descriptions-item>
          <el-descriptions-item label="商品图片">
            <el-image
              v-if="selectedOrder.productImage"
              :src="selectedOrder.productImage"
              :preview-src-list="[selectedOrder.productImage]"
              fit="cover"
              style="width: 100px; height: 100px;"
            />
          </el-descriptions-item>
          <el-descriptions-item label="数量">{{ selectedOrder.count }}</el-descriptions-item>
          <el-descriptions-item label="积分">{{ selectedOrder.payScore }}</el-descriptions-item>
          <el-descriptions-item label="下单时间">{{ formatDateTime(selectedOrder.createTime) }}</el-descriptions-item>
          <el-descriptions-item label="发货时间">{{ formatDateTime(selectedOrder.shipTime) }}</el-descriptions-item>
          <el-descriptions-item label="完成时间">{{ formatDateTime(selectedOrder.completeTime) }}</el-descriptions-item>
          <el-descriptions-item label="收货人">{{ selectedOrder.username }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ selectedOrder.phone }}</el-descriptions-item>
          <el-descriptions-item label="收货地址" :span="2">{{ selectedOrder.address }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { Document, Search, ShoppingCart } from '@element-plus/icons-vue'
import { reactive, ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { get, post } from '@/net'

// 搜索条件
const searchStatus = ref('')
const searchUsername = ref('')

// 对话框相关
const detailDialogVisible = ref(false)

// 表格数据
const tableData = ref([])

// 选中的订单
const selectedOrder = ref(null)

// 分页数据
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

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
    status: searchStatus.value || undefined,
    username: searchUsername.value || undefined
  }
  
  // 构建查询字符串
  const queryString = Object.keys(params)
    .filter(key => params[key] !== undefined && params[key] !== '')
    .map(key => `${key}=${encodeURIComponent(params[key])}`)
    .join('&')
  
  const url = queryString ? `/api/admin/point/order/list?${queryString}` : '/api/admin/point/order/list'
  
  get(url, (data) => {
    tableData.value = data.records || []
    pagination.total = data.total || 0
  }, (message) => {
    ElMessage.error(message || '获取积分订单列表失败')
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
  searchStatus.value = ''
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

// 查看订单详情
const viewOrderDetail = (row) => {
  selectedOrder.value = row
  detailDialogVisible.value = true
}

// 更新订单状态
const updateOrderStatus = (row, status) => {
  const statusText = status === 1 ? '发货' : status === 2 ? '完成' : '取消'
  
  ElMessageBox.confirm(
    `确定要${statusText}订单"${row.id}"吗？`,
    `${statusText}确认`,
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    get(`/api/admin/point/order/update-status?id=${row.id}&status=${status}`,  (response) => {
      // 检查响应数据
      if (response === true) {
        ElMessage.success(`${statusText}成功`)
        getTableData()
      } else {
        ElMessage.error(response.message || `${statusText}失败`)
      }
    }, (message) => {
      ElMessage.error(message || `${statusText}失败`)
    })
  }).catch(() => {
    // 用户取消操作
  })
}

// 组件挂载时获取数据
onMounted(() => {
  getTableData()
})
</script>

<style scoped>
.point-order-admin {
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

.product-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.product-image {
  width: 40px;
  height: 40px;
  border-radius: 4px;
}

.view-content {
  padding: 10px 0;
}
</style>