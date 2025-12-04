<template>
  <div class="point-rule-admin" style="padding: 10px 20px">
    <el-card>
      <template #header>
        <div class="card-header">
          <el-icon><Operation /></el-icon>
          积分规则管理
        </div>
      </template>
      
      <div class="desc">
        在这里管理平台的积分获取和消耗规则
      </div>
      
      <!-- 操作区域 -->
      <div style="display: flex; justify-content: space-between; margin-bottom: 15px">
        <div>
          <el-button type="primary" :icon="Plus" @click="handleAdd">添加规则</el-button>
        </div>
        <div style="display: flex; gap: 10px">
          <el-select v-model="searchType" placeholder="请选择动作类型" clearable style="width: 150px">
            <el-option label="发帖" value="post" />
            <el-option label="评论" value="comment" />
            <el-option label="点赞" value="like" />
          </el-select>
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </div>
      </div>
      
      <!-- 表格区域 -->
      <el-table :data="tableData" border style="width: 100%">
        <el-table-column prop="id" label="规则ID" min-width="100" />
        <el-table-column prop="type" label="动作类型" min-width="120">
          <template #default="scope">
            <el-tag v-if="scope.row.type === 'post'" type="success">发帖</el-tag>
            <el-tag v-else-if="scope.row.type === 'comment'" type="primary">评论</el-tag>
            <el-tag v-else-if="scope.row.type === 'like'" type="warning">点赞</el-tag>
            <el-tag v-else>{{ scope.row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="score" label="积分" min-width="100">
          <template #default="scope">
            <span :class="scope.row.score > 0 ? 'positive' : 'negative'">
              {{ scope.row.score > 0 ? '+' : '' }}{{ scope.row.score }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="dayLimit" label="每日限制" min-width="120">
          <template #default="scope">
            <span v-if="scope.row.dayLimit === 0">无限制</span>
            <span v-else>{{ scope.row.dayLimit }}次/天</span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" min-width="180">
          <template #default="scope">
            {{ formatDateTime(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="150" fixed="right">
          <template #default="scope">
            <el-button-group>
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

// 搜索条件
const searchType = ref('')

// 对话框相关
const dialogVisible = ref(false)
const dialogTitle = ref('')
const isEdit = ref(false)

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

// 模拟静态数据
const mockData = [
  { id: 1, type: 'post', score: 10, dayLimit: 5, createTime: '2023-12-01 10:00:00' },
  { id: 2, type: 'comment', score: 5, dayLimit: 10, createTime: '2023-12-01 10:00:00' },
  { id: 3, type: 'like', score: 1, dayLimit: 20, createTime: '2023-12-01 10:00:00' }
]

// 获取表格数据
const getTableData = () => {
  // 模拟分页和筛选
  let filteredData = [...mockData]
  
  // 根据搜索条件过滤
  if (searchType.value) {
    filteredData = filteredData.filter(item => item.type === searchType.value)
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
  // 填充表单数据
  Object.assign(form, row)
  dialogVisible.value = true
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
    const newRule = {
      id: mockData.length > 0 ? Math.max(...mockData.map(item => item.id)) + 1 : 1,
      type: form.type,
      score: form.score,
      dayLimit: form.dayLimit,
      createTime: new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }).replace(/\//g, '-')
    }
    mockData.push(newRule)
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
.point-rule-admin {
  .desc {
    color: #bababa;
    font-size: 13px;
    margin-bottom: 20px;
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