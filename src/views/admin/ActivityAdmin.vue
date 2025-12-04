<template>
  <div class="activity-admin" style="padding: 10px 20px">
    <el-card>
      <template #header>
        <div class="card-header">
          <el-icon><ToiletPaper /></el-icon>
          活动管理
        </div>
      </template>
      
      <div class="desc">
        在这里管理平台的所有活动内容
      </div>
      
      <!-- 操作区域 -->
      <div style="display: flex; justify-content: space-between; margin-bottom: 15px">
        <div>
          <el-button type="primary" :icon="Plus" @click="handleAdd">添加活动</el-button>
        </div>
        <div style="display: flex; gap: 10px">
          <el-input
              v-model="searchTitle"
              placeholder="请输入活动标题进行搜索"
              clearable
              style="width: 300px"
              @keyup.enter="handleSearch"
          />
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </div>
      </div>
      
      <!-- 表格区域 -->
      <el-table :data="tableData" border style="width: 100%">
        <el-table-column prop="id" label="ID" min-width="80" />
        <el-table-column prop="title" label="标题" min-width="180" show-overflow-tooltip />
        <el-table-column prop="location" label="地点" min-width="120" show-overflow-tooltip />
        <el-table-column prop="startTime" label="开始时间" min-width="150">
          <template #default="scope">
            {{ formatDateTime(scope.row.startTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="endTime" label="结束时间" min-width="150">
          <template #default="scope">
            {{ formatDateTime(scope.row.endTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="time" label="创建时间" min-width="150">
          <template #default="scope">
            {{ formatDateTime(scope.row.time) }}
          </template>
        </el-table-column>
        <el-table-column prop="username" label="创建者" min-width="100" />
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

    <!-- 创建/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="活动标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入活动标题" />
        </el-form-item>
        <el-form-item label="活动链接" prop="url">
          <el-input v-model="form.url" placeholder="请输入活动链接" />
        </el-form-item>
        <el-form-item label="活动地点" prop="location">
          <el-input v-model="form.location" placeholder="请输入活动地点" />
        </el-form-item>
        <el-form-item label="开始时间" prop="startTime">
          <el-date-picker
            v-model="form.startTime"
            type="datetime"
            placeholder="选择开始时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="结束时间" prop="endTime">
          <el-date-picker
            v-model="form.endTime"
            type="datetime"
            placeholder="选择结束时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="活动图片" prop="picture">
          <el-input v-model="form.picture" placeholder="请输入图片URL" v-if="!showUpload">
            <template #append>
              <el-button @click="showUpload = true" :disabled="!form.id && !dialogTitle.value.includes('编辑')">上传图片</el-button>
            </template>
          </el-input>
          <div v-if="showUpload">
            <el-upload
              :action="axios.defaults.baseURL + '/api/image/activity'"
              :show-file-list="false"
              :before-upload="beforeImageUpload"
              :on-success="uploadImageSuccess"
              :headers="accessHeader()"
              :data="{ id: form.id }"
              accept="image/*"
            >
              <el-button type="primary" :disabled="!form.id">点击上传</el-button>
            </el-upload>
            <div v-if="form.picture" style="margin-top: 10px">
              <el-image
                :src="store.activityUrl(form.picture)"
                style="width: 100px; height: 100px"
                fit="cover"
                :preview-src-list="[store.activityUrl(form.picture)]"
              />
              <el-button
                size="small"
                type="danger"
                @click="form.picture = ''"
                style="margin-left: 10px"
              >
                删除
              </el-button>
            </div>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 查看详情对话框 -->
    <el-dialog v-model="viewDialogVisible" title="活动详情" width="800px">
      <div class="detail-container">
        <el-card class="detail-card" shadow="hover">
          <div class="detail-header">
            <h2>{{ viewData.title }}</h2>
            <div class="detail-meta">
              <el-tag type="info" size="small">ID: {{ viewData.id }}</el-tag>
            </div>
          </div>
          
          <el-divider />
          
          <div class="detail-content">
            <div class="detail-section">
              <h3>基本信息</h3>
              <div class="detail-grid">
                <div class="detail-item">
                  <div class="item-label">
                    <el-icon><Location /></el-icon>
                    活动地点
                  </div>
                  <div class="item-value">{{ viewData.location }}</div>
                </div>
                
                <div class="detail-item">
                  <div class="item-label">
                    <el-icon><Link /></el-icon>
                    活动链接
                  </div>
                  <div class="item-value">
                    <el-link :href="viewData.url" target="_blank" type="primary">
                      {{ viewData.url }}
                    </el-link>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="detail-section">
              <h3>时间安排</h3>
              <div class="detail-grid">
                <div class="detail-item">
                  <div class="item-label">
                    <el-icon><Clock /></el-icon>
                    开始时间
                  </div>
                  <div class="item-value">{{ formatDateTime(viewData.startTime) }}</div>
                </div>
                
                <div class="detail-item">
                  <div class="item-label">
                    <el-icon><Clock /></el-icon>
                    结束时间
                  </div>
                  <div class="item-value">{{ formatDateTime(viewData.endTime) }}</div>
                </div>
                
                <div class="detail-item">
                  <div class="item-label">
                    <el-icon><Calendar /></el-icon>
                    创建时间
                  </div>
                  <div class="item-value">{{ formatDateTime(viewData.time) }}</div>
                </div>
              </div>
            </div>
            
            <div class="detail-section">
              <h3>创建者信息</h3>
              <div class="creator-info">
                <el-avatar :size="50" :src="viewData.avatar" />
                <div class="creator-details">
                  <div class="creator-name">{{ viewData.username || '未知用户' }}</div>
                  <div class="creator-id">用户ID: {{ viewData.uid }}</div>
                </div>
              </div>
            </div>
            
            <div class="detail-section" v-if="viewData.picture">
              <h3>活动图片</h3>
              <div class="image-container">
                <el-image
                  :src="store.activityUrl(viewData.picture)"
                  class="activity-image"
                  fit="cover"
                  :preview-src-list="[store.activityUrl(viewData.picture)]"
                >
                  <template #error>
                    <div class="image-error">
                      <el-icon><Picture /></el-icon>
                      <span>图片加载失败</span>
                    </div>
                  </template>
                </el-image>
              </div>
            </div>
          </div>
        </el-card>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Location, Link, Clock, Calendar, Picture, Plus, Search, ToiletPaper } from '@element-plus/icons-vue'
import { createActivity, updateActivity, deleteActivity, getActivityList, getActivityDetail } from '@/net/api/activity.js'
import { accessHeader } from '@/net/index.js'
import { useStore } from '@/store/index.js'
import axios from 'axios'

// 使用store
const store = useStore()

// 表格数据
const tableData = ref([])

// 搜索关键词
const searchTitle = ref('')

// 分页数据
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

// 对话框控制
const dialogVisible = ref(false)
const viewDialogVisible = ref(false)
const dialogTitle = ref('')

// 表单数据
const formRef = ref()
const form = reactive({
  id: null,
  title: '',
  url: '',
  location: '',
  picture: '',
  startTime: '',
  endTime: ''
})

// 临时数据，用于重置表单
const temp = reactive({
  id: null,
  title: '',
  url: '',
  location: '',
  picture: '',
  startTime: '',
  endTime: ''
})

// 查看详情数据
const viewData = reactive({
  id: null,
  title: '',
  url: '',
  location: '',
  picture: '',
  startTime: '',
  endTime: '',
  time: '',
  username: '',
  avatar: ''
})

// 图片上传控制
const showUpload = ref(false)

// 表单验证规则
const rules = {
  title: [
    { required: true, message: '请输入活动标题', trigger: 'blur' }
  ],
  url: [
    { required: true, message: '请输入活动链接', trigger: 'blur' },
    { type: 'url', message: '请输入正确的URL格式', trigger: 'blur' }
  ],
  location: [
    { required: true, message: '请输入活动地点', trigger: 'blur' }
  ],
  startTime: [
    { required: true, message: '请选择开始时间', trigger: 'change' }
  ],
  endTime: [
    { required: true, message: '请选择结束时间', trigger: 'change' }
  ]
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
    minute: '2-digit',
    second: '2-digit'
  }).replace(/\//g, '-')
}

// 获取活动列表
const getActivityListData = () => {
  getActivityList(pagination.pageNum, pagination.pageSize, searchTitle.value, (data) => {
    tableData.value = data.records || []
    pagination.total = data.total || 0
  })
}

// 搜索
const handleSearch = () => {
  pagination.pageNum = 1
  getActivityListData()
}

// 重置搜索
const resetSearch = () => {
  searchTitle.value = ''
  pagination.pageNum = 1
  getActivityListData()
}

// 分页大小变化
const handleSizeChange = (size) => {
  pagination.pageSize = size
  getActivityListData()
}

// 当前页变化
const handleCurrentChange = (page) => {
  pagination.pageNum = page
  getActivityListData()
}

// 打开创建对话框
const handleAdd = () => {
  dialogTitle.value = '创建活动'
  dialogVisible.value = true
  showUpload.value = false
  resetForm()
}

// 打开编辑对话框
const handleEdit = (row) => {
  dialogTitle.value = '编辑活动'
  dialogVisible.value = true
  showUpload.value = false
  
  // 填充表单数据
  Object.assign(form, row)
}

// 查看详情
const handleView = (row) => {
  viewDialogVisible.value = true
  
  // 获取活动详情
  getActivityDetail(row.id, (data) => {
    Object.assign(viewData, data)
  })
}

// 删除活动
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除活动"${row.title}"吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(() => {
      deleteActivity(row.id, () => {
        ElMessage.success('删除成功')
        getActivityListData()
      })
    })
    .catch(() => {
      ElMessage.info('已取消删除')
    })
}

// 提交表单
const handleSubmit = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      // 创建一个新对象，避免直接修改form
      const submitData = {
        ...form,
        // 将时间格式转换为Java后端可以接受的格式
        startTime: form.startTime ? new Date(form.startTime).getTime() : null,
        endTime: form.endTime ? new Date(form.endTime).getTime() : null
      }
      
      if (form.id) {
        // 更新活动
        updateActivity(submitData, () => {
          ElMessage.success('更新成功')
          dialogVisible.value = false
          getActivityListData()
        })
      } else {
        // 创建活动 - 先创建活动记录，获取ID
        createActivity(submitData, (data) => {
          ElMessage.success('活动创建成功')
          // 更新form.id，以便后续上传图片时使用
          form.id = data.id
          // 如果有图片需要上传，提示用户重新上传
          if (form.picture && form.picture.startsWith('blob:')) {
            ElMessage.info('请重新上传活动图片')
          } else {
            dialogVisible.value = false
            getActivityListData()
          }
        })
      }
    }
  })
}

