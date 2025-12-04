<template>
  <div class="points-order" style="max-width: 950px; margin: 20px auto; padding: 0 20px;">
    <el-card>
      <template #header>
        <div class="card-header">
          <el-icon><Document /></el-icon>
          我的积分订单
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
          <el-select v-model="searchStatus" placeholder="请选择状态" clearable style="width: 150px">
            <el-option label="全部" value="" />
            <el-option label="待发货" value="pending" />
            <el-option label="已发货" value="shipped" />
            <el-option label="已完成" value="completed" />
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
        <el-table-column prop="id" label="订单号" min-width="100" />
        <el-table-column prop="productName" label="商品名称" min-width="150" show-overflow-tooltip />
        <el-table-column prop="count" label="数量" min-width="80" />
        <el-table-column prop="payScore" label="消耗积分" min-width="100" />
        <el-table-column prop="status" label="状态" min-width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.status === 0" type="warning">待发货</el-tag>
            <el-tag v-else-if="scope.row.status === 1" type="primary">已发货</el-tag>
            <el-tag v-else-if="scope.row.status === 2" type="success">已完成</el-tag>
            <el-tag v-else>{{ scope.row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="下单时间" min-width="180">
          <template #default="scope">
            {{ formatDateTime(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="120">
          <template #default="scope">
            <el-button size="small" type="primary" @click="viewOrderDetail(scope.row)">查看详情</el-button>
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
    
    <!-- 订单详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="订单详情" width="600px">
      <div v-if="selectedOrder" class="order-detail">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="订单号">{{ selectedOrder.id }}</el-descriptions-item>
          <el-descriptions-item label="商品名称">{{ selectedOrder.productName }}</el-descriptions-item>
          <el-descriptions-item label="商品图片">
            <img :src="store.productUrl(selectedOrder.productImage)" alt="商品图片" class="product-image-detail" />
          </el-descriptions-item>
          <el-descriptions-item label="单价">{{ selectedOrder.payScore / selectedOrder.count }} 积分</el-descriptions-item>
          <el-descriptions-item label="数量">{{ selectedOrder.count }}</el-descriptions-item>
          <el-descriptions-item label="总价">{{ selectedOrder.payScore}} 积分</el-descriptions-item>
          <el-descriptions-item label="收货人">{{ selectedOrder.username }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ selectedOrder.phone }}</el-descriptions-item>
          <el-descriptions-item label="收货地址">{{ selectedOrder.address }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag v-if="selectedOrder.status === 0" type="warning">待发货</el-tag>
            <el-tag v-else-if="selectedOrder.status === 1" type="primary">已发货</el-tag>
            <el-tag v-else-if="selectedOrder.status === 2" type="success">已完成</el-tag>
            <el-tag v-else>{{ selectedOrder.status }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="下单时间">{{ formatDateTime(selectedOrder.createTime) }}</el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="detailDialogVisible = false">关闭</el-button>
          <el-button 
            v-if="selectedOrder && selectedOrder.status === 'pending'" 
            type="danger" 
            @click="cancelOrder(selectedOrder)"
          >
            取消订单
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { Document, Search } from '@element-plus/icons-vue'
import { reactive, ref, onMounted } from 'vue'
import { useStore } from '@/store/index.js'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getUserPoints, getPointsOrderList, getPointsOrderDetail, cancelPointsOrder } from '@/net/api/point.js'

const store = useStore()

// 积分余额
const pointsBalance = ref(0)

// 搜索条件
const searchStatus = ref('')
const searchDateRange = ref('')

// 分页数据
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

// 表格数据
const tableData = ref([])

// 对话框相关
const detailDialogVisible = ref(false)
const selectedOrder = ref(null)

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
  const startDate = searchDateRange.value && searchDateRange.value.length === 2 ? searchDateRange.value[0] : undefined
  const endDate = searchDateRange.value && searchDateRange.value.length === 2 ? searchDateRange.value[1] : undefined
  
  getPointsOrderList(
    pagination.pageNum,
    pagination.pageSize,
    searchStatus.value,
    startDate,
    endDate,
    (data) => {
      tableData.value = data.records || []
      pagination.total = data.total || 0
      
      // 处理图片URL，使用store中的productUrl方法
      tableData.value.forEach(order => {
        if (order.productImage) {
          order.productImage = store.productUrl(order.productImage)
        }
      })
    }, (message) => {
      console.error('获取订单列表失败:', message)
      ElMessage.error('获取订单列表失败: ' + message)
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
  searchStatus.value = ''
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

// 查看订单详情
const viewOrderDetail = (order) => {
  selectedOrder.value = order
  getPointsOrderDetail(order.id, (data) => {
    selectedOrder.value = data
    // 处理图片URL
    if (selectedOrder.value.productImage) {
      selectedOrder.value.productImage = store.productUrl(selectedOrder.value.productImage)
    }
    detailDialogVisible.value = true
  }, (message) => {
    console.error('获取订单详情失败:', message)
    ElMessage.error('获取订单详情失败: ' + message)
  })
}

// 取消订单
const cancelOrder = (order) => {
  ElMessageBox.confirm(
    '确定要取消该订单吗？取消后将返还积分。',
    '取消订单',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    cancelPointsOrder(order.id, (data) => {
      ElMessage.success('订单已取消，积分已返还')
      getTableData()
      loadUserPoints()
    }, (message) => {
      console.error('取消订单失败:', message)
      ElMessage.error('取消订单失败: ' + message)
    })
  }).catch(() => {
    // 用户取消操作
  })
}

// 初始化
onMounted(() => {
  loadUserPoints()
  getTableData()
})
</script>

<style lang="less" scoped>
.points-order {
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
  
  .product-image-detail {
    width: 100px;
    height: 100px;
    object-fit: cover;
    border-radius: 5px;
  }
}
</style>