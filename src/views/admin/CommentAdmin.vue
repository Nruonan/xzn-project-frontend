<script setup>
import { Document, Delete, EditPen, View } from '@element-plus/icons-vue'
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
  data: []
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
      // 重新加载数据
      watchEffect(() => apiAdminCommentList(commentTable.page, commentTable.size, data => {
        commentTable.total = data.total
        commentTable.data = data.list
      }))
    })
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

// 监听分页变化并加载数据
watchEffect(() => apiAdminCommentList(commentTable.page, commentTable.size, data => {
  commentTable.total = data.total
  commentTable.data = data.list
}))

</script>

<template>
  <div class="comment-admin">
    <div class="title">
      <el-icon><Document /></el-icon>
      讨论管理
    </div>
    <div class="desc">
      在这里管理平台的所有讨论内容
    </div>
    <el-table :data="commentTable.data" height="600">
      <el-table-column prop="id" label="评论编号" width="120" />
      <el-table-column prop="uid" label="用户ID" width="120" />
      <el-table-column prop="tid" label="帖子ID" width="120" />
      <el-table-column prop="content" label="评论内容" width="300" >
        <template #default="{ row }">
          <div class="table-post-title">
            {{ row.content.length > 50 ? row.content.substring(0, 50) + '...' : row.content }}
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="root" label="根评论" width="120" />
      <el-table-column prop="quote" label="引用评论" width="120" />
      <el-table-column label="评论时间" width="200">
        <template #default="{ row }">
          {{ new Date(row.time).toLocaleString() }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="250" align="center">
        <template #default="{ row }">
          <el-button type="primary" size="small" :icon="View" @click="openCommentDetail(row)">查看</el-button>
          <el-button type="success" size="small" :icon="EditPen" @click="openCommentEditor(row)">编辑</el-button>
          <el-button type="danger" size="small" :icon="Delete" @click="deleteComment(row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="pagination">
      <el-pagination
          :total="commentTable.total"
          v-model:current-page="commentTable.page"
          v-model:page-size="commentTable.size"
          layout="total, sizes, prev, pager, next, jumper"
      />
    </div>

    <!-- 评论详情/编辑抽屉 -->
    <el-drawer v-model="editor.display" size="50%">
      <template #header>
        <div>
          <div style="font-weight: bold">
            <el-icon><Document /></el-icon> {{ editor.isDetail ? '评论详情' : '编辑评论' }}
          </div>
          <div style="font-size: 13px">{{ editor.isDetail ? '评论详细信息' : '编辑完成后请点击下方保存按钮' }}</div>
        </div>
      </template>
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
        <div style="text-align: center">
          <el-button type="success" @click="saveComment" v-if="!editor.isDetail">保存</el-button>
          <el-button type="info" @click="editor.display = false">{{ editor.isDetail ? '关闭' : '取消' }}</el-button>
        </div>
      </template>
    </el-drawer>
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