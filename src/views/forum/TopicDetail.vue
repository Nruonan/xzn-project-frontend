<script setup>
import {useRoute} from "vue-router";
import {get} from "@/net/index.js";
import {reactive, ref} from "vue";
import {
  Male,
  Female,
  ArrowLeft,
  CircleCheck,
  Star,
  EditPen,Delete,
  Plus,
  ChatDotSquare
} from '@element-plus/icons-vue'
import {QuillDeltaToHtmlConverter} from 'quill-delta-to-html'
import Card from "../../components/Card.vue";
import router from "../../router/index.js";
import TopicTag from "../../components/TopicTag.vue";
import InteractButton from "../../components/InteractButton.vue";
import {ElMessage, ElMessageBox} from "element-plus";
import {useStore} from "../../store/index.js";
import TopicEditor from "../../components/TopicEditor.vue";
import TopicCommentEditor from "../../components/TopicCommentEditor.vue";
import {
  apiAccountFollow,
  apiForumCommentDelete,
  apiForumComments,
  apiForumInteract,
  apiForumTopic,
  apiForumUpdateTopic
} from "@/net/api/forum.js";
const route = useRoute()
const tid = route.params.tid
const store = useStore()
const topic = reactive({
  data: null,
  like: false,
  collect: false,
  comments: null,
  page: 1,
})

const edit = ref(false)
const follow =ref(false)
const comment = reactive({
  show: false,
  text: '',
  quote:-1,
  root: -1,
})
const showAllComments = reactive({});

const showAll = (item) => {
  showAllComments[item.id] = true;
};

const isShowAll = (item) => {
  return showAllComments[item.id] || false;
};
const init = () => apiForumTopic(tid,data=>{
  topic.data = data
  topic.like = data.interact.like
  topic.collect = data.interact.collect
  loadComments(1)
})
init()

function convertToHtml(content){
  const ops = JSON.parse(content).ops
  const converter = new QuillDeltaToHtmlConverter(ops, { inlineStyles: true});
  return converter.convert()
}

function interact(type,message){
  apiForumInteract(tid,type,topic,message)
}

function updateTopic(editor){
  apiForumUpdateTopic({
    id:tid,
    type: editor.type.id,
    title: editor.title,
    content: editor.text
  },() => {
    ElMessage.success('帖子内容更新成功!')
    edit.value = false
    init()
  })
}

function loadComments(page){
  topic.comments = null
  topic.page = page
  apiForumComments(tid,page - 1, (data) => topic.comments = data)
}

function deleteComments(id){
  ElMessageBox.confirm(
      '此操作将永久删除这条评论, 是否继续?',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
  ).then(() => {
    apiForumCommentDelete(id,() =>{
      ElMessage.success('删除成功');
      loadComments(1)
    })
  }).catch(() => {
    ElMessage.info('已取消删除');
  });
}
function Follow(id){
  apiAccountFollow(id)
}
function onCommentAdd(){
  comment.show = false
  loadComments(1)
}
</script>

