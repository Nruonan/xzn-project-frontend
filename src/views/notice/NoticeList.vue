<script setup>
import { reactive, onMounted } from 'vue'
import { getNoticeList } from "@/net/api/notice.js"
import { View } from '@element-plus/icons-vue'
import LightCard from "../../components/LightCard.vue"
import router from "@/router/index.js"

const notices = reactive({
  page: 1,
  size: 10,
  total: 0,
  data: []
})

function loadNotices() {
  getNoticeList(notices.page, notices.size, '', data => {
    notices.total = data.total
    notices.data = data.records
  })
}

function handlePageChange() {
  loadNotices()
}

function handleSizeChange() {
  notices.page = 1
  loadNotices()
}

// 添加跳转到公告详情页面的函数
function goToNoticeDetail(id) {
  router.push(`/index/notice/detail/${id}`)
}

onMounted(() => {
  loadNotices()
})
</script>

<template>
  <div style="max-width: 800px; margin: 20px auto; padding: 0 20px;">
    <light-card>
      <div v-if="notices.data.length > 0">
        <div v-for="notice in notices.data" :key="notice.id"
             @click="goToNoticeDetail(notice.id)"
             style="padding: 15px 0; border-bottom: 1px solid #eee; cursor: pointer; transition: all 0.3s;"
             :style="{ borderBottom: notice === notices.data[notices.data.length - 1] ? 'none' : '1px solid #eee' }"
             @mouseenter="event => event.currentTarget.style.backgroundColor = '#f5f7fa'"
             @mouseleave="event => event.currentTarget.style.backgroundColor = 'transparent'">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="font-size: 18px; font-weight: bold; color: #333; flex: 1; text-align: center;">
              {{ notice.title }}
            </div>
            <div style="font-size: 14px; color: #999;">
              {{ new Date(notice.publishTime).toLocaleString() }}
            </div>
          </div>
          <div style="margin-top: 10px; font-size: 15px; color: #666; line-height: 1.5;">
            {{ notice.content.length > 100 ? notice.content.substring(0, 100) + '...' : notice.content }}
          </div>
        </div>

        <div style="margin-top: 20px; display: flex; justify-content: center;">
          <el-pagination
              :total="notices.total"
              v-model:current-page="notices.page"
              v-model:page-size="notices.size"
              layout="total, sizes, prev, pager, next, jumper"
              @current-change="handlePageChange"
              @size-change="handleSizeChange"
          />
        </div>
      </div>

      <div v-else style="text-align: center; padding: 40px 0; color: #999;">
        暂无公告
      </div>
    </light-card>
  </div>
</template>

<style scoped>
</style>