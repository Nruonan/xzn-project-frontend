<template>

    <div class="main-content" v-loading="loading" element-loading-text="正在进入，请稍后...">
      <el-container style="height: 100%" v-if="!loading">
        <el-header class="main-content-header">
          <div style="width: 320px">
            <el-image  src="https://vignette.wikia.nocookie.net/onepiece/images/8/89/Wiki-wordmark.png/revision/latest/scale-to-height-down/40"></el-image>
          </div>
          <div style="flex: 1; text-align: center; padding: 0 20px; "  >
            <el-input v-model="search.text" style="width: 100%; max-width: 500px; " placeholder="搜索论坛相关内容...">
              <template #prefix>
                <el-icon><Search/></el-icon>
              </template>
              <template #append>
                <div class="select_btn">
                  <el-select :teleported="false"  v-model="search.type" style="width: 120px">
                    <el-option value="1" label="帖子广场"/>
                    <el-option value="2" label="神券抢购"/>
                    <el-option value="3" label="校园公告"/>
                    <el-option value="4" label="校园活动"/>
                    <el-option value="5" label="失物招领"/>
                  </el-select>
                </div>

              </template>
            </el-input>
            </div>
            <div style="margin-right: 15px">
                <el-switch
                    size="default"
                    v-model="isDark"
                    style="--el-switch-on-color: #000000; --el-switch-off-color: #d5d5d5"
                   :active-action-icon="Moon"
                   :inactive-action-icon="Sunny"
                />
              </div>
          <user-info>
            <el-popover placement="bottom" :width="350" trigger="click"
                        popper-style="background-color:var(--el-popover-border-color);box-shadow: rgb(14 18 22 / 35%) 0px 10px 38px -10px, rgb(14 18 22 / 20%) 0px 10px 20px -15px; padding: 20px;">
              <template #reference>
                <el-badge is-dot :hidden="!notification.length">
                  <div class="notification">
                    <el-icon><Bell/></el-icon>
                    <div style="font-size: 10px">消息</div>
                  </div>
                </el-badge>
              </template>
              <template #default>
                <el-empty :image-size="80" description="暂时没有未读消息哦~" v-if="!notification.length"></el-empty>
                <el-scrollbar :max-height="500" v-else>
                  <light-card v-for="item in notification" class="notification-item"
                              @click="confirmNotification(item.id,item.url)">
                    <div>
                      <el-tag size="small" :type="item.type">消息</el-tag>&nbsp;
                      <span style="font-weight: bold">{{item.title}}</span>
                    </div>
                    <el-divider style="margin: 7px 0 3px 0"/>
                    <div style="font-size: 13px;color: grey">
                      {{item.content}}
                    </div>
                  </light-card>
                  <div style="margin-top: 10px">
                    <el-button size="small" type="info" :icon="Check" @click="deleteAllNotification" style="width: 100%" plain>清除全部未读消息</el-button>
                  </div>
                </el-scrollbar>
              </template>
            </el-popover>
          </user-info>
        </el-header>
        <el-container>
          <el-aside width="230px">
            <el-scrollbar style="height: calc(100vh - 55px)">
              <el-menu
                  router
                  :default-active="$route.path"
                  :default-openeds="['1','2','3']"
                  style="min-height: calc(100vh - 52px)">
                <el-sub-menu :index="(index + 1).toString()"
                             v-for="(menu, index) in userMenu">
                  <template #title>
                    <el-icon>
                      <component :is="menu.icon"/>
                    </el-icon>
                    <span><b>{{ menu.title }}</b></span>
                  </template>
                  <el-menu-item :index="subMenu.index" v-for="subMenu in menu.sub">
                    <template #title>
                      <el-icon>
                        <component :is="subMenu.icon"/>
                      </el-icon>
                      {{ subMenu.title }}
                    </template>
                  </el-menu-item>
                </el-sub-menu>
              </el-menu>
            </el-scrollbar>
          </el-aside>
          <el-main class="main-content-page">
              <el-scrollbar style="height: calc(100vh - 55px)">
                  <router-view v-slot="{ Component }">
                    <transition name="el-fade-in-linear" mode="out-in">
                      <component :is="Component" style="height: 100%"/>
                    </transition>
                  </router-view>
              </el-scrollbar>
          </el-main>
        </el-container>
      </el-container>
    </div>
</template>

