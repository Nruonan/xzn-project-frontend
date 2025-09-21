<script setup>
import {EditPen, Document, Delete,View, Search} from "@element-plus/icons-vue";
import { apiTopicDetail, apiTopicUpdate, apiTopicList,apiTopicRemove} from "@/net/api/forum.js";
import {reactive, watchEffect} from "vue";
import {ElMessage, ElMessageBox} from "element-plus";
import {QuillDeltaToHtmlConverter} from "quill-delta-to-html";

const editor = reactive({
  id: 0,
  display: false,
  temp: {},
  loading: false,
  isDetail: false // 添加标识区分查看和编辑模式
})

const topicTable = reactive({
  page : 1,
  size: 10,
  total: 0,
  data: [],
  searchTitle: '', // 添加搜索标题字段
  isSearching: false // 添加搜索状态标识
})

// 打开编辑器
function openPostEditor(post) {
  editor.id = post.id
  editor.isDetail = false // 设置为编辑模式
  editor.display = true
  editor.loading = true
  apiTopicDetail(editor.id, data => {
    editor.temp = { ...data, ...post }
    editor.loading = false
  })
}

// 打开详情查看（只读模式）
function openCommentDetail(comment) {
  editor.id = comment.id
  editor.isDetail = true // 设置为查看模式
  editor.display = true
  editor.loading = true
  apiTopicDetail(editor.id, data => {
    editor.temp = { ...data }
    editor.loading = false
  })
}

function postStatus(post){
  if(post === 1)
    return '置顶'
  else
    return '非置顶'
}

function convertToHtml(content){
  const ops = JSON.parse(content).ops
  const converter = new QuillDeltaToHtmlConverter(ops, { inlineStyles: true});
  return converter.convert()
}

function savePostDetail(){
  // 只有在编辑模式下才能保存
  if (!editor.isDetail) {
    editor.display = false
    apiTopicUpdate(editor.temp, () => {
      const post = topicTable.data.find(post => post.id === editor.id)
      Object.assign(post, editor.temp)
      ElMessage.success('数据保存成功')
    })
  }
}

function deleteTopic(id){
  ElMessageBox.confirm(
      '此操作将删除该帖子, 是否继续?',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
  ).then(() => {
    apiTopicRemove(id, () => {
      ElMessage.success('删除成功!')
      // 删除后重新加载当前数据（保持搜索状态）
      if (topicTable.isSearching) {
        searchTopics()
      } else {
        loadTopicList()
      }
    })
  }).catch(() => {
    ElMessage.info('已取消删除，可在帖子中查询');
  });
}

function convertType(type){
  if(type === 1)
    return '日常闲聊'
  else if(type === 2)
    return '真诚交友'
  else if(type === 3)
    return '问题反馈'
  else if(type === 4)
    return '恋爱官宣'
  else
    return '踩坑记录'
}

// 加载所有帖子列表（默认情况）
function loadTopicList() {
  topicTable.isSearching = false
  apiTopicList(topicTable.page, topicTable.size, '', data => {
    topicTable.total = data.total
    topicTable.data = data.list
  })
}

// 搜索功能
function searchTopics() {
  topicTable.isSearching = true
  topicTable.page = 1 // 搜索时重置到第一页
  apiTopicList(topicTable.page, topicTable.size, topicTable.searchTitle, data => {
    topicTable.total = data.total
    topicTable.data = data.list
  })
}

// 重置搜索
function resetSearch() {
  topicTable.searchTitle = ''
  topicTable.isSearching = false
  topicTable.page = 1
  loadTopicList()
}

// 分页变化时的处理函数
function handlePageChange() {
  if (topicTable.isSearching) {
    searchTopics()
  } else {
    loadTopicList()
  }
}

// 大小变化时的处理函数
function handleSizeChange() {
  topicTable.page = 1 // 重置到第一页
  if (topicTable.isSearching) {
    searchTopics()
  } else {
    loadTopicList()
  }
}

// 默认加载所有数据
loadTopicList()
</script>

