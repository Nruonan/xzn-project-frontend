<template>
  <div class="notification-main">
    <el-card shadow="never" class="notification-card">
      <template #header>
        <div class="card-header">
          <span>消息通知</span>
          <el-button v-if="notification.length" type="danger" :icon="Delete" @click="deleteAllNotification" plain>
            清除全部
          </el-button>
        </div>
      </template>

      <div class="content-container">
        <el-empty v-if="!notification.length" description="暂时没有未读消息哦~" class="empty-state"></el-empty>

        <div v-else class="notifications-list">
          <light-card
              v-for="item in notification"
              :key="item.id"
              class="notification-item"
          >
            <div>
              <el-tag size="small" :type="item.type">消息</el-tag>&nbsp;
              <span style="font-weight: bold">{{ item.title }}</span>
            </div>
            <el-divider style="margin: 7px 0 3px 0" />
            <div style="font-size: 13px; color: grey">
              {{ item.content }}
            </div>
            <div style="font-size: 12px; color: #999; margin-top: 5px; text-align: right;">
              {{ new Date(item.time).toLocaleString() }}
            </div>
            <div style="text-align: right; margin-top: 10px;">
              <el-button
                  type="primary"
                  size="small"
                  @click="goToNotification(item.url)"
                  style="margin-right: 10px;"
              >
                跳转
              </el-button>
              <el-button
                  type="danger"
                  size="small"
                  @click="deleteSingleNotification(item.id)"
                  plain
              >
                删除
              </el-button>
            </div>
          </light-card>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Delete } from '@element-plus/icons-vue'
import LightCard from '@/components/LightCard.vue'
import {
  apiNotificationDelete,
  apiNotificationDeleteAll,
  apiNotificationList
} from '@/net/api/user.js'

const notification = ref([])

const loadNotification = () => {
  apiNotificationList(data => {
    notification.value = data
  })
}

loadNotification()

// 添加跳转功能
function goToNotification(url) {
  window.open(url, '_blank')
}

// 确认并删除通知
function confirmNotification(id, url) {
  apiNotificationDelete(id, () => {
    loadNotification()
    window.open(url, '_blank')
  })
}

// 添加单个消息删除功能
function deleteSingleNotification(id) {
  apiNotificationDelete(id, () => {
    loadNotification()
  })
}

function deleteAllNotification() {
  apiNotificationDeleteAll(() => {
    loadNotification()
  })
}
</script>

<style scoped>
.notification-main {
  width: 1200px;
  max-width: 95%;
  margin: 20px auto;
}

.notification-card {
  min-height: 700px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 20px;
  padding: 15px 0;
}

.content-container {
  min-height: 600px;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 500px;
}

.notifications-list {
  max-height: 600px;
  overflow-y: auto;
  padding-right: 10px;
}

.notification-item {
  transition: 0.3s;
  margin-bottom: 15px;
  padding: 15px;
}

.notification-item:hover {
  opacity: 0.8;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .notification-main {
    width: 95%;
    margin: 10px auto;
  }

  .notification-card {
    min-height: 500px;
  }

  .notification-item {
    padding: 10px;
  }

  .empty-state {
    height: 300px;
  }
}
</style>