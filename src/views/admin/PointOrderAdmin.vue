<template>
  <div class="point-order-admin" style="padding: 10px 20px">
    <el-card>
      <template #header>
        <div class="card-header">
          <el-icon><Document /></el-icon>
          积分订单管理
        </div>
      </template>
      
      <div class="desc">
        在这里管理平台的所有积分兑换订单
      </div>
      
      <!-- 搜索区域 -->
      <div style="display: flex; justify-content: space-between; margin-bottom: 15px">
        <div></div>
        <div style="display: flex; gap: 10px">
          <el-select v-model="searchStatus" placeholder="请选择状态" clearable style="width: 120px">
            <el-option label="全部" value="" />
            <el-option label="待发货" value="pending" />
            <el-option label="已发货" value="shipped" />
            <el-option label="已完成" value="completed" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
          <el-input
              v-model="searchOrderId"
              placeholder="订单号"
              clearable
              style="width: 150px"
          />
          <el-input
              v-model="searchProductName"
              placeholder="商品名称"
              clearable
              style="width: 150px"
          />
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
        <el-table-column prop="id" label="订单号" min-width="120" show-overflow-tooltip />
        <el-table-column prop="uid" label="用户ID" min-width="80" />
        <el-table-column prop="username" label="用户名" min-width="100" show-overflow-tooltip />
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
        <el-table-column label="操作" min-width="180" fixed="right">
          <template #default="scope">
            <el-button-group>
              <el-button size="small" @click="viewOrderDetail(scope.row)">查看</el-button>
              <el-button 
                size="small" 
                type="primary" 
                @click="editOrderStatus(scope.row)"
                :disabled="scope.row.status === 'completed' || scope.row.status === 'cancelled'"
              >
                发货
              </el-button>
              <el-button 
                size="small" 
                type="danger" 
                @click="deleteOrder(scope.row)"
                :disabled="scope.row.status === 'completed'"
              >
                删除
              </el-button>
            </el-button-group>
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
    <el-dialog v-model="detailDialogVisible" title="订单详情" width="700px">
      <div v-if="selectedOrder" class="order-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="订单号" :span="2">{{ selectedOrder.id }}</el-descriptions-item>
          <el-descriptions-item label="用户ID">{{ selectedOrder.uid }}</el-descriptions-item>
          <el-descriptions-item label="用户名">{{ selectedOrder.username }}</el-descriptions-item>
          <el-descriptions-item label="商品名称" :span="2">{{ selectedOrder.productName }}</el-descriptions-item>
          <el-descriptions-item label="商品图片" :span="2">
            <img :src="selectedOrder.productImage" alt="商品图片" class="product-image-detail" />
          </el-descriptions-item>
          <el-descriptions-item label="单价">{{ selectedOrder.points }} 积分</el-descriptions-item>
          <el-descriptions-item label="数量">{{ selectedOrder.quantity }}</el-descriptions-item>
          <el-descriptions-item label="总价">{{ selectedOrder.points * selectedOrder.quantity }} 积分</el-descriptions-item>
          <el-descriptions-item label="收货人">{{ selectedOrder.receiverName }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ selectedOrder.receiverPhone }}</el-descriptions-item>
          <el-descriptions-item label="收货地址" :span="2">{{ selectedOrder.receiverAddress }}</el-descriptions-item>
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
        </span>
      </template>
    </el-dialog>
    
    <!-- 编辑订单状态对话框 -->
    <el-dialog v-model="editDialogVisible" title="订单发货" width="500px">
      <el-form label-position="top">
        <el-alert title="确认发货后，订单状态将更新为已发货" type="info" show-icon style="margin-bottom: 20px;" />
        <el-form-item label="订单号">
          <el-input v-model="editOrder.id" disabled />
        </el-form-item>
        <el-form-item label="商品名称">
          <el-input v-model="editOrder.productName" disabled />
        </el-form-item>
        <el-form-item label="收货人信息">
          <div class="receiver-info">
            <p><strong>收货人：</strong>{{ editOrder.receiverName }}</p>
            <p><strong>联系电话：</strong>{{ editOrder.receiverPhone }}</p>
            <p><strong>收货地址：</strong>{{ editOrder.receiverAddress }}</p>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmShipOrder">确认发货</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { Document, Search } from '@element-plus/icons-vue'
