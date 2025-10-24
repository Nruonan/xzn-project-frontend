<script setup>
import { Document, Delete, EditPen, View, Search, Plus } from '@element-plus/icons-vue'
import {
  getNoticeList,
  getNoticeDetail,
  createNotice,
  updateNotice,
  deleteNotice
} from "@/net/api/notice.js"
import { reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const editor = reactive({
  id: 0,
  display: false,
  temp: {},
  loading: false,
  isDetail: false, // 区分是查看详情还是编辑
  isCreate: false // 区分是创建还是编辑
})

const noticeTable = reactive({
  page: 1,
  size: 10,
  total: 0,
  data: [],
  searchTitle: '', // 添加搜索内容字段
  isSearching: false // 添加搜索状态标识
})

// 打开详情查看
function openNoticeDetail(notice) {
  editor.id = notice.id
  editor.isDetail = true
  editor.isCreate = false
  editor.display = true
  editor.loading = true
  getNoticeDetail(editor.id, data => {
    editor.temp = { ...data }
    editor.loading = false
  })
}

// 打开编辑器
function openNoticeEditor(notice) {
  editor.id = notice.id
  editor.isDetail = false
  editor.isCreate = false
  editor.display = true
  editor.loading = true
  getNoticeDetail(editor.id, data => {
    editor.temp = { ...data }
    editor.loading = false
  })
}

// 打开创建界面
function openCreateNotice() {
  editor.id = 0
  editor.isDetail = false
  editor.isCreate = true
  editor.display = true
  editor.loading = false
  editor.temp = {
    title: '',
    content: '',
    status: '',
  }
}

// 保存公告信息
function saveNotice() {
  editor.display = false
  if (editor.isCreate) {
    // 创建新公告
    createNotice(editor.temp, () => {
      ElMessage.success('公告创建成功')
      // 创建后重新加载数据
      if (noticeTable.isSearching) {
        searchNotices()
      } else {
        loadNoticeList()
      }
    })
  } else {
    // 更新公告
    updateNotice(editor.temp, () => {
      const notice = noticeTable.data.find(n => n.id === editor.id)
      Object.assign(notice, editor.temp)
      ElMessage.success('更新成功')
    })
  }
}

// 删除公告
function deleteNoticeById(id) {
  ElMessageBox.confirm(
      '此操作将永久删除该公告, 是否继续?',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
  ).then(() => {
    deleteNotice(id,() => {
      ElMessage.success('删除成功!')
      // 删除后根据当前状态重新加载数据
      if (noticeTable.isSearching) {
        searchNotices()
      } else {
        loadNoticeList()
      }
    })
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

// 加载所有公告列表（默认情况）
function loadNoticeList() {
  noticeTable.isSearching = false
  getNoticeList(noticeTable.page, noticeTable.size, noticeTable.searchTitle, data => {
    noticeTable.total = data.total
    noticeTable.data = data.records
  })
}

// 搜索功能
function searchNotices() {
  // 公告搜索需要后端支持，这里暂时用前端过滤
  noticeTable.isSearching = true
  noticeTable.page = 1 // 搜索时重置到第一页
  loadNoticeList()
}

// 重置搜索
function resetSearch() {
  noticeTable.searchTitle = ''
  noticeTable.isSearching = false
  noticeTable.page = 1
}

// 分页变化时的处理函数
function handlePageChange() {
  if (noticeTable.isSearching) {
    searchNotices()
  } else {
    loadNoticeList()
  }
}

// 大小变化时的处理函数
function handleSizeChange() {
  noticeTable.page = 1 // 重置到第一页
  if (noticeTable.isSearching) {
    searchNotices()
  } else {
    loadNoticeList()
  }
}

// 默认加载所有数据
onMounted(() => {
  loadNoticeList()
})
</script>

<template>
  <div class="notice-admin">
    <div class="title">
      <el-icon><Document /></el-icon>
      公告管理
    </div>
    <div class="desc">
      在这里管理平台的所有公告内容
    </div>
    <!-- 添加操作区域 -->
    <div class="operation-area" style="margin-bottom: 20px; display: flex; gap: 10px; align-items: center;">
      <!-- 搜索功能暂时保留，但需要后端支持 -->
      <el-input
          v-model="noticeTable.searchTitle"
          placeholder="请输入公告标题进行搜索"
          clearable
          style="width: 300px"
          @keyup.enter="searchNotices"
      />
      <el-button type="primary" :icon="Search" @click="searchNotices">搜索</el-button>
      <el-button @click="resetSearch">重置</el-button>
      <el-button type="primary" :icon="Plus" @click="openCreateNotice">添加公告</el-button>
    </div>
    <el-table :data="noticeTable.data" height="600">
      <el-table-column prop="id" label="公告编号" width="120" />
      <el-table-column prop="title" label="公告标题" width="300" >
        <template #default="{ row }">
          <div class="table-post-title">
            {{ row.title.length > 20 ? row.title.substring(0, 20) + '...' : row.title }}
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="content" label="公告内容" width="600" >
        <template #default="{ row }">
          <div class="table-post-content">
            {{ row.content.length > 50 ? row.content.substring(0, 50) + '...' : row.content }}
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="是否置顶" width="120">
        <template #default="{ row }">
          <el-tag :type="row.status ? 'danger' : 'info'">{{ row.status == 1 ? '是' : '否' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="发布时间" width="200">
        <template #default="{ row }">
          {{ new Date(row.publishTime).toLocaleString() }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="250" align="center">
        <template #default="{ row }">
          <el-button type="primary" size="small" :icon="View" @click="openNoticeDetail(row)">查看</el-button>
          <el-button type="success" size="small" :icon="EditPen" @click="openNoticeEditor(row)">编辑</el-button>
          <el-button type="danger" size="small" :icon="Delete" @click="deleteNoticeById(row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="pagination">
      <el-pagination
          :total="noticeTable.total"
          v-model:current-page="noticeTable.page"
          v-model:page-size="noticeTable.size"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
      />
    </div>

    <!-- 公告详情/编辑抽屉 -->
    <el-drawer v-model="editor.display" size="50%">
      <template #header>
        <div>
          <div style="font-weight: bold">
            <el-icon><Document /></el-icon>
            {{ editor.isCreate ? '创建公告' : editor.isDetail ? '公告详情' : '编辑公告' }}
          </div>
          <div style="font-size: 13px">
            {{ editor.isCreate ? '填写公告信息后点击保存' : editor.isDetail ? '公告详细信息' : '编辑完成后请点击下方保存按钮' }}
          </div>
        </div>
      </template>
      <el-form label-position="top" :disabled="editor.isDetail">
        <el-form-item label="公告编号" v-if="!editor.isCreate">
          <el-input v-model="editor.temp.id" disabled />
        </el-form-item>
        <el-form-item label="公告标题">
          <el-input
              v-model="editor.temp.title"
              :disabled="editor.isDetail"
              placeholder="请输入公告标题"
          />
        </el-form-item>
        <el-form-item label="公告内容">
          <el-input
              v-model="editor.temp.content"
              type="textarea"
              :rows="6"
              :disabled="editor.isDetail"
              placeholder="请输入公告内容"
          />
        </el-form-item>
        <el-form-item label="是否置顶">
          <el-switch
              v-model="editor.temp.status"
              :disabled="editor.isDetail"
              :active-value="1"
              :inactive-value="0"
              active-text="是"
              inactive-text="否"
          />
        </el-form-item>
        <el-form-item label="发布时间" v-if="!editor.isCreate">
          <el-date-picker
              v-model="editor.temp.publishTime"
              type="datetime"
              placeholder="选择日期时间"
              style="width: 100%"
              value-format="YYYY-MM-DD HH:mm:ss"
              :disabled="editor.isDetail"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div style="text-align: center">
          <el-button type="success" @click="saveNotice" v-if="!editor.isDetail">保存</el-button>
          <el-button type="info" @click="editor.display = false">{{ editor.isDetail ? '关闭' : '取消' }}</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<style lang="less" scoped>
.notice-admin {
  .title {
    font-weight: bold;
    font-size: 20px;
    margin-bottom: 10px;
  }

  .desc {
    color: #888;
    font-size: 14px;
    margin-bottom: 20px;
  }

  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>