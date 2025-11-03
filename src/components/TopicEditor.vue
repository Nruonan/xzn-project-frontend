<script setup>
import {Document,Check} from '@element-plus/icons-vue'
import {computed, reactive, ref} from "vue";
import  "@vueup/vue-quill/dist/vue-quill.snow.css";
import ImageResize from "quill-image-resize-vue";
import {ImageExtend, QuillWatch} from "quill-image-super-solution-module";
import {Delta, Quill, QuillEditor} from "@vueup/vue-quill";
import axios from "axios";
import {accessHeader} from "../net/index.js";
import {ElMessage} from "element-plus";
import ColorDot from "./ColorDot.vue";
import {useStore} from '../store/index.js'
import {apiForumTopicCreate} from "@/net/api/forum.js";
const store = useStore()
Quill.register('modules/imageResize', ImageResize)
Quill.register('modules/ImageExtend',ImageExtend)

const props = defineProps({
  show: Boolean,
  defaultTitle: {
    default: '',
    type: String
  },
  defaultType: {
    default: null,
    type: Number
  },
  defaultText: {
    default: '',
    type: String
  },
  submitButton:{
    default: '立即发表主题',
    type: String
  },
  submit: {
    default:(editor, success)=>{
      apiForumTopicCreate({
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
        success()
      })
    },
    type: Function
  }
})
const emit = defineEmits(['close','success'])
const refEditor = ref()



const editor =reactive({
  type: null,
  title: '',
  text: '',
  status: 0,
  loading: false
})

function initEditor(){
  // 检查是否有暂存的内容
  const savedDraft = localStorage.getItem('topicDraft')
  if (savedDraft) {
    const draft = JSON.parse(savedDraft)
    editor.title = draft.title
    editor.type = findTypeById(draft.typeId.id)
    editor.text = new Delta(draft.content)
  } else if (props.defaultText){
    editor.type = findTypeById(props.defaultType)
    editor.title = props.defaultTitle
    editor.text = new Delta(JSON.parse(props.defaultText))
  }
  else{
    editor.type = ""
    editor.title = ""
    editor.text = ""
    refEditor.value.setContents('','user')
  }
}

function deltaToText(delta) {
  if (!delta.ops) return ""
  let str = ""
  for(let op of delta.ops)
    str += op.insert
  return str.replace(/\s/g,"")
}
// 提交成功后清除草稿
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
  if (status === 0) {
    const draft = {
      title: editor.title,
      typeId: editor.type ? editor.type : null,
      content: editor.text,
      timestamp: new Date().getTime()
    }
    localStorage.setItem('topicDraft', JSON.stringify(draft))
  }
  editor.status = status
  props.submit(editor,() => {
    // 提交成功后清除草稿
    localStorage.removeItem('topicDraft')
    emit('success')
  })
}
const contentLength = computed(() => deltaToText(editor.text).length)

function findTypeById(id){
  for (let type of store.forum.types){
    if (type.id === id){
      return type
    }
  }
}

// get('/api/forum/types',data=>store.forum.types=data)
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
</script>

<template>
  <el-drawer @open="initEditor" :model-value="show" direction="btt" :size="700" :close-on-click-modal="false" @close="emit('close')">
    <template #header>
      <div>
        <div style="font-weight: bold">发表新的帖子</div>
        <div style="font-size: 13px;color: grey;margin-top: 3px">发表内容之前，请遵守相关法律法规，不要出现粗口色情等不文明行为</div>
      </div>
    </template>
    <div style="display: flex; gap: 10px">
      <div style="width: 150px;" >
        <el-select :teleported="false"  v-model="editor.type" value-key="id" :disabled="!store.forum.types.length" placeholder="请选择主题类型...">
          <el-option  :key="item.id" :label="item.name"  v-for="item in store.forum.types.filter(type => type.id > 1 && type.id < 9)" :value="item">
            <div>
              <color-dot :color="item.color"/>
              <span style="margin-left: 8px">{{item.name}}</span>
            </div>
          </el-option>
        </el-select>
      </div>
      <div style="flex: 1 ">
        <el-input v-model="editor.title" placeholder="请输入帖子标题" :prefix-icon="Document" style="height: 100%; width: 590px" maxlength="30"/>
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
        <!-- 添加暂存按钮 -->
        <el-button @click="submitTopic(0)" style="margin-right: 10px;">暂存</el-button>
        <el-button type="success" :icon="Check" @click="submitTopic(1)">{{submitButton}}</el-button>
      </div>
    </div>
  </el-drawer>
</template>

<style scoped>
:deep(.el-drawer){
  width: 500px;
  margin: auto;
  border-radius: 10px 10px 0 0;
}
:deep(.el-drawer__header){
  margin: 0;
}

:deep(.el-popper.is-light){
  background:  var(--el-border-color-extra-light) ;
}

:deep(.el-select-dropdown__item.hover){
  background: transparent ;
  border: none ;
}


:deep(.el-select-dropdown__item){
  background: transparent ;
  border: none ;
  color: grey;

  &:hover{
    opacity: 0.7;
  }
}

:deep(.el-popper.is-light .el-popper__arrow::before) {
  background: var(--el-border-color-extra-light) ;
  right: 0;
}
</style>