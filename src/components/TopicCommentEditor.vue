<script setup>
import  "@vueup/vue-quill/dist/vue-quill.snow.css";
import {Delta, QuillEditor} from "@vueup/vue-quill";
import {ref} from "vue";
import {ElMessage} from "element-plus";
import {apiForumCommentSubmit} from "@/net/api/forum.js";

const props = defineProps({
  show: Boolean,
  tid: String,
  quote:Object,
  root: Number,
})
const content = ref()
const emit = defineEmits(['close','comment'])
const init = () => content.value = new Delta()
function submitComment(){
  if (deltaToText(content.value).length > 2000) {
    ElMessage.warning('评论字数超出最大限制，请缩减内容')
    return;
  }
  apiForumCommentSubmit({
    tid:props.tid,
    quote: props.quote ? props.quote?.user.id : -1,
    content:JSON.stringify(content.value),
    root: props.root
  },()=>{
    ElMessage.success('发表评论成功!')
    emit('comment')
  })
}

function deltaToSimpleText(delta){
  let str =deltaToText(JSON.parse(delta))
  if (str.length > 35)str = str.substring(0,35) + "..."
  return str
}

function deltaToText(delta) {
  if (!delta?.ops) return ""
  let str = ""
  for(let op of delta.ops)
    str += op.insert
  return str.replace(/\s/g,"")
}
</script>

<template>
  <div>
    <el-drawer :model-value="show" @close="emit('close')"
      :title="quote ? `发表对 ${quote?.user?.username} 评论` : '发表帖子回复'" @open="init"
      direction="btt" :size="270"
    :close-on-click-modal="false">
      <div>
        <div>
          <quill-editor style="height: 130px" v-model:content="content" placeholder="请发表友善的评论，不要使用脏话骂人"/>
        </div>
        <div style="margin-top: 10px;display: flex;">
          <div style="font-size: 13px; color: grey;flex: 1">
            当前字数 {{deltaToText(content).length}}（最大支持2000字）
          </div>
          <el-button type="success" @click="submitComment">发表评论</el-button>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<style lang="less" scoped>
:deep(.el-drawer){
  width: 800px;
  margin: 20px auto;
  border-radius: 10px;
}
:deep(.el-drawer__header){
  margin: 0;
}
:deep(.el-drawer__body){
  padding: 10px;
}
</style>