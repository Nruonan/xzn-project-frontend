<script setup>
import { reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import {getApiNoticeDetail, getNoticeDetail} from "@/net/api/notice.js"
import LightCard from "../../components/LightCard.vue"
import { ArrowLeft } from '@element-plus/icons-vue'
import router from "@/router/index.js"

const route = useRoute()
const notice = reactive({
  id: 0,
  title: '',
  content: '',
  publishTime: '',
  username: '',
  status: 0
})

function loadNoticeDetail() {
  const noticeId = route.params.id
  if (noticeId) {
    getApiNoticeDetail(noticeId, data => {
      Object.assign(notice, data)
    })
  }
}

function goBack() {
  router.go(-1)
}

onMounted(() => {
  loadNoticeDetail()
})
</script>

<template>
  <div style="max-width: 800px; margin: 20px auto; padding: 0 20px;">
    <light-card>
      <div style="display: flex; align-items: center; margin-bottom: 20px;">
        <el-button :icon="ArrowLeft" @click="goBack" circle></el-button>
        <span style="margin-left: 10px; font-size: 18px; font-weight: bold;">返回公告列表</span>
      </div>

      <el-divider></el-divider>

      <div v-if="notice.id">
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="font-size: 24px; font-weight: bold; color: #333; margin-bottom: 10px;">
            {{ notice.title }}
          </div>
          <div style="display: flex; justify-content: center; align-items: center; color: #999; font-size: 14px;">
            <span>发布者：{{ notice.username }}</span>
            <span style="margin: 0 10px;">|</span>
            <span>发布时间：{{ new Date(notice.publishTime).toLocaleString() }}</span>
            <span v-if="notice.status == 1" style="margin-left: 10px;">
              <el-tag type="danger" size="small">置顶</el-tag>
            </span>
          </div>
        </div>

        <div style="font-size: 16px; line-height: 1.8; color: #333; white-space: pre-wrap;">
          {{ notice.content }}
        </div>
      </div>

      <div v-else style="text-align: center; padding: 40px 0; color: #999;">
        公告不存在或加载中...
      </div>
    </light-card>
  </div>
</template>

<style scoped>
</style>