<template>
  <div class="point-rule-admin">
    <el-card>
      <template #header>
        <div class="card-header">
          <el-icon><Setting /></el-icon>
          积分规则管理
        </div>
      </template>
      
      <div class="desc">
        在这里管理平台的所有积分规则
      </div>
      
      <!-- 操作区域 -->
      <div style="display: flex; justify-content: space-between; margin-bottom: 15px">
        <div class="left">
          <el-button type="primary" :icon="Plus" @click="handleAdd">添加规则</el-button>
        </div>
        <div class="right">
          <el-form :inline="true">
            <el-form-item>
              <el-select v-model="searchType" placeholder="请选择动作类型" clearable style="width: 150px">
                <el-option label="发帖" value="post" />
                <el-option label="评论" value="comment" />
                <el-option label="点赞" value="like" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
              <el-button @click="resetSearch">重置</el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>

      <!-- 表格区域 -->
      <el-table :data="tableData" border style="width: 100%">
        <el-table-column prop="id" label="规则ID" width="140" align="center" />
        <el-table-column prop="type" label="动作类型" width="140" align="center">
          <template #default="scope">
            <el-tag v-if="scope.row.type === 'post'" type="success">发帖</el-tag>
            <el-tag v-else-if="scope.row.type === 'comment'" type="primary">评论</el-tag>
            <el-tag v-else-if="scope.row.type === 'like'" type="warning">点赞</el-tag>
            <el-tag v-else>{{ scope.row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="score" label="积分" min-width="140" align="center">
          <template #default="scope">
            <span :class="scope.row.score > 0 ? 'positive' : 'negative'">
              {{ scope.row.score > 0 ? '+' : '' }}{{ scope.row.score }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="dayLimit" label="每日限制" min-width="140" align="center">
          <template #default="scope">
            <span v-if="scope.row.dayLimit === 0">无限制</span>
            <span v-else>{{ scope.row.dayLimit }}次/天</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right" align="center">
          <template #default="scope">
            <el-button-group>
              <el-button size="small" type="primary" @click="handleEdit(scope.row)">编辑</el-button>
              <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
            </el-button-group>
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

    <!-- 创建/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="动作类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择动作类型" style="width: 100%">
            <el-option label="发帖" value="post" />
            <el-option label="评论" value="comment" />
            <el-option label="点赞" value="like" />
          </el-select>
        </el-form-item>
        <el-form-item label="积分" prop="score">
          <el-input-number 
            v-model="form.score" 
            :min="-1000" 
            :max="1000" 
            placeholder="请输入积分值"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="每日限制" prop="dayLimit">
          <el-input-number 
            v-model="form.dayLimit" 
            :min="0" 
            placeholder="0表示无限制"
            style="width: 100%"
          />
          <div class="tip">0表示无限制，其他数字表示每天最多可获得积分的次数</div>
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
import { Operation, Search, Plus } from '@element-plus/icons-vue'
import { reactive, ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { get, post } from '@/net'

// 搜索条件
const searchType = ref('')

// 对话框相关
const dialogVisible = ref(false)
const dialogTitle = ref('')
const isEdit = ref(false)
const formRef = ref()

// 表单数据
const form = reactive({
  id: 0,
  type: '',
  score: 0,
  dayLimit: 0
})

// 表单验证规则
const rules = {
  type: [{ required: true, message: '请选择动作类型', trigger: 'change' }],
  score: [{ required: true, message: '请输入积分值', trigger: 'blur' }],
  dayLimit: [{ required: true, message: '请输入每日限制', trigger: 'blur' }]
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

// 获取表格数据
const getTableData = () => {
  // 构建请求参数
  const params = {
    pageNum: pagination.pageNum,
    pageSize: pagination.pageSize
  }
  
  // 添加搜索条件
  if (searchType.value) {
    params.type = searchType.value
  }
  
  // 构建查询字符串
  const queryString = Object.keys(params)
    .filter(key => params[key] !== undefined && params[key] !== '')
    .map(key => `${key}=${encodeURIComponent(params[key])}`)
    .join('&')
  
  const url = queryString ? `/api/admin/point/rule/list?${queryString}` : '/api/admin/point/rule/list'
  
  // 发送请求获取积分规则列表
  get(url, (data) => {
    tableData.value = data.records || []
    pagination.total = data.total || 0
  }, (message) => {
    ElMessage.error(message || '获取积分规则列表失败')
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

// 添加规则
const handleAdd = () => {
  dialogTitle.value = '添加积分规则'
  isEdit.value = false
  // 重置表单
  Object.assign(form, {
    id: 0,
    type: '',
    score: 0,
    dayLimit: 0
  })
  dialogVisible.value = true
}

// 编辑规则
const handleEdit = (row) => {
  dialogTitle.value = '编辑积分规则'
  isEdit.value = true
  // 获取规则详情
  get(`/api/admin/point/rule/detail?id=${row.id}`, (data) => {
    // 填充表单数据
    Object.assign(form, data)
    dialogVisible.value = true
  }, (message) => {
    ElMessage.error(message || '获取积分规则详情失败')
  })
}

// 删除规则
const handleDelete = (row) => {
  ElMessageBox.confirm(
    '此操作将永久删除该积分规则, 是否继续?',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    // 发送删除请求
    get(`/api/admin/point/rule/delete?id=${row.id}`, (data) => {
      ElMessage.success('删除成功!')
      getTableData()
    }, (message) => {
      ElMessage.error(message || '删除失败')
    })
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

// 提交表单
const handleSubmit = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      if (isEdit.value) {
        // 发送更新请求
        post('/api/admin/point/rule/update', form, (data) => {
          ElMessage.success('编辑成功!')
          dialogVisible.value = false
          getTableData()
        }, (message) => {
          ElMessage.error(message || '编辑失败')
        })
      } else {
        // 发送创建请求
        post('/api/admin/point/rule/create', form, (data) => {
          ElMessage.success('添加成功!')
          dialogVisible.value = false
          getTableData()
        }, (message) => {
          ElMessage.error(message || '添加失败')
        })
      }
    }
  })
}

// 关闭对话框
const handleDialogClose = () => {
  formRef.value?.resetFields()
}

// 组件挂载时获取数据
onMounted(() => {
  getTableData()
})
</script>

<style lang="less" scoped>
.point-rule-admin {
  padding: 10px 20px;
  
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
  
  .search-area {
    display: flex;
    justify-content: space-between;
    margin-bottom: 15px;
    
    .right {
      display: flex;
      align-items: center;
    }
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
  
  .tip {
    font-size: 12px;
    color: #999;
    margin-top: 5px;
  }
}
</style>