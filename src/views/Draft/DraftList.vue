<script setup>
import {ref, onMounted, reactive, computed} from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  apiForumDraftDelete,
  apiForumDrafts,
  apiForumTopicCreate, apiForumUpdateTopic,
  apiTopicUpdate
} from "@/net/api/forum.js";
import {Delta} from "@vueup/vue-quill";
import "@vueup/vue-quill/dist/vue-quill.snow.css";
import ImageResize from "quill-image-resize-vue";
import {ImageExtend, QuillWatch} from "quill-image-super-solution-module";
import {Quill, QuillEditor} from "@vueup/vue-quill";
import axios from "axios";
import {accessHeader} from "@/net/index.js";
import {useStore} from '@/store/index.js'

const store = useStore()
Quill.register('modules/imageResize', ImageResize)
Quill.register('modules/ImageExtend',ImageExtend)

// 草稿数据
const drafts = ref([])
const pagination = reactive({
  page: 1,
  size: 10,
  total: 0,
  loading: false
})

// 添加编辑器显示状态
const editor = reactive({
  show: false,
  type: null,
  title: '',
  text: '',
  uploading: false,
  loading: false,
  draftId: null
})

const refEditor = ref()

// 加载草稿（分页）
function loadDrafts() {
  pagination.loading = true
  apiForumDrafts(pagination.page, pagination.size, data => {
    drafts.value = data.records
    pagination.total = data.total
    pagination.loading = false
  })
}

// 处理分页变化
function handlePageChange(page) {
  pagination.page = page
  loadDrafts()
}

// 处理页面大小变化
function handleSizeChange(size) {
  pagination.size = size
  pagination.page = 1
  loadDrafts()
}

// 删除草稿
function deleteDraft(id, index) {
  ElMessageBox.confirm('确定要删除这个草稿吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    apiForumDraftDelete(id, () => {
      // 重新加载当前页草稿列表
      loadDrafts()
      ElMessage.success('草稿已删除')
    }).catch(() => {
      ElMessage.error('删除草稿失败')
    })
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

// 格式化时间
function formatTime(timestamp) {
  const date = new Date(timestamp)
  return date.toLocaleString()
}

// 修改继续编辑草稿函数
function editDraft(draft) {
  // 设置编辑器显示和草稿数据
  editor.show = true
  editor.title = draft.title || ''
  editor.type = findTypeById(draft.type)
  editor.draftId = draft.id

  // 解析内容
  if (draft.content) {
    try {
      editor.text = new Delta(JSON.parse(draft.content))
    } catch (e) {
      editor.text = ''
    }
  } else {
    editor.text = ''
  }
}

// 处理编辑器关闭
function handleEditorClose() {
  editor.show = false
  editor.title = ''
  editor.type = null
  editor.text = ''
  editor.draftId = null
}

// 处理编辑成功
function handleEditorSuccess() {
  // 关闭编辑器
  handleEditorClose()
  // 重新加载草稿列表
  loadDrafts()
}

function deltaToText(delta) {
  if (!delta.ops) return ""
  let str = ""
  for(let op of delta.ops)
    str += op.insert
  return str.replace(/\s/g,"")
}

const contentLength = computed(() => deltaToText(editor.text).length)

function findTypeById(id){
  if (!id) return null
  for (let type of store.forum.types){
    if (type.id === id){
      return type
    }
  }
  return null
}

function initEditor(){
  if (editor.text && typeof editor.text === 'object') {
    refEditor.value.setContents(editor.text, 'user')
  } else {
    refEditor.value.setContents('', 'user')
  }
}

function submitTopic(status){
  const text = deltaToText(editor.text)
  if (text.length > 20000){
    ElMessage.warning("字数超出限制，无法发布主题！");
    return;
  }
  if (text.length === 0){
    ElMessage.warning("请输入内容！");
    return;
  }
  if (!editor.title){
    ElMessage.warning("请填写标题！");
    return;
  }
  if (!editor.type){
    ElMessage.warning("请选择一个合适的帖子类型！");
    return;
  }
  editor.status = status
  apiForumUpdateTopic({
    id: editor.draftId,
    type: editor.type.id,
    title: editor.title,
    content: editor.text,
    status: editor.status
  },()=>{
    if (editor.status === 0) {
      ElMessage.success('草稿已保存，请去草稿箱查看')
    } else {
      ElMessage.success('帖子发表成功！')
    }
    handleEditorSuccess();
  })
}

const editorOption = {
  modules: {
    toolbar: {
      container: [
        "bold", "italic", "underline", "strike","clean",
        {color: []}, {'background': []},
        {size: ["small", false, "large", "huge"]},
        { header: [1, 2, 3, 4, 5, 6, false] },
        {list: "ordered"}, {list: "bullet"}, {align: []},
        "blockquote", "code-block", "link", "image",
        { indent: '-1' }, { indent: '+1' }
      ],handler:{
        'image': function (){
          QuillWatch.emit(this.quill.id)
        }
      }
    },
    imageResize: {
      modules: ['Resize','DisplaySize']
    },
    ImageExtend: {
      action:  axios.defaults.baseURL + '/api/image/cache',
      name: 'file',
      size: 5,
      loading: true,
      accept: 'image/png, image/jpeg',
      response: (resp) => {
        if(resp.data) {
          return axios.defaults.baseURL + '/images' + resp.data
        } else {
          return null
        }
      },
      methods: 'POST',
      headers: xhr => {
        xhr.setRequestHeader('Authorization', accessHeader().Authorization);
      },
      start: () => editor.uploading = true,
      success: () => {
        ElMessage.success('图片上传成功!')
        editor.uploading = false
      },
      error: () => {
        ElMessage.warning('图片上传失败，请联系管理员!')
        editor.uploading = false
      }
    }
  }
}

