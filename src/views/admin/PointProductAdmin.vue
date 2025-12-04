<template>
  <div class="point-product-admin" style="padding: 10px 20px">
    <el-card>
      <template #header>
        <div class="card-header">
          <el-icon><Money /></el-icon>
          积分商品管理
        </div>
      </template>
      
      <div class="desc">
        在这里管理平台的积分兑换商品
      </div>
      
      <!-- 操作区域 -->
      <div style="display: flex; justify-content: space-between; margin-bottom: 15px">
        <div>
          <el-button type="primary" :icon="Plus" @click="handleAdd">添加商品</el-button>
        </div>
        <div style="display: flex; gap: 10px">
          <el-input
              v-model="searchName"
              placeholder="请输入商品名称进行搜索"
              clearable
              style="width: 200px"
              @keyup.enter="handleSearch"
          />
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </div>
      </div>
      
      <!-- 表格区域 -->
      <el-table :data="tableData" border style="width: 100%">
        <el-table-column prop="id" label="商品ID" min-width="80" />
        <el-table-column prop="name" label="商品名称" min-width="150" show-overflow-tooltip />
        <el-table-column prop="price" label="兑换积分" min-width="100">
          <template #default="scope">
            <span class="price">{{ scope.row.price }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="stock" label="当前库存" min-width="100" />
        <el-table-column prop="totalStock" label="总库存" min-width="100" />
        <el-table-column prop="sales" label="已兑换数量" min-width="100" />
        <el-table-column label="商品图片" min-width="120">
          <template #default="scope">
            <el-image
              :src="scope.row.image || 'https://via.placeholder.com/60x60?text=无图片'"
              style="width: 60px; height: 60px"
              fit="cover"
              :preview-src-list="[scope.row.image]"
              v-if="scope.row.image"
            />
            <span v-else>无图片</span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" min-width="180">
          <template #default="scope">
            {{ formatDateTime(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="180" fixed="right">
          <template #default="scope">
            <el-button-group>
              <el-button size="small" @click="handleView(scope.row)">查看</el-button>
              <el-button size="small" type="primary" @click="handleEdit(scope.row)">编辑</el-button>
              <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
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

    <!-- 商品详情对话框 -->
    <el-dialog
      v-model="viewDialogVisible"
      title="商品详情"
      width="600px"
    >
      <el-form label-position="left" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="商品ID">
              <span>{{ viewData.id }}</span>
            </el-form-item>
            <el-form-item label="商品名称">
              <span>{{ viewData.name }}</span>
            </el-form-item>
            <el-form-item label="兑换积分">
              <span class="price">{{ viewData.price }}</span>
            </el-form-item>
            <el-form-item label="当前库存">
              <span>{{ viewData.stock }}</span>
            </el-form-item>
            <el-form-item label="总库存">
              <span>{{ viewData.totalStock }}</span>
            </el-form-item>
            <el-form-item label="已兑换数量">
              <span>{{ viewData.sales }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="商品图片">
              <el-image
                :src="viewData.image || 'https://via.placeholder.com/150x150?text=无图片'"
                style="width: 150px; height: 150px"
                fit="cover"
                :preview-src-list="[viewData.image]"
                v-if="viewData.image"
              />
              <span v-else>无图片</span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="商品详情">
          <div class="product-description" v-html="viewData.description"></div>
        </el-form-item>
        <el-form-item label="创建时间">
          <span>{{ formatDateTime(viewData.createTime) }}</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="viewDialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 创建/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="700px"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-row :gutter="20">
          <el-col :span="16">
            <el-form-item label="商品名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入商品名称" />
            </el-form-item>
            <el-form-item label="兑换积分" prop="price">
              <el-input-number 
                v-model="form.price" 
                :min="1" 
                :max="99999" 
                placeholder="请输入兑换所需积分"
                style="width: 100%"
              />
            </el-form-item>
            <el-form-item label="总库存" prop="totalStock">
              <el-input-number 
                v-model="form.totalStock" 
                :min="1" 
                :max="99999" 
                placeholder="请输入总库存"
                style="width: 100%"
              />
            </el-form-item>
            <el-form-item label="当前库存" prop="stock">
              <el-input-number 
                v-model="form.stock" 
                :min="0" 
                :max="form.totalStock" 
                placeholder="请输入当前库存"
                style="width: 100%"
              />
            </el-form-item>
            <el-form-item label="商品图片" prop="image">
              <el-input v-model="form.image" placeholder="请输入图片URL">
                <template #append>
                  <el-button @click="handleUploadImage">上传图片</el-button>
                </template>
              </el-input>
              <div v-if="form.image" style="margin-top: 10px">
                <el-image
                  :src="form.image"
                  style="width: 100px; height: 100px"
                  fit="cover"
                  :preview-src-list="[form.image]"
                />
                <el-button
                  size="small"
                  type="danger"
                  @click="form.image = ''"
                  style="margin-left: 10px"
                >
                  删除
                </el-button>
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <div class="image-preview">
              <el-image
                :src="form.image || 'https://via.placeholder.com/200x200?text=预览图'"
                style="width: 200px; height: 200px"
                fit="cover"
              />
            </div>
          </el-col>
        </el-row>
        <el-form-item label="商品详情" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="4"
            placeholder="请输入商品详情描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { Money, Search, Plus } from '@element-plus/icons-vue'
import { reactive, ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 搜索条件
const searchName = ref('')

// 对话框相关
const dialogVisible = ref(false)
const dialogTitle = ref('')
const isEdit = ref(false)
const viewDialogVisible = ref(false)

// 表单数据
const form = reactive({
  id: 0,
  name: '',
  price: 0,
  stock: 0,
  totalStock: 0,
  image: '',
  description: ''
})

// 查看数据
const viewData = reactive({
  id: 0,
  name: '',
  price: 0,
  stock: 0,
  totalStock: 0,
  sales: 0,
  image: '',
  description: '',
  createTime: ''
})

// 表单验证规则
const rules = {
  name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  price: [{ required: true, message: '请输入兑换所需积分', trigger: 'blur' }],
  totalStock: [{ required: true, message: '请输入总库存', trigger: 'blur' }],
  stock: [{ required: true, message: '请输入当前库存', trigger: 'blur' }]
}

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
  { 
    id: 1, 
    name: '保温杯', 
    price: 100, 
    stock: 50, 
    totalStock: 100, 
    image: 'https://via.placeholder.com/100x100?text=保温杯', 
    description: '高品质不锈钢保温杯，保温效果长达12小时',
    createTime: '2023-12-01 10:00:00' 
  },
  { 
    id: 2, 
    name: '无线鼠标', 
    price: 200, 
    stock: 30, 
    totalStock: 50, 
    image: 'https://via.placeholder.com/100x100?text=鼠标', 
    description: '人体工学设计，静音按键，适合长时间办公使用',
    createTime: '2023-12-01 10:00:00' 
  },
  { 
    id: 3, 
    name: '蓝牙耳机', 
    price: 300, 
    stock: 20, 
    totalStock: 30, 
    image: 'https://via.placeholder.com/100x100?text=耳机', 
    description: '真无线蓝牙耳机，降噪功能，续航时间长',
    createTime: '2023-12-01 10:00:00' 
  },
  { 
    id: 4, 
    name: '笔记本', 
    price: 50, 
    stock: 100, 
    totalStock: 200, 
    image: 'https://via.placeholder.com/100x100?text=笔记本', 
    description: '精美笔记本，纸质优良，适合记录重要事项',
    createTime: '2023-12-01 10:00:00' 
  }
]

// 计算已兑换数量
const calculateSales = (item) => {
  return item.totalStock - item.stock
}

// 获取表格数据
const getTableData = () => {
  // 模拟分页和筛选
  let filteredData = [...mockData]
  
  // 根据搜索条件过滤
  if (searchName.value) {
    filteredData = filteredData.filter(item => item.name.includes(searchName.value))
  }
  
  // 设置总数
  pagination.total = filteredData.length
  
  // 模拟分页并计算已兑换数量
  const start = (pagination.pageNum - 1) * pagination.pageSize
  const end = start + pagination.pageSize
  tableData.value = filteredData.slice(start, end).map(item => ({
    ...item,
    sales: calculateSales(item)
  }))
}

// 搜索处理
const handleSearch = () => {
  pagination.pageNum = 1
  getTableData()
}

// 重置搜索
const resetSearch = () => {
  searchName.value = ''
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

// 查看商品详情
const handleView = (row) => {
  Object.assign(viewData, {
    ...row,
    sales: calculateSales(row)
  })
  viewDialogVisible.value = true
}

// 添加商品
const handleAdd = () => {
  dialogTitle.value = '添加积分商品'
  isEdit.value = false
  // 重置表单
  Object.assign(form, {
    id: 0,
    name: '',
    price: 0,
    stock: 0,
    totalStock: 0,
    image: '',
    description: ''
  })
  dialogVisible.value = true
}

// 编辑商品
const handleEdit = (row) => {
  dialogTitle.value = '编辑积分商品'
  isEdit.value = true
  // 填充表单数据
  Object.assign(form, row)
  dialogVisible.value = true
}

// 删除商品
const handleDelete = (row) => {
  ElMessageBox.confirm(
    '此操作将永久删除该积分商品, 是否继续?',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    // 模拟删除操作
    const index = mockData.findIndex(item => item.id === row.id)
    if (index > -1) {
      mockData.splice(index, 1)
      getTableData()
      ElMessage.success('删除成功!')
    }
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

// 上传图片处理
const handleUploadImage = () => {
  // 模拟上传图片，这里直接设置一个示例图片URL
  form.image = 'https://via.placeholder.com/200x200?text=上传图片'
  ElMessage.info('模拟上传成功')
}

// 提交表单
const handleSubmit = () => {
  if (isEdit.value) {
    // 模拟编辑操作
    const index = mockData.findIndex(item => item.id === form.id)
    if (index > -1) {
      mockData[index] = { ...form }
      getTableData()
      ElMessage.success('编辑成功!')
    }
  } else {
    // 模拟添加操作
    const newProduct = {
      id: mockData.length > 0 ? Math.max(...mockData.map(item => item.id)) + 1 : 1,
      name: form.name,
      price: form.price,
      stock: form.stock,
      totalStock: form.totalStock,
      image: form.image,
      description: form.description,
      createTime: new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }).replace(/\//g, '-')
    }
    mockData.push(newProduct)
    getTableData()
    ElMessage.success('添加成功!')
  }
  dialogVisible.value = false
}

// 关闭对话框
const handleDialogClose = () => {
  // 可以在这里重置表单或其他清理工作
}

// 组件挂载时获取数据
onMounted(() => {
  getTableData()
})
</script>

<style lang="less" scoped>
.point-product-admin {
  .desc {
    color: #bababa;
    font-size: 13px;
    margin-bottom: 20px;
  }
  
  .price {
    color: #f56c6c;
    font-weight: bold;
    font-size: 16px;
  }
  
  .product-description {
    min-height: 60px;
    padding: 10px;
    background-color: #f5f7fa;
    border-radius: 4px;
  }
  
  .image-preview {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
  }
}
</style>