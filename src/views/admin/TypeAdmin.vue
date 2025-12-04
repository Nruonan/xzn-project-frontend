<script setup>
import { Document, Delete, EditPen, View, Search, Plus, Collection } from '@element-plus/icons-vue'
import { reactive, ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  apiAdminTopicTypeList, 
  apiAdminTopicTypeDetail, 
  apiAdminTopicTypeCreate, 
  apiAdminTopicTypeUpdate, 
  apiAdminTopicTypeRemove 
} from '@/net/api/forum.js';

// API 接口函数
const getTypeList = (page, size, searchName, success) => {
  apiAdminTopicTypeList(page, size, searchName, (data) => {
    typeTable.data = data.records
    typeTable.total = data.total
  })
}

const getTypeDetail = (id, success) => {
  apiAdminTopicTypeDetail(id, (data) => {
    success(data)
  })
}

const createType = (data, success) => {
  apiAdminTopicTypeCreate(data, (data) => {
    success(data)
  })
}

const updateType = (data, success) => {
  apiAdminTopicTypeUpdate(data, (data) => {
    success(data)
  })
}

const removeType = (id, success) => {
  apiAdminTopicTypeRemove(id, (data) => {
    success(data)
  })
}

const editor = reactive({
  id: 0,
  display: false,
  temp: {},
  loading: false,
  isDetail: false, // 区分是查看详情还是编辑
  isCreate: false // 区分是创建还是编辑
})

const typeTable = reactive({
  page: 1,
  size: 10,
  total: 0,
  data: [],
  searchName: '', // 添加搜索内容字段
  isSearching: false // 添加搜索状态标识
})

// 打开详情查看
function openTypeDetail(type) {
  editor.id = type.id
  editor.isDetail = true
  editor.isCreate = false
  editor.display = true
  editor.loading = true
  getTypeDetail(editor.id, data => {
    editor.temp = { ...data }
    editor.loading = false
  })
}

// 打开编辑器
function openTypeEditor(type) {
  editor.id = type.id
  editor.isDetail = false
  editor.isCreate = false
  editor.display = true
  editor.loading = true
  getTypeDetail(editor.id, data => {
    editor.temp = data;
    editor.loading = false
  })
}

// 打开创建界面
function openCreateType() {
  editor.id = 0
  editor.isDetail = false
  editor.isCreate = true
  editor.display = true
  editor.loading = false
  editor.temp = {
    name: '',
    desc: '',
    color: '#409EFF'
  }
}

// 关闭弹窗
function closeEditor() {
  editor.display = false
  editor.temp = {}
}

// 提交表单
function submitForm(formRef) {
  if (editor.isCreate) {
    createType(editor.temp, () => {
      ElMessage.success('创建成功')
      closeEditor()
      loadTypeList()
    })
  } else {
    updateType(editor.temp, () => {
      ElMessage.success('更新成功')
      closeEditor()
      loadTypeList()
    })
  }
}

// 删除类型
function deleteType(type) {
  ElMessageBox.confirm(
      `确认删除类型"${type.name}"吗？`,
      '警告',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      }
  ).then(() => {
    removeType(type.id, () => {
      ElMessage.success('删除成功')
      loadTypeList()
    })
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

// 加载类型列表
function loadTypeList() {
  getTypeList(typeTable.page, typeTable.size, typeTable.searchName, (data) => {
    typeTable.total = data.total
    typeTable.data = data.list
  })
}

// 搜索类型
function searchTypes() {
  typeTable.page = 1
  typeTable.isSearching = !!typeTable.searchName.trim()
  loadTypeList()
}

// 重置搜索
function resetSearch() {
  typeTable.searchName = ''
  typeTable.page = 1
  typeTable.isSearching = false
  loadTypeList()
}

// 分页相关函数
function handleSizeChange(val) {
  typeTable.size = val
  loadTypeList()
}

function handleCurrentChange(val) {
  typeTable.page = val
  loadTypeList()
}



// 组件挂载时加载数据
onMounted(() => {
  loadTypeList()
})
</script>

<template>
  <div class="type-admin" style="padding: 10px 20px">
    <el-card>
      <template #header>
        <div class="card-header">
          <el-icon><Collection /></el-icon>
          帖子类型管理
        </div>
      </template>
 
      <div class="desc">
        在这里管理社区的所有帖子类型
      </div>
      <!-- 搜索区域 -->
      <div style="display: flex; justify-content: space-between; margin-bottom: 15px">
        <div>
          <el-button type="primary" @click="openCreateType" :icon="Plus">添加类型</el-button>
        </div>
        <div style="display: flex; gap: 10px">
          <el-input v-model="typeTable.searchName" placeholder="请输入类型名称进行搜索" clearable style="width: 250px"/>
          <el-button type="primary" @click="searchTypes" :icon="Search">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </div>
      </div>

      <!-- 表格区域 -->
      <el-table :data="typeTable.data" style="width: 100%" border>
        <el-table-column prop="id" label="ID" width="80"/>
        <el-table-column prop="name" label="类型名称"/>
        <el-table-column prop="desc" label="类型描述"/>
        <el-table-column label="颜色" width="120">
          <template #default="scope">
            <div style="display: flex; align-items: center;">
              <div :style="{ width: '20px', height: '20px', backgroundColor: scope.row.color, borderRadius: '4px', marginRight: '8px' }"></div>
              <span>{{ scope.row.color }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="300">
          <template #default="scope">
            <el-button-group>
              <el-button type="primary" @click="openTypeDetail(scope.row)" :icon="View" size="small">查看</el-button>
              <el-button type="warning" @click="openTypeEditor(scope.row)" :icon="EditPen" size="small">编辑</el-button>
              <el-button type="danger" @click="deleteType(scope.row)" :icon="Delete" size="small">删除</el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页组件 -->
      <div style="margin-top: 15px; display: flex; justify-content: center">
        <el-pagination
            v-model:current-page="typeTable.page"
            v-model:page-size="typeTable.size"
            :page-sizes="[5, 10, 20, 50]"
            :total="typeTable.total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 编辑/创建对话框 -->
    <el-dialog v-model="editor.display" :title="editor.isCreate ? '创建类型' : (editor.isDetail ? '查看类型' : '编辑类型')" width="500" draggable>
      <el-form :model="editor.temp" label-width="80px" :disabled="editor.isDetail" ref="formRef">
        <el-form-item label="类型名称">
          <el-input v-model="editor.temp.name" placeholder="请输入类型名称"/>
        </el-form-item>
        <el-form-item label="类型描述">
          <el-input v-model="editor.temp.desc" type="textarea" placeholder="请输入类型描述"/>
        </el-form-item>
        <el-form-item label="颜色">
          <el-color-picker v-model="editor.temp.color" :disabled="editor.isDetail" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeEditor">取消</el-button>
          <el-button v-if="!editor.isDetail" type="primary" @click="submitForm(formRef)">提交</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.type-admin {
  .title {
    font-weight: bold;
  }

  .desc {
    color: #bababa;
    font-size: 13px;
    margin-bottom: 20px;
  }

  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>