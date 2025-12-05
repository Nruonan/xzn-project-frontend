<template>
  <div class="points-exchange-page">
    <div class="header-section">
      <h2>积分兑换</h2>
      <p>当前积分余额: {{ userPoints }}</p>
    </div>
    
    <div class="search-section">
      <el-input 
        v-model="searchText" 
        placeholder="搜索商品..." 
        style="width: 300px; margin-right: 10px;"
        @keyup.enter="handleSearch"
      />
      <el-button type="primary" @click="handleSearch">搜索</el-button>
      <el-button @click="resetSearch">重置</el-button>
    </div>
    
    <div class="products-grid">
      <el-card 
        v-for="product in productList" 
        :key="product.id" 
        class="product-card"
        shadow="hover"
      >
        <div class="product-image">
          <img :src="product.image" :alt="product.name" @error="handleImageError" />
        </div>
        <div class="product-info">
          <h3>{{ product.name }}</h3>
          <p class="product-description">{{ product.description }}</p>
          <div class="product-footer">
            <span class="product-price">{{ product.score }} 积分</span>
            <span class="product-stock">库存: {{ product.stock }}</span>
          </div>
          <el-button 
            type="primary" 
            :disabled="product.stock <= 0 || userPoints < product.price"
            @click="exchangeProduct(product)"
            class="exchange-button"
          >
            {{ product.stock <= 0 ? '已兑完' : '立即兑换' }}
          </el-button>
        </div>
      </el-card>
    </div>
    
    <div class="pagination-section">
      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="totalProducts"
          layout="prev, pager, next, jumper"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
    
    <!-- 兑换对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="商品兑换"
      width="500px"
      class="exchange-dialog"
    >
      <div class="exchange-form" v-if="selectedProduct">
        <div class="product-info">
          <div> <h3>产品名称：{{ selectedProduct.name }}</h3></div>
          <img :src="selectedProduct.image" :alt="selectedProduct.name" class="product-image" />
          <div class="product-details">
            产品简述：{{ selectedProduct.description }}
            <p class="product-price">积分: {{ selectedProduct.score }}</p>
          </div>
        </div>
        
        <el-form :model="exchangeForm" label-width="80px">
          <el-form-item label="数量">
            <el-input-number
              v-model="exchangeForm.quantity"
              :min="1"
              :max="Math.floor(userPoints / selectedProduct.score)"
              controls-position="right"
              @change="handleQuantityChange"
            />
          </el-form-item>
          
          <el-form-item label="收货人">
            <el-input v-model="exchangeForm.username" placeholder="请输入收货人姓名" />
          </el-form-item>
          
          <el-form-item label="联系电话">
            <el-input 
              v-model="exchangeForm.phone" 
              placeholder="请输入11位手机号码"
              maxlength="11"
            />
          </el-form-item>
          
          <el-form-item label="收货地址">
            <el-input
              v-model="exchangeForm.address"
              type="textarea"
              :rows="2"
              placeholder="请输入详细收货地址"
            />
          </el-form-item>
          
          <el-form-item label="总积分">
            <span class="total-points">{{ selectedProduct.score * exchangeForm.quantity }}</span>
          </el-form-item>
        </el-form>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmExchange">确认兑换</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { Search, ShoppingBag } from '@element-plus/icons-vue'
import { reactive, ref, onMounted } from 'vue'
import { useStore } from '@/store/index.js'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getUserPoints, getPointsProductList, createPointsOrder } from '@/net/api/point.js'

const store = useStore()

// 积分余额
const userPoints = ref(0)

// 搜索条件
const searchText = ref('')

// 分页数据
const pagination = reactive({
  pageNum: 1,
  pageSize: 12,
  total: 0
})

// 为了兼容模板中的变量名
const currentPage = ref(1)
const pageSize = ref(12)
const totalProducts = ref(0)

// 商品列表
const productList = ref([])

// 兑换表单
const exchangeForm = reactive({
  productId: null,
  quantity: 1,
  username: '',
  phone: '',
  address: ''
})

// 兑换对话框
const dialogVisible = ref(false)
const selectedProduct = ref(null)

// 获取用户积分
const loadUserPoints = () => {
  getUserPoints((data) => {
    userPoints.value = data || 0
  }, (message) => {
    console.error('获取用户积分失败:', message)
  })
}

// 获取商品列表
const loadProducts = () => {
  getPointsProductList(
    pagination.pageNum,
    pagination.pageSize,
    searchText.value,
    (data) => {
      productList.value = data.records || []
      pagination.total = data.total || 0
      
      // 同步更新分页变量
      currentPage.value = pagination.pageNum
      pageSize.value = pagination.pageSize
      totalProducts.value = pagination.total
      
      // 处理图片URL
      productList.value.forEach(product => {
        if (product.image) {
          product.image = store.productUrl(product.image)
        }
      })
    }, (message) => {
      console.error('获取商品列表失败:', message)
      ElMessage.error('获取商品列表失败: ' + message)
    }
  )
}

// 搜索处理
const handleSearch = () => {
  pagination.pageNum = 1
  loadProducts()
}

// 重置搜索
const resetSearch = () => {
  searchText.value = ''
  pagination.pageNum = 1
  loadProducts()
}

// 分页大小改变
const handleSizeChange = (val) => {
  pagination.pageSize = val
  pagination.pageNum = 1
  loadProducts()
}

// 当前页改变
const handleCurrentChange = (val) => {
  pagination.pageNum = val
  loadProducts()
}

// 打开兑换对话框
const openExchangeDialog = (product) => {
  selectedProduct.value = product
  exchangeForm.productId = product.id
  exchangeForm.quantity = 1
  exchangeForm.username = ''
  exchangeForm.phone = ''
  exchangeForm.address = ''
  dialogVisible.value = true
}

