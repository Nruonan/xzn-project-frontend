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
            <el-option label="已取消" value="cancelled" />
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
        <el-table-column prop="quantity" label="数量" min-width="80" />
        <el-table-column prop="points" label="消耗积分" min-width="100" />
        <el-table-column prop="status" label="状态" min-width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.status === 'pending'" type="warning">待发货</el-tag>
            <el-tag v-else-if="scope.row.status === 'shipped'" type="primary">已发货</el-tag>
            <el-tag v-else-if="scope.row.status === 'completed'" type="success">已完成</el-tag>
            <el-tag v-else-if="scope.row.status === 'cancelled'" type="info">已取消</el-tag>
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
            <img :src="selectedOrder.productImage" alt="商品图片" class="product-image-detail" />
          </el-descriptions-item>
          <el-descriptions-item label="单价">{{ selectedOrder.points }} 积分</el-descriptions-item>
          <el-descriptions-item label="数量">{{ selectedOrder.quantity }}</el-descriptions-item>
          <el-descriptions-item label="总价">{{ selectedOrder.points * selectedOrder.quantity }} 积分</el-descriptions-item>
          <el-descriptions-item label="收货人">{{ selectedOrder.receiverName }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ selectedOrder.receiverPhone }}</el-descriptions-item>
          <el-descriptions-item label="收货地址">{{ selectedOrder.receiverAddress }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag v-if="selectedOrder.status === 'pending'" type="warning">待发货</el-tag>
            <el-tag v-else-if="selectedOrder.status === 'shipped'" type="primary">已发货</el-tag>
            <el-tag v-else-if="selectedOrder.status === 'completed'" type="success">已完成</el-tag>
            <el-tag v-else-if="selectedOrder.status === 'cancelled'" type="info">已取消</el-tag>
            <el-tag v-else>{{ selectedOrder.status }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="下单时间">{{ formatDateTime(selectedOrder.createTime) }}</el-descriptions-item>
          <el-descriptions-item label="发货时间">{{ selectedOrder.shipTime ? formatDateTime(selectedOrder.shipTime) : '未发货' }}</el-descriptions-item>
          <el-descriptions-item label="完成时间">{{ selectedOrder.completeTime ? formatDateTime(selectedOrder.completeTime) : '未完成' }}</el-descriptions-item>
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

const store = useStore()

// 积分余额
const pointsBalance = ref(1250)

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

// 模拟静态数据（当前用户的数据）
const mockData = [
  { 
    id: 'PO20231201001', 
    uid: store.user.id, 
    productName: '品牌保温杯', 
    productImage: 'https://images.unsplash.com/photo-1545235617-9465d2a55698?w=200&h=200&fit=crop',
    quantity: 1, 
    points: 200, 
    status: 'completed', 
    createTime: '2023-12-01 10:30:00',
    shipTime: '2023-12-02 09:15:00',
    completeTime: '2023-12-05 16:45:00',
    receiverName: '张三',
    receiverPhone: '13800138000',
    receiverAddress: '北京市朝阳区某某街道123号'
  },
  { 
    id: 'PO20231202002', 
    uid: store.user.id, 
    productName: '定制笔记本', 
    productImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=200&h=200&fit=crop',
    quantity: 2, 
    points: 120, 
    status: 'shipped', 
    createTime: '2023-12-02 14:20:00',
    shipTime: '2023-12-03 11:30:00',
    completeTime: null,
    receiverName: '李四',
    receiverPhone: '13900139000',
    receiverAddress: '上海市浦东新区某某路456号'
  },
  { 
    id: 'PO20231203003', 
    uid: store.user.id, 
    productName: '蓝牙耳机', 
    productImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop',
    quantity: 1, 
    points: 800, 
    status: 'pending', 
    createTime: '2023-12-03 15:45:00',
    shipTime: null,
    completeTime: null,
    receiverName: '王五',
    receiverPhone: '13700137000',
    receiverAddress: '广州市天河区某某大道789号'
  },
  { 
    id: 'PO20231204004', 
    uid: store.user.id, 
    productName: '无线蓝牙鼠标', 
    productImage: 'https://images.unsplash.com/photo-1527864550415-583f0d4e5ee4?w=200&h=200&fit=crop',
    quantity: 1, 
    points: 350, 
    status: 'completed', 
    createTime: '2023-12-04 09:20:00',
    shipTime: '2023-12-05 10:15:00',
    completeTime: '2023-12-08 14:30:00',
    receiverName: '赵六',
    receiverPhone: '13600136000',
    receiverAddress: '深圳市南山区某某科技园101号'
  },
  { 
    id: 'PO20231205005', 
    uid: store.user.id, 
    productName: '移动电源', 
    productImage: 'https://images.unsplash.com/photo-1603794064635-bde31b041990?w=200&h=200&fit=crop',
    quantity: 1, 
    points: 500, 
    status: 'cancelled', 
    createTime: '2023-12-05 11:10:00',
    shipTime: null,
    completeTime: null,
    receiverName: '孙七',
    receiverPhone: '13500135000',
    receiverAddress: '杭州市西湖区某某路202号'
  }
]

// 获取表格数据
const getTableData = () => {
  // 模拟分页和筛选（只显示当前用户的数据）
  let filteredData = mockData.filter(item => item.uid === store.user.id)
  
  // 根据搜索条件过滤
  if (searchStatus.value) {
    filteredData = filteredData.filter(item => item.status === searchStatus.value)
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
  detailDialogVisible.value = true
}

// 取消订单
const cancelOrder = (order) => {
  ElMessageBox.confirm(
    '确定要取消这个订单吗？',
    '确认取消',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    // 模拟取消订单操作
    const orderIndex = mockData.findIndex(item => item.id === order.id)
    if (orderIndex !== -1) {
      mockData[orderIndex].status = 'cancelled'
      // 如果需要更新表格数据，重新加载
      getTableData()
      
      // 更新选中的订单状态（如果详情对话框打开）
      if (selectedOrder.value && selectedOrder.value.id === order.id) {
        selectedOrder.value.status = 'cancelled'
      }
      
      ElMessage.success('订单已取消')
    }
  }).catch(() => {
    // 用户取消操作
  })
}

// 组件挂载时获取数据
onMounted(() => {
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