<script setup>
import {
  Sunny,
  Moon,
  Location,
  ChatDotSquare,
  Message,
  Bell,
  Notification,
  Goods,
  ToiletPaper,
  Operation,
  Lock,
  User,
  Reading,
  Search,
  Money,
  Check, Files, Document, Position, Monitor, Collection, DataLine, House
} from '@element-plus/icons-vue'
import { useDark } from '@vueuse/core'
import {get} from "../net/index.js";
import {useStore} from "../store/index.js";
import {ref, reactive, inject} from "vue";
import LightCard from "../components/LightCard.vue";
import UserInfo from "@/components/UserInfo.vue";
import {
  apiNotificationDelete,
  apiNotificationDeleteAll,
  apiNotificationList
} from "@/net/api/user.js";
const search = reactive({
  text: '',
  type: '1'
})
const store = useStore()
const isDark = useDark()
const notification = ref([])
let userMenu = [
  {
    title: '校园论坛', icon: Location, sub: [
      { title: '帖子广场', icon: ChatDotSquare, index: '/index' },
      { title: '神券抢购', icon: Money, index: '/index/market' },
      { title: '校园公告', icon: Document, index: '/index/notice' },
      { title: '校园活动（未开发）', icon: Notification },
      { title: '失物招领（未开发）', icon: Bell }
    ]
  }, {
    title: '个人设置', icon: Operation, sub: [
      { title: '用户主页面', icon: House, index: `/index/user-detail/${store.user.id}` },
      { title: '个人信息设置', icon: User, index: '/index/user-setting' },
      { title: '账号安全设置', icon: Lock, index: '/index/privacy-setting' }
    ]
  }
]
const loading = inject('userLoading')


const loadNotification =
    () => apiNotificationList(data=> notification.value = data)
loadNotification()

function confirmNotification(id,url){
  apiNotificationDelete(id, () =>{
    loadNotification()
    window.open(url)
  })
}
function deleteAllNotification(){
  apiNotificationDeleteAll(loadNotification)
}
</script>

<style scoped lang="less">
.notification-item{
  transition: .3s;
  &:hover {
    opacity: 0.7;
    cursor: pointer;
  }
}
.notification{
  font-size: 22px;
  line-height: 14px;
  text-align: center;
  transition: color .3s;
  &:hover{
    color: grey;
    cursor: pointer;
  }
}
.main-content-page{
  padding: 0;
  background-color: #f7f8fa;
}
.dark .main-content-page{
  background-color: #212225;
}
.main-content{
  height: 100vh;
  width: 100vw;
}
.main-content-header{
  border-bottom: solid 1px var(--el-border-color);
  height: 55px;
  display: flex;
  align-items: center;
  box-sizing: border-box;
 
  .user-info{
    display: flex;
    justify-content: flex-end;
    align-items: center;

    .el-avatar:hover {
      cursor: pointer;
    }
    .profile {
      text-align: right;
      margin-right: 20px;

      :first-child {
        font-size: 18px;
        font-weight: bold;
        line-height: 20px;
      }

      :last-child {
        font-size: 10px;
        color: grey;
      }
    }
  }

}
.header {
  display: flex;
  align-items: center; /* 使图标和文字在垂直方向上居中 */

  .title {
    font-size: 23px;
    margin-left: 10px;
  }
}
.notification {
  font-size: 22px;
  line-height: 14px;
  text-align: center;
  transition: color .3s;

  &:hover {
    color: grey;
    cursor: pointer;
  }
}
.el-dropdown-menu {
  background:  var(--el-border-color-extra-light) ;

}


:deep(.el-popper.is-light){
  background:  var(--el-border-color-extra-light) ;

}
:deep(.el-select-dropdown__item.hover){
  background: transparent ;
  border: none ;
  color: #04FAA0;

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
:deep(.el-sub-menu__title) {
  position: relative;
  margin: 5px 10px;
  border-radius: 8px;
  transition: all 0.3s;
}

:deep(.el-sub-menu__title:hover) {
  background-color: var(--el-menu-hover-bg-color);
  transform: translateY(-2px);
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

:deep(.el-menu-item) {
  position: relative;
  margin: 2px 10px;
  border-radius: 6px;
  transition: all 0.3s;
}

:deep(.el-menu-item:hover) {
  background-color: var(--el-menu-hover-bg-color);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.08);
}

:deep(.el-menu-item.is-active) {
  background-color: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}
</style>