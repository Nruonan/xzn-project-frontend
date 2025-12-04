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
            <span class="product-price">{{ product.price }} 积分</span>
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
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="totalProducts"
        layout="prev, pager, next, jumper"
        @current-change="handlePageChange"
      />
    </div>
    
    <!-- 兑换确认对话框 -->
    <el-dialog v-model="dialogVisible" title="确认兑换" width="500px">
      <div v-if="selectedProduct" class="confirm-dialog">
        <div class="product-preview">
          <img :src="selectedProduct.image" :alt="selectedProduct.name" />
          <div>
            <h3>{{ selectedProduct.name }}</h3>
            <p>兑换积分: {{ selectedProduct.price }}</p>
            <p>兑换后剩余积分: {{ userPoints - selectedProduct.price }}</p>
          </div>
        </div>
        <el-form :model="exchangeForm" label-width="80px">
          <el-form-item label="兑换数量">
            <el-input-number 
              v-model="exchangeForm.quantity" 
              :min="1" 
              :max="Math.min(selectedProduct.stock, Math.floor(userPoints / selectedProduct.price))"
              @change="handleQuantityChange"
            />
          </el-form-item>
          <el-form-item label="总计积分">
            <strong>{{ exchangeForm.quantity * selectedProduct.price }} 积分</strong>
          </el-form-item>
          <el-form-item label="收货人" prop="receiverName" :rules="[{ required: true, message: '请输入收货人姓名', trigger: 'blur' }]">
            <el-input v-model="exchangeForm.receiverName" placeholder="请输入收货人姓名" />
          </el-form-item>
          <el-form-item label="联系电话" prop="receiverPhone" :rules="[{ required: true, message: '请输入联系电话', trigger: 'blur' }]">
            <el-input v-model="exchangeForm.receiverPhone" placeholder="请输入联系电话" />
          </el-form-item>
          <el-form-item label="收货地址" prop="receiverAddress" :rules="[{ required: true, message: '请输入收货地址', trigger: 'blur' }]">
            <el-input v-model="exchangeForm.receiverAddress" placeholder="请输入收货地址" type="textarea" />
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
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useStore } from '@/store'

// 使用 Pinia 获取用户信息
const store = useStore()
const userPoints = ref(1500) // 模拟用户积分余额

// 商品数据
const productList = ref([])
const currentPage = ref(1)
const pageSize = ref(8)
const totalProducts = ref(0)
const searchText = ref('')

// 对话框相关
const dialogVisible = ref(false)
const selectedProduct = ref(null)
const exchangeForm = reactive({
  quantity: 1,
  receiverName: '',
  receiverPhone: '',
  receiverAddress: ''
})

// 模拟商品数据
const mockProducts = [
  {
    id: 1,
    name: '品牌保温杯',
    price: 200,
    stock: 15,
    image: 'https://images.unsplash.com/photo-1545235617-9465d2a55698?w=200&h=200&fit=crop',
    description: '优质不锈钢保温杯，保冷保热12小时'
  },
  {
    id: 2,
    name: '无线蓝牙鼠标',
    price: 350,
    stock: 8,
    image: 'https://images.unsplash.com/photo-1527864550415-583f0d4e5ee4?w=200&h=200&fit=crop',
    description: '人体工学设计，静音办公鼠标'
  },
  {
    id: 3,
    name: '移动电源',
    price: 500,
    stock: 12,
    image: 'https://images.unsplash.com/photo-1603794064635-bde31b041990?w=200&h=200&fit=crop',
    description: '20000mAh大容量，支持快充'
  },
  {
    id: 4,
    name: '蓝牙耳机',
    price: 800,
    stock: 5,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop',
    description: '降噪蓝牙耳机，音质出色'
  },
  {
    id: 5,
    name: '定制笔记本',
    price: 120,
    stock: 30,
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=200&h=200&fit=crop',
    description: '精美封面，内页顺滑书写'
  },
  {
    id: 6,
    name: '运动水壶',
    price: 150,
    stock: 20,
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=200&h=200&fit=crop',
    description: '环保材质，轻便易携'
  },
  {
    id: 7,
    name: '桌面绿植',
    price: 180,
    stock: 10,
    image: 'https://images.unsplash.com/photo-1598983069272-d52571031d52?w=200&h=200&fit=crop',
    description: '净化空气，美化办公环境'
  },
  {
    id: 8,
    name: '多功能插座',
    price: 250,
    stock: 18,
    image: 'https://images.unsplash.com/photo-1595658658473-0a72d70b5bd0?w=200&h=200&fit=crop',
    description: '带USB接口，安全保护'
  }
]

// 初始化数据
onMounted(() => {
  loadProducts()
})

// 加载商品数据
const loadProducts = () => {
  // 模拟分页和搜索
  let filteredProducts = mockProducts
  
  if (searchText.value) {
    filteredProducts = mockProducts.filter(product => 
      product.name.toLowerCase().includes(searchText.value.toLowerCase())
    )
  }
  
  totalProducts.value = filteredProducts.length
  const startIndex = (currentPage.value - 1) * pageSize.value
  productList.value = filteredProducts.slice(startIndex, startIndex + pageSize.value)
}

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1
  loadProducts()
}

// 重置搜索
const resetSearch = () => {
  searchText.value = ''
  currentPage.value = 1
  loadProducts()
}

// 处理分页变化
const handlePageChange = () => {
  loadProducts()
}

// 图片加载错误处理
const handleImageError = (e) => {
  e.target.src = 'https://via.placeholder.com/200x200?text=No+Image'
}

// 兑换商品
const exchangeProduct = (product) => {
  selectedProduct.value = product
  exchangeForm.quantity = 1
  dialogVisible.value = true
}

// 数量变化处理
const handleQuantityChange = (value) => {
  if (!selectedProduct.value) return
  
  const maxQuantity = Math.min(
    selectedProduct.value.stock, 
    Math.floor(userPoints.value / selectedProduct.value.price)
  )
  
  if (value > maxQuantity) {
    exchangeForm.quantity = maxQuantity
  }
}

// 确认兑换
const confirmExchange = () => {
  if (!selectedProduct.value) return
  
  // 检查收货信息是否填写
  if (!exchangeForm.receiverName || !exchangeForm.receiverPhone || !exchangeForm.receiverAddress) {
    ElMessage.error('请填写完整的收货信息')
    return
  }
  
  const totalCost = exchangeForm.quantity * selectedProduct.value.price
  
  if (userPoints.value < totalCost) {
    ElMessage.error('积分不足')
    return
  }
  
  if (exchangeForm.quantity > selectedProduct.value.stock) {
    ElMessage.error('库存不足')
    return
  }
  
  // 模拟兑换过程
  ElMessageBox.confirm(
    `确定要兑换 ${exchangeForm.quantity} 个 ${selectedProduct.value.name} 吗？`,
    '确认兑换',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    // 更新用户积分和商品库存
    userPoints.value -= totalCost
    const productIndex = mockProducts.findIndex(p => p.id === selectedProduct.value.id)
    if (productIndex !== -1) {
      mockProducts[productIndex].stock -= exchangeForm.quantity
    }
    
    // 重新加载商品列表
    loadProducts()
    
    // 关闭对话框并重置表单
    dialogVisible.value = false
    exchangeForm.receiverName = ''
    exchangeForm.receiverPhone = ''
    exchangeForm.receiverAddress = ''
    
    ElMessage.success('兑换成功！')
  }).catch(() => {
    // 用户取消操作
  })
}
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
</style>