<template>
  <div class="post-admin">
    <div class="title">
      <el-icon><Document/></el-icon>
      论坛帖子列表
    </div>
    <div class="desc">
      在这里管理论坛的所有帖子，包括帖子内容、隐藏和删除处理
    </div>
    <!-- 添加搜索区域 -->
    <div class="search-area" style="margin-bottom: 20px; display: flex; gap: 10px; align-items: center;">
      <el-input
          v-model="topicTable.searchTitle"
          placeholder="请输入帖子标题进行搜索"
          clearable
          style="width: 300px"
          @keyup.enter="searchTopics"
      />
      <el-button type="primary" :icon="Search" @click="searchTopics">搜索</el-button>
      <el-button @click="resetSearch">重置</el-button>
    </div>
    <el-table :data="topicTable.data" height="600">
      <el-table-column prop="id" label="编号" width="100"/>
      <el-table-column label="标题" width="200" align="center">
        <template #default="{ row }">
          <div class="table-post-title">
            {{ row.title.length > 25 ? row.title.substring(0, 25) + '...' : row.title }}
          </div>
        </template>
      </el-table-column>
      <el-table-column label="作者" width="140" align="center">
        <template #default="{ row }">
          {{ row.uid }}
        </template>
      </el-table-column>
      <el-table-column width="140" align="center" label="类型">
        <template #default="{ row }">
          {{ convertType(row.type) }}
        </template>
      </el-table-column>
      <el-table-column width="250" align="center" label="内容">
        <template #default="{ row }">
          <div v-html="convertToHtml(row.content).length > 50 ? convertToHtml(row.content).substring(0, 50) + '...' : convertToHtml(row.content)"></div>
        </template>
      </el-table-column>
      <el-table-column label="发布时间" width="200" align="center">
        <template #default="{ row }">
          {{ new Date(row.time).toLocaleString() }}
        </template>
      </el-table-column>
      <el-table-column label="置顶状态" width="150" align="center">
        <template #default="{ row }">
          {{postStatus(row.top)}}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center">
        <template #default="{ row }">
          <el-button type="primary" size="small" :icon="View" @click="openCommentDetail(row)">查看</el-button>
          <el-button type="success" size="small" :icon="EditPen"
                     @click="openPostEditor(row)">编辑</el-button>
          <el-button type="danger" size="small" :icon="Delete"
                     @click="deleteTopic(row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="pagination">
      <el-pagination :total="topicTable.total"
                     v-model:current-page="topicTable.page"
                     v-model:page-size="topicTable.size"
                     layout="total, sizes, prev, pager, next, jumper"
                     @current-change="handlePageChange"
                     @size-change="handleSizeChange"/>
    </div>
    <el-drawer v-model="editor.display">
      <template #header>
        <div>
          <div style="font-weight: bold">
            <el-icon><EditPen/></el-icon> {{ editor.isDetail ? '查看帖子信息' : '编辑帖子信息' }}
          </div>
          <div style="font-size: 13px">{{ editor.isDetail ? '查看帖子详细信息' : '编辑完成后请点击下方保存按钮' }}</div>
        </div>
      </template>
      <el-form label-position="top" :disabled="editor.isDetail">
        <el-form-item label="标题">
          <el-input v-model="editor.temp.title"/>
        </el-form-item>
        <el-form-item label="内容">
          <el-input type="textarea" :rows="4" v-model="editor.temp.content"/>
        </el-form-item>
        <div style="display: flex;font-size: 14px;gap: 20px">
          <div>
            <span style="margin-right: 10px">置顶状态</span>
            <el-radio-group v-model="editor.temp.top">
              <el-radio :label="1">置顶</el-radio>
              <el-radio :label="0">非置顶</el-radio>
            </el-radio-group>
          </div>
        </div>
        <div style="margin-top: 10px;color: #606266;font-size: 14px">
          发布时间: {{ new Date(editor.temp.time).toLocaleString() }}
        </div>
        <el-divider/>
      </el-form>
      <template #footer>
        <div style="text-align: center">
          <el-button type="success" @click="savePostDetail" v-if="!editor.isDetail">保存</el-button>
          <el-button type="info" @click="editor.display = false">{{ editor.isDetail ? '关闭' : '取消' }}</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<style lang="less" scoped>
.post-admin{
  .title{
    font-weight: bold;
  }

  .desc{
    color: #bababa;
    font-size: 13px;
    margin-bottom: 20px;
  }

  .table-post-title {
    height: 30px;
    display: flex;
    align-items: center;
  }

  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: right;
  }

  :deep(.el-drawer__header) {
    margin-bottom: 0;
  }
}
</style>