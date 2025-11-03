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
import {inject, onMounted, ref} from "vue";
import router from "@/router/index.js";
import {useRoute} from "vue-router";

const route = useRoute()
const loading = inject('userLoading')
const store = useStore()
const adminMenu = [
  {
    title: '校园论坛管理', icon: Location, sub:[
      {title: '用户管理', icon: User, index: '/admin/user'},
      {title: '帖子广场管理', icon: ChatDotSquare, index: '/admin/forum'},
      {title: '帖子评论管理', icon: Notification, index: '/admin/comment'},
      {title: '帖子类型管理', icon: Collection, index: '/admin/type'},
      {title: '神券抢购管理', icon: Money, index: '/admin/ticket'},
      {title: '神券订单管理', icon: Bell, index: '/admin/order'},
      {title: '公告管理', icon: Document, index: '/admin/notice'},
      {title: '活动管理', icon: ToiletPaper, index: '/admin/activity'},
    ]
  }
]
const pageTabs = ref([])
function handleTabClick({props}){
  router.push(props.name)
}
function handleTabClose(name){
  const index = pageTabs.value.findIndex(tab => tab.name === name)
  const isCurrent = name === route.fullPath
  pageTabs.value.splice(index,1)
  if(pageTabs.value.length > 0){
    // 删除后， 若存在剩余tab
    if(isCurrent){
      if(index === 0){
        router.push(pageTabs.value[0].name)
      }else{
        router.push(pageTabs.value[index - 1].name)
      }
    }
  }else{
    router.push("/admin")
  }
}
function addAdminTab(menu){
  if(!menu.index) return
  if(pageTabs.value.findIndex(tab => tab.name === menu.index) < 0){
    pageTabs.value.push({
      title: menu.title,
      name: menu.index
    })
  }
}

onMounted(() => {
  const initPage = adminMenu
      .flatMap(menu => menu.sub)
      .find(sub => sub.index === route.fullPath)
  if(initPage){
    addAdminTab(initPage)
  }
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
              <el-menu-item :index="subMenu.index"
                            @click="addAdminTab(subMenu)"
                            v-for="subMenu in menu.sub">
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
          <div style="flex: 1">
            <el-tabs type="card" closable
                     :model-value="route.fullPath"
                      @tab-remove="handleTabClose"
                      @tab-click="handleTabClick">
              <el-tab-pane v-for="tab in pageTabs"
                           :label="tab.title" :name="tab.name" :key="tab.name">

              </el-tab-pane>
            </el-tabs>
          </div>
          <UserInfo />
        </el-header>
        <el-main style="width: 100%; padding: 0;">
          <router-view v-slot="{ Component }">
            <keep-alive>
              <component :is="Component" />
            </keep-alive>
          </router-view>
        </el-main>
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

    :deep(.el-tabs__header){
      height: 32px;
      margin-bottom: 0;
      border-bottom: none;
    }

    :deep(.el-tabs__nav){
      gap: 5px;
      border: none;
    }

    :deep(.el-tabs__item){
      height: 32px;
      padding: 0 15px;
      border-radius: 6px;
      border: solid 1px var(--el-border-color);
    }
  }
}
</style>