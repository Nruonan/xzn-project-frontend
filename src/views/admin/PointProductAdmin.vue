<template>
  <div class="point-product-admin" style="padding: 10px 20px">
    <el-card>
      <template #header>
        <div class="card-header">
          <el-icon><ShoppingBag /></el-icon>
          积分商品管理
        </div>
      </template>
      
      <div class="desc">
        在这里管理平台的所有积分商品
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
            style="width: 300px"
            @keyup.enter="handleSearch"
          />
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </div>
      </div>
      
      <!-- 表格区域 -->
      <el-table :data="tableData" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="商品名称" min-width="150" />
        <el-table-column prop="score" label="所需积分" width="120">
          <template #default="scope">
            <el-tag type="warning">{{ scope.row.score }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="stock" label="当前库存" width="120" />
        <el-table-column prop="totalStock" label="总库存" width="120" />
        <el-table-column prop="image" label="商品图片" width="120">
          <template #default="scope">
            <el-image
              style="width: 60px; height: 60px"
              :src="store.productUrl(scope.row.image)"
              :preview-src-list="[store.productUrl(scope.row.image)]"
              fit="cover"
            />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180">
          <template #default="scope">
            {{ formatDateTime(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="handleView(scope.row)">查看</el-button>
            <el-button size="small" type="primary" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
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
    
    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="50%"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        style="max-width: 500px"
      >
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入商品名称" />
        </el-form-item>
        <el-form-item label="所需积分" prop="score">
          <el-input-number v-model="form.score" :min="1" />
        </el-form-item>
        <el-form-item label="总库存" prop="totalStock">
          <el-input-number v-model="form.totalStock" :min="0" />
        </el-form-item>
        <el-form-item label="当前库存" prop="stock">
          <el-input-number v-model="form.stock" :min="0" />
        </el-form-item>
        <el-form-item label="商品图片" prop="image">
          <el-input v-model="form.image" placeholder="请输入图片URL" v-if="!showUpload">
            <template #append>
              <el-button @click="showUpload = true">上传图片</el-button>
            </template>
          </el-input>
          <div v-if="showUpload">
            <el-upload
              :action="axios.defaults.baseURL + '/api/image/product'"
              :show-file-list="false"
              :before-upload="beforeImageUpload"
              :on-success="uploadImageSuccess"
              :headers="accessHeader()"
              :data="{ id: form.id || 'temp' }"
              accept="image/*"
            >
              <el-button type="primary" :disabled="!form.id && dialogTitle.includes('添加')">点击上传</el-button>
            </el-upload>
            <div v-if="form.image" style="margin-top: 10px">
              <el-image
                :src="store.productUrl(form.image)"
                style="width: 100px; height: 100px"
                fit="cover"
                :preview-src-list="[store.productUrl(form.image)]"
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
            <div v-else-if="dialogTitle.includes('添加')" style="margin-top: 10px; color: #909399; font-size: 12px;">
              提示：请先保存商品信息后再上传图片
            </div>
          </div>
        </el-form-item>
        <el-form-item label="商品描述">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="4"
            placeholder="请输入商品描述"
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
    
    <!-- 查看对话框 -->
    <el-dialog
      v-model="viewDialogVisible"
      title="商品详情"
      width="50%"
    >
      <div class="view-content">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="商品ID">{{ viewData.id }}</el-descriptions-item>
          <el-descriptions-item label="商品名称">{{ viewData.name }}</el-descriptions-item>
          <el-descriptions-item label="所需积分">{{ viewData.score }}</el-descriptions-item>
          <el-descriptions-item label="当前库存">{{ viewData.stock }}</el-descriptions-item>
          <el-descriptions-item label="总库存">{{ viewData.totalStock }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ formatDateTime(viewData.createTime) }}</el-descriptions-item>
          <el-descriptions-item label="商品图片" :span="2">
            <el-image
              v-if="viewData.image"
              style="width: 100px; height: 100px"
              :src="store.productUrl(viewData.image)"
              :preview-src-list="[store.productUrl(viewData.image)]"
              fit="cover"
            />
            <span v-else>暂无图片</span>
          </el-descriptions-item>
          <el-descriptions-item label="商品描述" :span="2">{{ viewData.description || '暂无描述' }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { Plus, Search, ShoppingBag } from '@element-plus/icons-vue'
import { reactive, ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { accessHeader } from '@/net/index.js'
import { useStore } from '@/store/index.js'
import axios from 'axios'
import { 
  getPointsProductListAdmin, 
  createPointsProductAdmin, 
  updatePointsProductAdmin, 
  deletePointsProductAdmin 
} from '@/net/api/point.js'

// 使用store
const store = useStore()

// 搜索条件
const searchName = ref('')

// 对话框相关
const dialogVisible = ref(false)
const viewDialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref(null)

// 图片上传控制
const showUpload = ref(false)

// 表格数据
const tableData = ref([])

// 表单数据
const form = reactive({
  id: '',
  name: '',
  score: 0,
  stock: 0,
  totalStock: 0,
  image: '',
  description: ''
})

// 查看数据
const viewData = ref({})

// 分页数据
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

// 表单验证规则
const rules = {
  name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  score: [{ required: true, message: '请输入所需积分', trigger: 'blur' }],
  totalStock: [{ required: true, message: '请输入总库存', trigger: 'blur' }],
  stock: [{ required: true, message: '请输入当前库存', trigger: 'blur' }]
}

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
  getPointsProductListAdmin(
    pagination.pageNum,
    pagination.pageSize,
    searchName.value,
    (data) => {
      tableData.value = data.records || []
      pagination.total = data.total || 0
    }, (message) => {
      ElMessage.error(message || '获取积分商品列表失败')
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

// 添加商品
const handleAdd = () => {
  dialogTitle.value = '添加商品'
  dialogVisible.value = true
  showUpload.value = false
  // 重置表单
  Object.assign(form, {
    id: '',
    name: '',
    score: 0,
    stock: 0,
    totalStock: 0,
    image: '',
    description: ''
  })
}

// 编辑商品
const handleEdit = (row) => {
  dialogTitle.value = '编辑商品'
  dialogVisible.value = true
  showUpload.value = false
  // 填充表单
  Object.assign(form, row)
}

// 查看商品
const handleView = (row) => {
  viewDialogVisible.value = true
  viewData.value = row
}

// 删除商品
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除商品"${row.name}"吗？`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    deletePointsProductAdmin(row.id, () => {
      ElMessage.success('删除成功')
      getTableData()
    }, (message) => {
      ElMessage.error(message || '删除失败')
    })
  }).catch(() => {
    // 用户取消删除
  })
}

// 图片上传前验证
const beforeImageUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt1M = file.size / 1024 < 1000 // 1000KB

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt1M) {
    ElMessage.error('图片大小不能超过 1000KB!')
    return false
  }
  return true
}

// 图片上传成功
const uploadImageSuccess = (response) => {
  // 检查响应状态码
  if (response.code === 200 && response.data) {
    ElMessage.success('图片上传成功')
    form.image = response.data
  } else {
    ElMessage.error(response.message || '图片上传失败')
  }
}

// 提交表单
const handleSubmit = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      const isEdit = !!form.id
      
      if (isEdit) {
        updatePointsProductAdmin(form, (data) => {
          ElMessage.success('更新成功')
          dialogVisible.value = false
          getTableData()
        }, (message) => {
          ElMessage.error(message || '更新失败')
        })
      } else {
        createPointsProductAdmin(form, (data) => {
          ElMessage.success('添加成功')
          
          // 如果是新建商品，更新form.id以便后续上传图片
          if (data && data.id) {
            form.id = data.id
            // 如果有图片需要上传，提示用户重新上传
            if (form.image && form.image.startsWith('blob:')) {
              ElMessage.info('请重新上传商品图片')
            } else {
              dialogVisible.value = false
              getTableData()
            }
          } else {
            dialogVisible.value = false
            getTableData()
          }
        }, (message) => {
          ElMessage.error(message || '添加失败')
        })
      }
    }
  })
}

// 对话框关闭处理
const handleDialogClose = () => {
  formRef.value?.resetFields()
}

// 组件挂载时获取数据
onMounted(() => {
  getTableData()
})
</script>

<style scoped>
.point-product-admin {
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

.view-content {
  padding: 10px 0;
}
</style>