// 关闭兑换对话框
const closeExchangeDialog = () => {
  dialogVisible.value = false
  selectedProduct.value = null
  exchangeForm.productId = null
  exchangeForm.quantity = 1
  exchangeForm.username = ''
  exchangeForm.phone = ''
  exchangeForm.address = ''
}

// 兑换商品
const exchangeProduct = (product) => {
  selectedProduct.value = product
  exchangeForm.productId = product.id
  exchangeForm.quantity = 1
  exchangeForm.username = ''
  exchangeForm.phone = ''
  exchangeForm.address = ''
  dialogVisible.value = true
}

// 处理数量变化
const handleQuantityChange = () => {
  // 数量变化时的处理逻辑，如果需要的话
}

// 确认兑换
const confirmExchange = () => {
  // 表单验证
  if (!exchangeForm.username.trim()) {
    ElMessage.warning('请输入收货人姓名')
    return
  }
  
  if (!exchangeForm.phone.trim()) {
    ElMessage.warning('请输入联系电话')
    return
  }
  
  // 手机号正则校验
  const phoneRegex = /^1[3-9]\d{9}$/
  if (!phoneRegex.test(exchangeForm.phone)) {
    ElMessage.warning('请输入正确的手机号码格式')
    return
  }
  
  if (!exchangeForm.address.trim()) {
    ElMessage.warning('请输入收货地址')
    return
  }
  
  // 检查积分是否足够
  const totalPoints = selectedProduct.value.score * exchangeForm.quantity
  if (totalPoints > userPoints.value) {
    ElMessage.error('积分不足，无法兑换')
    return
  }
  
  // 构建订单数据，符合后端接收对象要求
  const orderData = {
    productId: exchangeForm.productId,
    username: exchangeForm.username,
    phone: exchangeForm.phone,
    address: exchangeForm.address,
    payScore: totalPoints,
    count: exchangeForm.quantity
  }
  
  // 显示确认对话框
  ElMessageBox.confirm(
    `确认兑换 ${selectedProduct.value.name} ${exchangeForm.quantity} 件？将消耗 ${totalPoints} 积分`,
    '确认兑换',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    // 调用API创建订单
    createPointsOrder(orderData, (data) => {
      ElMessage.success('兑换成功！订单已生成')
      dialogVisible.value = false
      loadProducts()
      loadUserPoints()
    }, (message) => {
      console.error('兑换失败:', message)
      ElMessage.error('兑换失败: ' + message)
    })
  }).catch(() => {
    // 用户取消操作
    ElMessage.info('已取消兑换')
  })
}

// 处理图片加载错误
const handleImageError = (e) => {
  e.target.src = 'https://via.placeholder.com/200x200?text=商品图片'
}

// 初始化
onMounted(() => {
  loadUserPoints()
  loadProducts()
})
</script>

<style scoped lang="less">
.points-exchange-page {
  padding: 20px;
  background-color: #f7f8fa;
  min-height: 100%;
  
  .dark & {
    background-color: #212225;
  }
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  
  h2 {
    margin: 0;
    font-size: 24px;
    color: #333;
    
    .dark & {
      color: #fff;
    }
  }
  
  p {
    font-size: 16px;
    color: #666;
    margin: 0;
    
    .dark & {
      color: #ccc;
    }
  }
}

.search-section {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  .dark & {
    background: #2d2e32;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.product-card {
  border-radius: 10px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
    
    .dark & {
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
    }
  }
  
  .dark & {
    background: #2d2e32;
    border: 1px solid #444;
  }
}

.product-image {
  height: 200px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  
  .dark & {
    background: #333;
  }
  
  img {
    max-width: 100%;
    max-height: 100%;
    object-fit: cover;
  }
}

.product-info {
  padding: 15px;
  
  h3 {
    margin: 0 0 10px 0;
    font-size: 18px;
    color: #333;
    
    .dark & {
      color: #fff;
    }
  }
  
  .product-description {
    margin: 0 0 15px 0;
    font-size: 14px;
    color: #666;
    min-height: 40px;
    
    .dark & {
      color: #aaa;
    }
  }
  
  .product-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
  }
  
  .product-price {
    font-size: 18px;
    font-weight: bold;
    color: #ff6b35;
    
    .dark & {
      color: #ff8c66;
    }
  }
  
  .product-stock {
    font-size: 14px;
    color: #666;
    
    .dark & {
      color: #aaa;
    }
  }
  
  .exchange-button {
    width: 100%;
  }
}

.pagination-section {
  display: flex;
  justify-content: center;
  padding: 20px 0;
  
  :deep(.el-pagination) {
    .dark & {
      .btn-prev,
      .btn-next,
      .el-pager li {
        background: #2d2e32;
        color: #fff;
        
        &:disabled {
          color: #666;
        }
      }
      
      .el-pager li.active {
        background: #409eff;
        color: white;
      }
    }
  }
}

.confirm-dialog {
  .product-preview {
    display: flex;
    gap: 15px;
    margin-bottom: 20px;
    
    img {
      width: 100px;
      height: 100px;
      object-fit: cover;
      border-radius: 5px;
    }
    
    div {
      flex: 1;
      
      h3 {
        margin: 0 0 10px 0;
        font-size: 18px;
        color: #333;
        
        .dark & {
          color: #fff;
        }
      }
      
      p {
        margin: 5px 0;
        color: #666;
        
        .dark & {
          color: #aaa;
        }
      }
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
  
  .dark & {
    color: #a0a0a0;
  }
}
</style>






