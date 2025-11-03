<script setup>
import { Document, Delete, EditPen, View, Search } from '@element-plus/icons-vue'
import {
  apiAdminCommentList,
  apiAdminCommentDetail,
  apiAdminCommentUpdate,
  apiAdminCommentRemove
} from "@/net/api/forum.js"
import { reactive, watchEffect } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const editor = reactive({
  id: 0,
  display: false,
  temp: {},
  loading: false,
  isDetail: false // 区分是查看详情还是编辑
})

const commentTable = reactive({
  page: 1,
  size: 10,
  total: 0,
  data: [],
  searchContent: '', // 添加搜索内容字段
  isSearching: false // 添加搜索状态标识
})

// 打开详情查看
function openCommentDetail(comment) {
  editor.id = comment.id
  editor.isDetail = true
  editor.display = true
  editor.loading = true
  apiAdminCommentDetail(editor.id, data => {
    editor.temp = { ...data }
    editor.loading = false
  })
}

// 打开编辑器
function openCommentEditor(comment) {
  editor.id = comment.id
  editor.isDetail = false
  editor.display = true
  editor.loading = true
  apiAdminCommentDetail(editor.id, data => {
    editor.temp = { ...data }
    editor.loading = false
  })
}

// 保存评论信息
function saveComment() {
  editor.display = false
  apiAdminCommentUpdate(editor.temp, () => {
    const comment = commentTable.data.find(c => c.id === editor.id)
    Object.assign(comment, editor.temp)
    ElMessage.success('数据保存成功')
  })
}

// 删除评论
function deleteComment(id) {
  ElMessageBox.confirm(
      '此操作将永久删除该评论, 是否继续?',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
  ).then(() => {
    apiAdminCommentRemove(id, () => {
      ElMessage.success('删除成功!')
      // 删除后根据当前状态重新加载数据
      if (commentTable.isSearching) {
        searchComments()
      } else {
        loadCommentList()
      }
    })
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

// 加载所有评论列表（默认情况）
function loadCommentList() {
  commentTable.isSearching = false
  apiAdminCommentList(commentTable.page, commentTable.size, '', data => {
    commentTable.total = data.total
    commentTable.data = data.list
  })
}

// 搜索功能
function searchComments() {
  commentTable.isSearching = true
  commentTable.page = 1 // 搜索时重置到第一页
  apiAdminCommentList(commentTable.page, commentTable.size, commentTable.searchContent, data => {
    commentTable.total = data.total
    commentTable.data = data.list
  })
}

// 重置搜索
function resetSearch() {
  commentTable.searchContent = ''
  commentTable.isSearching = false
  commentTable.page = 1
  loadCommentList()
}

// 分页变化时的处理函数
function handlePageChange() {
  if (commentTable.isSearching) {
    searchComments()
  } else {
    loadCommentList()
  }
}

// 大小变化时的处理函数
function handleSizeChange() {
  commentTable.page = 1 // 重置到第一页
  if (commentTable.isSearching) {
    searchComments()
  } else {
    loadCommentList()
  }
}

// 默认加载所有数据
loadCommentList()
</script>

<template>
  <div class="comment-admin" style="padding: 10px 20px">
    <el-card>
      <template #header>
        <div class="card-header">
          <el-icon><Document /></el-icon>
          讨论管理
        </div>
      </template>
      
      <div class="desc">
        在这里管理平台的所有讨论内容
      </div>
      
      <!-- 搜索区域 -->
      <div style="display: flex; justify-content: space-between; margin-bottom: 15px">
        <div></div> <!-- 左侧占位 -->
        <div style="display: flex; gap: 10px">
          <el-input
              v-model="commentTable.searchContent"
              placeholder="请输入评论内容进行搜索"
              clearable
              style="width: 300px"
              @keyup.enter="searchComments"
          />
          <el-button type="primary" :icon="Search" @click="searchComments">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </div>
      </div>
      
      <!-- 表格区域 -->
      <el-table :data="commentTable.data" style="width: 100%" border>
        <el-table-column prop="id" label="评论编号" min-width="120" />
        <el-table-column prop="uid" label="用户ID" min-width="120" />
        <el-table-column prop="tid" label="帖子ID" min-width="120" />
        <el-table-column prop="content" label="评论内容" min-width="550" >
          <template #default="{ row }">
            <div class="table-post-title">
              {{ row.content.length > 50 ? row.content.substring(0, 50) + '...' : row.content }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="评论时间" min-width="200">
          <template #default="{ row }">
            {{ new Date(row.time).toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="250" align="center">
          <template #default="{ row }">
            <el-button-group>
              <el-button type="primary" size="small" :icon="View" @click="openCommentDetail(row)">查看</el-button>
              <el-button type="success" size="small" :icon="EditPen" @click="openCommentEditor(row)">编辑</el-button>
              <el-button type="danger" size="small" :icon="Delete" @click="deleteCommentById(row.id)">删除</el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页组件 -->
      <div style="margin-top: 20px; display: flex; justify-content: center">
        <el-pagination
            :total="commentTable.total"
            v-model:current-page="commentTable.page"
            v-model:page-size="commentTable.size"
            layout="total, sizes, prev, pager, next, jumper"
            @current-change="handlePageChange"
            @size-change="handleSizeChange"
        />
      </div>
    </el-card>

    <!-- 评论详情/编辑对话框 -->
    <el-dialog 
      v-model="editor.display" 
      :title="editor.isDetail ? '评论详情' : '编辑评论'" 
      width="500px"
      draggable
    >
      <el-form label-position="top" :disabled="editor.isDetail">
        <el-form-item label="评论编号">
          <el-input v-model="editor.temp.id" disabled />
        </el-form-item>
        <el-form-item label="用户ID">
          <el-input v-model="editor.temp.uid" disabled />
        </el-form-item>
        <el-form-item label="帖子ID">
          <el-input v-model="editor.temp.tid" disabled />
        </el-form-item>
        <el-form-item label="评论内容">
          <el-input
              v-model="editor.temp.content"
              type="textarea"
              :rows="4"
              :disabled="editor.isDetail"
              placeholder="请输入评论内容"
          />
        </el-form-item>
        <el-form-item label="根评论ID">
          <el-input v-model="editor.temp.root" disabled />
        </el-form-item>
        <el-form-item label="引用评论ID">
          <el-input v-model="editor.temp.quote" disabled />
        </el-form-item>
        <el-form-item label="评论时间">
          <el-date-picker
              v-model="editor.temp.time"
              type="datetime"
              placeholder="选择日期时间"
              style="width: 100%"
              value-format="YYYY-MM-DD HH:mm:ss"
              :disabled="editor.isDetail"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="info" @click="editor.display = false">{{ editor.isDetail ? '关闭' : '取消' }}</el-button>
          <el-button type="success" @click="saveComment" v-if="!editor.isDetail">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="less" scoped>
.comment-admin {
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