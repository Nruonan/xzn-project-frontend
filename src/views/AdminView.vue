<script setup>
import {
  Bell,
  ChatDotSquare, Collection, DataLine, Document, Files,
  House, Location,
  Lock, Money,
  Monitor,
  Notification,
  Operation, Position, ToiletPaper,
  User
} from "@element-plus/icons-vue";
import UserInfo from "@/components/UserInfo.vue";
import {get} from "@/net/index.js";
import {useStore} from "@/store/index.js";
import {ref} from "vue";

const loading = ref(true)
const store = useStore()
const adminMenu = [
  {
    title: '校园论坛管理', icon: Location, sub:[
      {title: '用户管理', icon: User},
      {title: '帖子广场管理', icon: ChatDotSquare},
      {title: '神券抢购管理', icon: Money},
      {title: '校园活动管理', icon: Notification},
      {title: '失物招领管理', icon: Bell},
      {title: '放松一刻管理', icon: ToiletPaper},
    ]
  },{
    title: '探索与发现管理', icon: Position, sub:[
      {title: '成绩查询管理', icon: Document},
      {title: '班级课程表管理', icon: Files},
      {title: '教务通知管理', icon: Monitor},
      {title: '在线图书馆管理', icon: Collection},
      {title: '预约教室管理', icon: DataLine},
    ]
  }
]

get('/api/user/info',(data)=>{
  store.user = data
  loading.value = false;
})

</script>

<template>
  <div class="admin-content" v-loading="loading" element-loading-text="正在进入，请稍后...">
    <el-container style="height: 100%">
      <el-aside width="230px" class="admin-content-aside">
        <div class = "logo-box">
          <el-image src="https://vignette.wikia.nocookie.net/onepiece/images/8/89/Wiki-wordmark.png/revision/latest/scale-to-height-down/40"></el-image>
        </div>
        <el-scrollbar style="height: calc(100vh - 52px)">
          <!-- 第一部分：校园论坛 -->
          <el-menu
              router
              :default-active="$route.path"
              :default-openeds="['1','2']"
              style="min-height: calc(100vh - 52px); border: none">
            <el-sub-menu :index="(index + 1).toString()"
                         v-for="(menu,index) in adminMenu">
              <template #title>
                <el-icon>
                  <component :is="menu.icon" />
                </el-icon>
                <span><b>{{menu.title}}</b></span>
              </template>
              <el-menu-item :index="subMenu.index" v-for="subMenu in menu.sub">
                <template #title>
                  <el-icon>
                    <component :is="subMenu.icon"/>
                  </el-icon>
                  {{subMenu.title}}
                </template>
              </el-menu-item>
            </el-sub-menu>
          </el-menu>
        </el-scrollbar>
      </el-aside>
      <el-container>
        <el-header class="admin-content-header">
          <div style="flex: 1"></div>
          <UserInfo />
        </el-header>
        <el-main>Main</el-main>
      </el-container>
    </el-container>
  </div>
</template>

<style scoped>
.admin-content{
  height: 100vh;
  width: 100vw;

  .admin-content-aside{
    border-right: solid 1px var(--el-border-color);
    .logo-box{
      text-align: center;
      padding: 15px 0 10px;
      height: 52px;

    }
  }

  .admin-content-header{
    border-bottom: solid 1px var(--el-border-color);
    height: 55px;
    display: flex;
    align-items: center;
    box-sizing: border-box;
  }
}
</style>