onMounted(() => {
  loadDrafts()
})
</script>


<template>
  <div style="display: flex; margin: 50px auto; gap: 20px; max-width: 1300px;">
    <div style="flex: 1">
      <light-card style="padding: 20px; border-radius: 10px;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div style="font-size: 24px; font-weight: bold; color: #303133;">
            <el-icon style="margin-right: 10px;"><Document /></el-icon>
            草稿箱
          </div>
        </div>
      </light-card>

      <light-card style="margin-top: 15px; border-radius: 10px">
        <div style="height: 500px; overflow: hidden;">
          <el-table
              :data="drafts"
              border
              style="width: 100%; height: 100%"
              v-loading="pagination.loading"
              element-loading-text="加载中..."
              empty-text=" "
          >
            <el-table-column prop="title" label="标题" width="200">
              <template #default="scope">
                {{ scope.row.title || '未命名草稿' }}
              </template>
            </el-table-column>
            <el-table-column prop="timestamp" label="保存时间" width="200">
              <template #default="scope">
                {{ formatTime(scope.row.time) }}
              </template>
            </el-table-column>
            <el-table-column prop="content" label="内容预览" min-width="300">
              <template #default="scope">
                {{ scope.row.content && scope.row.content.length > 0 ?
                  scope.row.content.substring(0, 100) + '...' :
                  '暂无内容预览' }}
              </template>
            </el-table-column>
            <el-table-column fixed="right" label="操作" width="200">
              <template #default="scope">
                <el-button
                    size="small"
                    :icon="Edit"
                    type="primary"
                    @click="editDraft(scope.row)"
                >
                  继续编辑
                </el-button>
                <el-button
                    size="small"
                    :icon="Delete"
                    type="danger"
                    @click="deleteDraft(scope.row.id, scope.$index)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 空状态显示 -->
          <div v-if="!pagination.loading && drafts.length === 0" style="text-align: center; padding: 40px 0; color: #999;">
            <el-icon style="font-size: 48px; margin-bottom: 15px;"><Document /></el-icon>
            <div>暂无草稿</div>
            <div style="margin-top: 10px; font-size: 14px;">您可以将未完成的帖子保存为草稿，稍后继续编辑</div>
          </div>
        </div>

        <!-- 分页组件 -->
        <div v-if="drafts.length > 0" style="margin: 30px auto; display: flex; justify-content: center;">
          <el-pagination
              background
              layout="total, sizes, prev, pager, next, jumper"
              v-model:current-page="pagination.page"
              v-model:page-size="pagination.size"
              :total="pagination.total"
              @current-change="handlePageChange"
              @size-change="handleSizeChange"
              :page-sizes="[5, 10, 20, 50]"
          />
        </div>
      </light-card>
    </div>
  </div>

  <!-- 内嵌的编辑器 -->
  <el-drawer @open="initEditor" :model-value="editor.show" direction="btt" :size="700" :close-on-click-modal="false" @close="handleEditorClose">
    <template #header>
      <div>
        <div style="font-weight: bold">编辑草稿</div>
        <div style="font-size: 13px;color: grey;margin-top: 3px">编辑草稿内容</div>
      </div>
    </template>
    <div style="display: flex; gap: 10px">
      <div style="width: 150px;" >
        <el-select :teleported="false"  v-model="editor.type" value-key="id" :disabled="!store.forum.types.length" placeholder="请选择主题类型...">
          <el-option  :key="item.id" :label="item.name"  v-for="item in store.forum.types.filter(type => type.id > 0 && type.id < 6)" :value="item">
            <div>
              <color-dot :color="item.color"/>
              <span style="margin-left: 8px">{{item.name}}</span>
            </div>
          </el-option>
        </el-select>
      </div>
      <div style="flex: 1 ">
        <el-input v-model="editor.title" placeholder="请输入帖子标题" style="height: 100%; width: 590px" maxlength="30"/>
      </div>
    </div>
    <div style="margin-top: 10px;font-size: 13px;color: grey">
      <color-dot :color="editor.type ? editor.type.color : '#dedede'"/>
      <span style="margin-left: 5px">{{editor.type ? editor.type.desc : '请在上方选择一个帖子类型'}}</span>
    </div>
    <div style="margin-top: 10px; height: 440px;overflow: hidden; border-radius: 5px"
         v-loading="editor.uploading"  element-loading-text="正在上传图片,请稍后..." >
      <quill-editor ref="refEditor" v-model:content="editor.text" style="height: calc(100% - 45px)" placeholder="今天想分享什么呢？"
                    content-type="delta" :options="editorOption"/>
    </div>
    <div style="display: flex; margin-top: 5px; justify-content: space-between">
      <div style="font-size: 13px; color: grey">
        当前字数 {{contentLength}}（最大支持20000字）
      </div>
      <div>
        <el-button @click="handleEditorClose">取消</el-button>
        <el-button @click="submitTopic(0)">暂存</el-button>
        <el-button type="success" @click="submitTopic(1)">发布</el-button>
      </div>
    </div>
  </el-drawer>
</template>