<template>
  <div class="topic-page" v-if="topic.data">
    <div class="topic-main" style="position: sticky; top:0;z-index: 10">
        <card style="display: flex;width: 100%">
            <el-button @click="router.push('/index')" :icon="ArrowLeft" type="info" size="small" plain round>返回列表</el-button>
            <div style="text-align: center;flex: 1" >
              <topic-tag style="transform: translateY(-2px)" :type="topic.data.type"></topic-tag>
              <span style="font-weight: bold;margin-left: 5px; ">{{topic.data.title}}</span>
            </div>
        </card>
    </div>
    <div class="topic-main">
      <div class="topic-main-left" >
        <el-popover
            placement="left"
            :width="250"
            :show-arrow = false
            style="border-radius: 10px"
            popper-style="background-color:var(--el-popover-border-color);box-shadow: rgb(14 18 22 / 35%) 0px 10px 38px -10px, rgb(14 18 22 / 20%) 0px 10px 20px -15px; padding: 20px;"
        >
          <template #reference>
          <el-avatar style="cursor: pointer" @click="router.push(`/index/user-detail/${topic.data.user.id}`)" fit="fill" shape="square" :size="100" :src="store.avatarUserUrl(topic.data.user.avatar)"/>
          </template>
          <template #default>
            <div style="display: flex; position: relative;">
              <!-- 用户信息 -->
              <div style="flex: 1; margin-left: 6px">
                <el-avatar @click="router.push(`/index/user-detail/${topic.data.user.id}`)" style="cursor: pointer" fit="fill" shape="square" :size="60" :src="store.avatarUserUrl(topic.data.user.avatar)"/>
                <span style="margin-left: 15px; font-weight: bold; font-size: 22px">{{ topic.data.user.username }}</span>
                <span style="color: hotpink" v-if="topic.data.user.gender === 1">
                  <el-icon><Female/></el-icon>
                </span>
                <span style="color: dodgerblue" v-if="topic.data.user.gender === 0">
                  <el-icon><Male/></el-icon>
                </span>
              </div>
              <!-- 右上角按钮 -->
              <el-button type="primary" @click=Follow(topic.data.user.id) v-if="topic.data.user.id !== store.user.id" style="position: absolute; top: 0; right: 0; padding: 5px 10px;">
                {{store.findFollowById(topic.data.user.id) ? '已关注' : '关注'}}
              </el-button>
            </div>
            <!-- 联系方式 -->
            <div style="text-align: left; margin-top: 0;">
                <div class="desc">微信: {{ topic.data.user.wx || '已隐藏或未填写' }}</div>
                <div class="desc">QQ: {{ topic.data.user.qq || '已隐藏或未填写' }}</div>
                <div class="desc">邮箱: {{ topic.data.user.email || '已隐藏或未填写' }}</div>
                <div class="desc">手机号: {{ topic.data.user.phone || '已隐藏或未填写' }}</div>
            </div>
          </template>
        </el-popover>
          <div style="margin-top:10px;font-size: 16px; font-weight: bold">
            {{topic.data.user.username}}
            <span style="color: hotpink" v-if="topic.data.user.gender === 1">
                            <el-icon><Female/></el-icon>
            </span>
            <span style="color: dodgerblue" v-if="topic.data.user.gender === 0">
                            <el-icon><Male/></el-icon>
            </span>
          </div>
          <el-divider style="margin: 10px 0"/>
          <div style="margin-top: 5px;font-size: 14px; color: grey; text-align: left">
            <div class="desc">{{topic.data.user.desc}}</div>
          </div>
      </div>
      <div class="topic-main-right" >
        <div class="topic-content" v-html="convertToHtml(topic.data.content)"></div>
        <div style="text-align: right;margin-top: 50px;">
          <el-divider />
          <div style="font-size: 13px;color: grey;text-align: center">
            <div>发帖时间: {{new Date(topic.data.time).toLocaleString()}}</div>
          </div>
          <div style="text-align: right;margin-top: 20px">
            <interact-button name="编辑帖子" color="dodgerblue" :check="false"
                             @check="edit = true" style="margin-right: 20px" v-if="store.user.id === topic.data.user.id">
              <el-icon><EditPen/></el-icon>
            </interact-button>
            <interact-button name="点个赞吧" check-name="已点赞" color="pink" :check="topic.like"
                             @check="interact('like', '点赞')">
              <el-icon><CircleCheck/></el-icon>
            </interact-button>
            <interact-button name="收藏本帖" check-name="已收藏" color="orange" :check="topic.collect"
                             @check="interact('collect', '收藏')"
                             style="margin-left: 20px">
              <el-icon><Star/></el-icon>
            </interact-button>
          </div>
        </div>
      </div>
    </div>
    <transition name="el-fade-in-linear" mode="out-in" >
      <div v-if="topic.comments">
        <div class="topic-main" style="margin-top: 10px" v-for="item in topic.comments">
          <div class="topic-main-left">
            <el-popover
                placement="left"
                :width="250"
                :show-arrow = false
                style="border-radius: 10px"
                popper-style="background-color:var(--el-popover-border-color);box-shadow: rgb(14 18 22 / 35%) 0px 10px 38px -10px, rgb(14 18 22 / 20%) 0px 10px 20px -15px; padding: 20px;"
            >
              <template #reference>
                <el-avatar @click="router.push(`/index/user-detail/${item.user.id}`)"  style="cursor: pointer" fit="fill" shape="square" :size="100" :src="store.avatarUserUrl(item.user.avatar)"/>
              </template>
              <template #default>
                <div style="flex: 1; position: relative">
                  <div style="flex: 1;margin-left: 6px;">
                    <el-avatar @click="router.push(`/index/user-detail/${item.user.id}`)"  style="cursor: pointer"  fit="fill" shape="square" :size="60" :src="store.avatarUserUrl(item.user.avatar)"/>
                    <span style="margin-left: 15px;font-weight: bold;font-size: 22px">{{item.user.username}}</span>
                    <span style="color: hotpink" v-if="item.user.gender === 1">
                            <el-icon><Female/></el-icon>
                  </span>
                    <span style="color: dodgerblue" v-if="item.user.gender === 0">
                            <el-icon><Male/></el-icon>
                  </span>
                  </div>
                  <!-- 右上角按钮 -->
                  <el-button type="primary" @click=Follow(item.user.id) v-if="item.user.id !== store.user.id" style="position: absolute; top: 0; right: 0; padding: 5px 10px;">
                    {{store.findFollowById(item.user.id) ? '已关注' : '关注'}}
                  </el-button>
                </div>
                <div style="text-align: left;margin-top: 0;">
                  <div class="desc">微信: {{item.user.wx || '已隐藏或未填写'}}</div>
                  <div class="desc">QQ: {{item.user.qq || '已隐藏或未填写'}}</div>
                  <div class="desc">邮箱: {{item.user.email || '已隐藏或未填写'}}</div>
                  <div class="desc">手机号: {{item.user.phone || '已隐藏或未填写'}}</div>
                </div>
              </template>
            </el-popover>
            <div style="margin-top:10px;font-size: 16px; font-weight: bold">
              {{item.user.username}}
              <span style="color: hotpink" v-if="item.user.gender === 1">
                            <el-icon><Female/></el-icon>
            </span>
              <span style="color: dodgerblue" v-if="item.user.gender === 0">
                            <el-icon><Male/></el-icon>
            </span>
            </div>
            <el-divider style="margin: 10px 0"/>
            <div style="margin-top: 5px;font-size: 14px; color: grey; text-align: left">
              <div class="desc">{{item.user.desc}}</div>
            </div>
          </div>
          <div class="topic-main-right" >
            <div class="topic-content" v-html="convertToHtml(item.content)"></div>
            <div style="margin-top: 50px;display: flex; justify-content: flex-end">
              <div style="font-size: 13px;color: grey; margin-right: 10px" >
                <div style="transform: translateY(3px)">评论时间: {{new Date(item.time).toLocaleString()}}</div>
              </div>
              <div style="text-align: right;">
                <el-link :icon="ChatDotSquare" @click="comment.show = true; comment.quote = item; comment.root = item.root === item.quote ? item.id : item.root"
                          type="info">&nbsp;回复</el-link>
                <el-link :icon="Delete" style="margin-left: 15px" v-if="item.user.id === store.user.id" @click="deleteComments(item.id)"
                         type="danger">&nbsp;删除</el-link>
              </div>
            </div>
            <card style="margin-top: 5px;background-color: rgba(0,10,60, 0.05);" v-if="item.children.length != 0">
                   <div v-for="it in isShowAll(item) ? item.children : item.children.slice(0,3)">
                     <div style="display: flex; margin-top: 15px">
                       <el-popover
                           placement="left"
                           :width="250"
                           :show-arrow = false
                           style="border-radius: 10px"
                           popper-style="background-color:var(--el-popover-border-color);box-shadow: rgb(14 18 22 / 35%) 0px 10px 38px -10px, rgb(14 18 22 / 20%) 0px 10px 20px -15px; padding: 20px;"
                       >
                         <template #reference>
                           <el-avatar @click="router.push(`/index/user-detail/${it.user.id}`)" style="cursor: pointer;"  fit="fill" shape="square" :size="30" :src="store.avatarUserUrl(it.user.avatar)"></el-avatar>
                         </template>
                         <template #default>
                           <div style="display: flex; position: relative">
                             <div style="flex: 1;margin-left: 6px">
                               <el-avatar @click="router.push(`/index/user-detail/${it.user.id}`)" style="cursor: pointer;" fit="fill" shape="square" :size="60" :src="store.avatarUserUrl(it.user.avatar)"></el-avatar>
                               <span style="margin-left: 15px;font-weight: bold;font-size: 22px">{{it.user.username}}</span>
                               <span style="color: hotpink" v-if="it.user.gender === 1">
                                  <el-icon><Female/></el-icon></span>
                               <span style="color: dodgerblue" v-if="it.user.gender === 0">
                                  <el-icon><Male/></el-icon></span>
                             </div>
                             <!-- 右上角按钮 -->
                             <el-button type="primary" @click=Follow(it.user.id) v-if="it.user.id !== store.user.id" style="position: absolute; top: 0; right: 0; padding: 5px 10px;">
                               {{store.findFollowById(it.user.id) ? '已关注' : '关注'}}
                             </el-button>
                           </div>
                           <div style="text-align: left;margin-top: 0;">
                             <div class="desc">微信: {{it.user.wx || '已隐藏或未填写'}}</div>
                             <div class="desc">QQ: {{it.user.qq || '已隐藏或未填写'}}</div>
                             <div class="desc">邮箱: {{it.user.email || '已隐藏或未填写'}}</div>
                             <div class="desc">手机号: {{it.user.phone || '已隐藏或未填写'}}</div>
                           </div>
                         </template>
                       </el-popover>
                       <div style="margin-left: 5px;      opacity: 0.8;">
                         <span style="cursor: pointer;font-size: 13px;color: grey;">
                           {{it.user.username}}
                         </span>
                         <span style="font-size: 14px;" v-if="it.user.id.toString() !== it.quote.toString()">
                           &nbsp;对&nbsp;
                         </span>
                         <span style="cursor: pointer;font-size: 13px;color: grey" v-if="it.user.id.toString() !== it.quote.toString()">
                           {{it.quoteName}}
                         </span>
                         <span style="font-size: 14px;">
                           &nbsp;评论道 &nbsp;
                         </span>
                         <div style="font-size: 13px; margin-top: 2px" v-html="convertToHtml(it.content)"></div>
                       </div>
                     </div>
                     <div style="display: flex; justify-content: flex-end">
                       <div style="font-size: 12px;color:grey; text-align: right;transform: translateY(3px); margin-right: 10px">评论时间:{{new Date(it.time).toLocaleString()}}</div>
                       <div style="text-align: right;">
                         <el-link :icon="ChatDotSquare" @click="comment.show = true; comment.quote = it; comment.root = it.root"
                                  type="info">&nbsp;回复</el-link>
                         <el-link :icon="Delete" style="margin-left: 15px" v-if="it.user.id === store.user.id" @click="deleteComments(it.id)"
                                  type="danger">&nbsp;删除</el-link>
                       </div>
                     </div>
                   </div>
              <el-link v-if="!isShowAll(item)&&item.children.length > 3"  @click="showAll(item)" style="text-align: left;color: #561d8a">查看更多</el-link>
            </card>

          </div>
        </div>
        <div style="width: fit-content;margin: 20px auto">
          <el-pagination background layout="=prev,pager,next"
                         v-model:current-page="topic.page" @current-change="loadComments"
                        :total="topic.data.comments" :page-size="10"  hide-on-single-page></el-pagination>
        </div>
      </div>
    </transition>
    <topic-editor :show="edit" @close="edit = false" v-if="topic.data"
                  :default-type="topic.data.type" :default-text="topic.data.content"
                  :default-title="topic.data.title" submit-button="更新帖子内容" :submit="updateTopic"/>
    <topic-comment-editor :show="comment.show" @close="comment.show = false" @comment="onCommentAdd"
                          :tid="tid" :quote="comment.quote" :root="comment.root"></topic-comment-editor>
    <div class="add-comment" @click="comment.show = true;comment.quote = null;comment.root = -1" >
      <el-icon><Plus/></el-icon>
    </div>
    <div>
    </div>
  </div>
</template>

<style scoped lang="less">
.add-comment{
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 18px;
  text-align: center;
  line-height: 45px;
  color: var(--el-color-primary);
  box-shadow: var(--el-box-shadow-light);
  background-color: var(--el-button-bg-color);

    &:hover{
      cursor: pointer;
      background-color: var(--el-border-color);
    }
}


.topic-page{
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px 0;
}
.topic-main{
  display: flex;
  border-radius: 7px;
  margin: 0 auto;
  background-color: var(--el-bg-color);
  width: 900px;

  .topic-main-left {
    width: 200px;
    padding: 10px;
    text-align: center;
    border-right: solid 1px var(--el-border-color);

    .desc {
      font-size: 13px;
      color: grey;
    }
  }

  .topic-main-right {
    width: 700px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    .topic-content{
      font-size: 14px;
      line-height: 22px;
      opacity: 0.8;
      flex:1
    }
  }
}

</style>