// 关闭对话框
const handleDialogClose = () => {
  resetForm()
}

// 重置表单
const resetForm = () => {
  Object.assign(form, temp)
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

// 图片上传前验证
const beforeImageUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt5M = file.size / 1024 / 1024 < 5

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过 5MB!')
    return false
  }
  return true
}

// 图片上传成功
const uploadImageSuccess = (response) => {
  ElMessage.success('图片上传成功')
  form.picture = response.data
  
  // 如果是新建活动且图片上传成功，关闭对话框并刷新列表
  if (!dialogTitle.value.includes('编辑')) {
    dialogVisible.value = false
    getActivityListData()
  }
}

// 初始化
onMounted(() => {
  getActivityListData()
})
</script>

<style scoped>
.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.desc {
  color: #bababa;
  font-size: 13px;
  margin-bottom: 20px;
}

.search-box {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
}

/* 详情页面样式 */
.detail-container {
  padding: 0;
}

.detail-card {
  border-radius: 8px;
  overflow: hidden;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.detail-header h2 {
  margin: 0;
  color: #303133;
  font-weight: 600;
}

.detail-content {
  padding: 0 10px;
}

.detail-section {
  margin-bottom: 25px;
}

.detail-section h3 {
  margin: 0 0 15px 0;
  color: #409EFF;
  font-size: 16px;
  font-weight: 600;
  border-left: 4px solid #409EFF;
  padding-left: 10px;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 15px;
}

.detail-item {
  background-color: #f8f9fa;
  border-radius: 6px;
  padding: 15px;
  transition: all 0.3s ease;
}

.detail-item:hover {
  background-color: #ecf5ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.item-label {
  display: flex;
  align-items: center;
  font-weight: 600;
  color: #606266;
  margin-bottom: 8px;
}

.item-label .el-icon {
  margin-right: 8px;
  color: #409EFF;
}

.item-value {
  color: #303133;
  font-size: 14px;
  word-break: break-all;
}

.creator-info {
  display: flex;
  align-items: center;
  background-color: #f8f9fa;
  border-radius: 6px;
  padding: 15px;
  transition: all 0.3s ease;
}

.creator-info:hover {
  background-color: #ecf5ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.creator-details {
  margin-left: 15px;
}

.creator-name {
  font-weight: 600;
  color: #303133;
  font-size: 16px;
  margin-bottom: 5px;
}

.creator-id {
  color: #909399;
  font-size: 14px;
}

.image-container {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}

.activity-image {
  max-width: 100%;
  height: 300px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.activity-image:hover {
  transform: scale(1.02);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.image-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #909399;
}

.image-error .el-icon {
  font-size: 24px;
  margin-bottom: 10px;
}

@media (max-width: 768px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }
  
  .detail-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .detail-header h2 {
    margin-bottom: 10px;
  }
}
</style>