<script setup>
import {EditPen, Document, Delete,View, Search} from "@element-plus/icons-vue";
import { apiTopicDetail, apiTopicUpdate, apiTopicList,apiTopicRemove,apiForumTypes} from "@/net/api/forum.js";
import {computed, onMounted, reactive, watchEffect} from "vue";
import {ElMessage, ElMessageBox} from "element-plus";
import {QuillDeltaToHtmlConverter} from "quill-delta-to-html";
import {useStore} from '@/store/index.js'

const store = useStore()
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
  searchType: '', // 添加搜索类型字段
  isSearching: false // 添加搜索状态标识
})

// 过滤掉ID为1和2的帖子类型
const filteredTypes = computed(() => {
  return store.forum.types.filter(item => item.id !== 1 && item.id !== 2)
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
  for(let item of store.forum.types){
    if(item.id === type)
      return item.name
  }
  return '未知类型'
}

// 加载所有帖子列表（默认情况）
function loadTopicList() {
  topicTable.isSearching = false
  apiTopicList(topicTable.page, topicTable.size,'','',  data => {
    topicTable.total = data.total
    topicTable.data = data.list
  })
}

// 搜索功能
function searchTopics() {
  topicTable.isSearching = true
  topicTable.page = 1 // 搜索时重置到第一页
  // 构造搜索参数
  const searchParams = {
    title: topicTable.searchTitle,
    type: topicTable.searchType
  }
  console.log(topicTable.searchType);
  // 调用API进行搜索，同时传递标题和类型参数
  apiTopicList(topicTable.page, topicTable.size, topicTable.searchTitle, topicTable.searchType, data => {
    topicTable.total = data.total
    topicTable.data = data.list
  })
}

// 重置搜索
function resetSearch() {
  topicTable.searchTitle = ''
  topicTable.searchType = ''
  topicTable.isSearching = false
  topicTable.page = 1
  loadTopicList()
}

// 处理分页变化
function handlePageChange(page) {
  topicTable.page = page
  if (topicTable.isSearching) {
    searchTopics() // 如果正在搜索，则重新执行搜索
  } else {
    loadTopicList() // 否则加载常规列表
  }
}

// 处理每页大小变化
function handleSizeChange(size) {
  topicTable.size = size
  topicTable.page = 1 // 重置到第一页
  if (topicTable.isSearching) {
    searchTopics()
  } else {
    loadTopicList()
  }
}

// 默认加载所有数据
onMounted(() => {
  loadTopicList()
  apiForumTypes()
})
</script>

<template>
  <div class="post-admin" style="padding: 10px 20px">
    <el-card>
      <template #header>
        <div class="card-header">
          <el-icon><Document /></el-icon>
          论坛帖子管理
        </div>
      </template>
      
      <div class="desc">
        在这里管理论坛的所有帖子内容
      </div>
      
      <!-- 操作区域 -->
      <div style="display: flex; justify-content: space-between; margin-bottom: 15px">
        <div></div>
        <div style="display: flex; gap: 10px; flex-wrap: wrap">
          <el-input
              v-model="topicTable.searchTitle"
              placeholder="请输入帖子标题进行搜索"
              clearable
              style="width: 200px"
              @keyup.enter="searchTopics"
          />
          <el-select
              v-model="topicTable.searchType"
              placeholder="请选择帖子类型"
              clearable
              style="width: 150px"
          >
            <el-option
                v-for="item in filteredTypes"
                :key="item.id"
                :label="item.name"
                :value="item.id"
            />
          </el-select>
          <el-button type="primary" :icon="Search" @click="searchTopics">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </div>
      </div>
      
      <!-- 表格区域 -->
      <el-table :data="topicTable.data" style="width: 100%" border>
        <el-table-column prop="id" label="帖子编号" min-width="120" />
          <el-table-column prop="title" label="帖子标题" min-width="150" >
            <template #default="{ row }">
              <div class="table-post-title">
                {{ row.title.length > 20 ? row.title.substring(0, 20) + '...' : row.title }}
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="content" label="帖子内容" min-width="450" >
            <template #default="{ row }">
              <div class="table-post-title">
                {{ row.content.length > 50 ? row.content.substring(0, 50) + '...' : row.content }}
              </div>
            </template>
          </el-table-column>
          <el-table-column  label="帖子类型" min-width="80" >
            <template #default="{ row }">
              {{ convertType(row.type) }}
            </template>
          </el-table-column>
          <el-table-column prop="uid" label="用户编号" min-width="80" />
          <el-table-column label="发帖时间" min-width="200">
            <template #default="{ row }">
              {{ new Date(row.time).toLocaleString() }}
            </template>
          </el-table-column>
          <el-table-column label="操作" min-width="250" align="center">
          <template #default="{ row }">
            <el-button-group>
              <el-button type="primary" size="small" :icon="View" @click="openCommentDetail(row)">查看</el-button>
              <el-button type="success" size="small" :icon="EditPen" @click="openPostEditor(row)">编辑</el-button>
              <el-button type="danger" size="small" :icon="Delete" @click="deleteTopic(row.id)">删除</el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页组件 -->
      <div style="margin-top: 20px; display: flex; justify-content: center">
        <el-pagination
            :total="topicTable.total"
            v-model:current-page="topicTable.page"
            v-model:page-size="topicTable.size"
            layout="total, sizes, prev, pager, next, jumper"
            @current-change="handlePageChange"
            @size-change="handleSizeChange"
        />
      </div>
    </el-card>

    <!-- 编辑对话框 -->
    <el-dialog 
      v-model="editor.display" 
      :title="editor.isDetail ? '帖子详情' : '编辑帖子'" 
      width="500px"
      draggable
    >
      <el-form label-position="top" :disabled="editor.isDetail">
        <el-form-item label="帖子编号">
          <el-input v-model="editor.temp.id" disabled />
        </el-form-item>
        <el-form-item label="帖子标题">
          <el-input
              v-model="editor.temp.title"
              :disabled="editor.isDetail"
              placeholder="请输入帖子标题"
          />
        </el-form-item>
        <el-form-item label="帖子内容">
          <el-input
              v-model="editor.temp.content"
              type="textarea"
              :rows="6"
              :disabled="editor.isDetail"
              placeholder="请输入帖子内容"
          />
        </el-form-item>
        <el-form-item label="发帖人">
          <el-input
              v-model="editor.temp.uid"
              :disabled="editor.isDetail"
              placeholder="请输入发帖人"
          />
        </el-form-item>
        <el-form-item label="发帖时间">
          <el-date-picker
              v-model="editor.temp.time"
              type="datetime"
              placeholder="选择日期时间"
              style="width: 100%"
              value-format="YYYY-MM-DD HH:mm:ss"
              :disabled="editor.isDetail"
          />
        </el-form-item>
        <el-form-item label="置顶状态" v-if="!editor.isDetail">
          <el-radio-group v-model="editor.temp.top">
            <el-radio :label="1">置顶</el-radio>
            <el-radio :label="0">非置顶</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="info" @click="editor.display = false">{{ editor.isDetail ? '关闭' : '取消' }}</el-button>
          <el-button type="success" @click="savePostDetail" v-if="!editor.isDetail">保存</el-button>
        </span>
      </template>
    </el-dialog>
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