import { reactive, ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 搜索条件
const searchStatus = ref('')
const searchOrderId = ref('')
const searchProductName = ref('')
const searchDateRange = ref('')

// 对话框相关
const detailDialogVisible = ref(false)
const editDialogVisible = ref(false)

// 表格数据
const tableData = ref([])

// 选中的订单
const selectedOrder = ref(null)

// 编辑的订单
const editOrder = reactive({
  id: '',
  productName: '',
  receiverName: '',
  receiverPhone: '',
  receiverAddress: ''
})

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

// 模拟静态数据（所有用户的订单数据）
const mockData = [
  { 
    id: 'PO20231201001', 
    uid: 1001, 
    username: '张三',
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
    uid: 1002, 
    username: '李四',
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
    uid: 1003, 
    username: '王五',
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
    uid: 1004, 
    username: '赵六',
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
    uid: 1005, 
    username: '孙七',
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
  },
  { 
    id: 'PO20231206006', 
    uid: 1006, 
    username: '周八',
    productName: '智能手环', 
    productImage: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=200&h=200&fit=crop',
    quantity: 1, 
    points: 600, 
    status: 'pending', 
    createTime: '2023-12-06 16:30:00',
    shipTime: null,
    completeTime: null,
    receiverName: '周八',
    receiverPhone: '13400134000',
    receiverAddress: '成都市锦江区某某大街303号'
  },
  { 
    id: 'PO20231207007', 
    uid: 1007, 
    username: '吴九',
    productName: '机械键盘', 
    productImage: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=200&h=200&fit=crop',
    quantity: 1, 
    points: 450, 
    status: 'shipped', 
    createTime: '2023-12-07 09:15:00',
    shipTime: '2023-12-08 14:20:00',
    completeTime: null,
    receiverName: '吴九',
    receiverPhone: '13300133000',
    receiverAddress: '武汉市江汉区某某路404号'
  }
]

// 获取表格数据
const getTableData = () => {
  // 模拟分页和筛选（显示所有用户的订单数据）
  let filteredData = [...mockData]
  
  // 根据搜索条件过滤
  if (searchStatus.value) {
    filteredData = filteredData.filter(item => item.status === searchStatus.value)
  }
  
  if (searchOrderId.value) {
    filteredData = filteredData.filter(item => item.id.includes(searchOrderId.value))
  }
  
  if (searchProductName.value) {
    filteredData = filteredData.filter(item => item.productName.includes(searchProductName.value))
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
  searchOrderId.value = ''
  searchProductName.value = ''
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

// 编辑订单状态（发货）
const editOrderStatus = (order) => {
  editOrder.id = order.id
  editOrder.productName = order.productName
  editOrder.receiverName = order.receiverName
  editOrder.receiverPhone = order.receiverPhone
  editOrder.receiverAddress = order.receiverAddress
  editDialogVisible.value = true
}

// 确认发货
const confirmShipOrder = () => {
  // 模拟发货操作
  const orderIndex = mockData.findIndex(item => item.id === editOrder.id)
  if (orderIndex !== -1) {
    mockData[orderIndex].status = 'shipped'
    mockData[orderIndex].shipTime = new Date().toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(/\//g, '-')
    
    // 如果需要更新表格数据，重新加载
    getTableData()
    
    ElMessage.success('订单已发货')
    editDialogVisible.value = false
  }
}

// 删除订单
const deleteOrder = (order) => {
  ElMessageBox.confirm(
    '确定要删除这个订单吗？此操作不可恢复！',
    '确认删除',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    // 模拟删除订单操作
    const orderIndex = mockData.findIndex(item => item.id === order.id)
    if (orderIndex !== -1) {
      mockData.splice(orderIndex, 1)
      // 重新加载表格数据
      getTableData()
      ElMessage.success('订单已删除')
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
.point-order-admin {
  .card-header {
    display: flex;
    align-items: center;
    font-size: 16px;
    font-weight: bold;
    
    .el-icon {
      margin-right: 8px;
    }
  }
  
  .desc {
    color: #bababa;
    font-size: 13px;
    margin-bottom: 20px;
  }
  
  .product-image-detail {
    width: 100px;
    height: 100px;
    object-fit: cover;
    border-radius: 5px;
  }
  
  .receiver-info {
    p {
      margin: 5px 0;
    }
  }
}
</style>