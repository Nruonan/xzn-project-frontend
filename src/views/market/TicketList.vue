<script setup>
import LightCard from "../../components/LightCard.vue";
import {Search,ShoppingTrolley} from "@element-plus/icons-vue";
import {onMounted, reactive, ref} from "vue";
import {useStore} from "@/store/index.js";
import router from "../../router/index.js";
import {ElMessage} from "element-plus";
import {apiLoadTicketList, apiUserRemind, apiUserRemindSave} from "@/net/api/ticket.js";


const store = useStore()
const name = ref('')
const type = ref('全部')
const remind = ref()

const tickets = reactive({
  list:[],
  type: 0,
  page: 1,
  end: false,
})
const loading = ref(false)
const saving = ref(true)



function savePrivacy(type, status){
  saving.value = true
  apiUserRemindSave({
    type:type,
    status: status
  },() => {
    if (status === true){
      ElMessage.success('预约成功！可在消息提醒等候新的神券通知！')
    }else{
      ElMessage.success('取消成功，欢迎下次预约！')
    }

    saving.value = false
  })
}

function SearchTicket(){
  loading.value = false
  tickets.page = 1;
  tickets.list = null;
  if (type.value ==='全部')type.value = '0'
  apiLoadTicketList(tickets.page - 1,type.value, name, data=>{
    tickets.list = data.list
    store.ticket.tickets = data.tickets
  })
  loading.value = true
  type.value ='全部'
}


function loadTickets(page){
  loading.value = false
  tickets.page = page;
  tickets.list = null;
  apiLoadTicketList(tickets.page - 1,tickets.type, name, data=>{
    tickets.list = data.list
    store.ticket.tickets = data.tickets
  })
  loading.value = true
}
loadTickets(1)
onMounted(() => {
  apiUserRemind(data=>{
    remind.value = data.remind
    saving.value = false
  })
})
</script>

<template>
  <div style="display: flex; margin: 50px auto; gap:20px; max-width: 1300px;">
    <div style="flex: 1">
      <light-card style="height: 60px;border-radius: 10px; ">
          <div style="text-align: left">
            优惠券:<el-input  v-model="name" :prefix-icon="Search" style="margin-left:5px; padding:5px ;width: 300px" placeholder="请输入想查找的优惠券"/>
            <el-select
                :teleported="false"
                v-model="type"
                style="width: 170px;margin-left: 15px"
                placeholder="优惠卷的类型"
                default-first-option="store.ticket.types[0]"
            >
            <el-option v-for="item in store.ticket.types"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            >
              {{item.name}}
              </el-option>
            </el-select>
            <el-button style="margin-left: 15px;width: 50px" type="primary" @click="SearchTicket" plain>
              搜索
            </el-button>
            <el-button style="width: 50px" @click="name=''; type=''" plain>
              重置
            </el-button>
          </div>
          <div style="text-align: right; margin-top: -35px">
            <el-checkbox style="margin-right: 20px" @change="savePrivacy('remind', remind)" v-model="remind">
              预约提醒
            </el-checkbox>
            <el-button :icon="ShoppingTrolley" type="info" plain @click="router.push('/index/market/ticket/orders')">查看订单</el-button>
          </div>
      </light-card>
      <light-card style="max-height: 700px;margin-top: 15px;border-radius: 10px" v-loading="!loading">
        <el-table :data="tickets.list"  border style="width: 100%;max-height: 700px; margin-top: 15px">
          <el-table-column prop="createTime" label="发布日期" width="180" >
            <template #default="scope">
              {{ new Date(scope.row.createTime).toLocaleString() }} <!-- 显示为本地日期格式 -->
            </template>
          </el-table-column>
          <el-table-column prop="name" label="名字" width="150" />
          <el-table-column prop="desc" label="说明" width="150" />
          <el-table-column prop="type" label="类型" width="200" >
            <template #default="scope">
              <el-tag
                  size="large"
                  round
                  :type="scope.row.type === 1 || scope.row.type === 3 ? 'primary' : 'danger'"
                  disable-transitions
              >{{store.findTicketTypeById(scope.row.type)?.name}}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="price" label="价格" width="150" />
          <el-table-column prop="validDate" label="截止时间" width="180">
            <template #default="scope">
              {{scope.row.validDate ? new Date(scope.row.validDate).toLocaleString() : '无'}} <!-- 显示为本地日期格式 -->
            </template>
          </el-table-column>
          <el-table-column prop="count" label="余量" width="140" />
          <el-table-column prop="id" fixed="right" label="操作" min-width="120">
            <template #default="scope">
              <el-button
                  link
                  type="warning"
                  size="default"
                  @click="router.push(`/index/market/ticket-order/${scope.row.id}`)"
                  :disabled="new Date() > new Date(scope.row.validDate) && scope.row.validDate || scope.row.count <= 0"

              >
                {{new Date() > new Date(scope.row.validDate) && scope.row.validDate != null || scope.row.count <= 0 ? '已过期或者已购光' : '购买'}}
              </el-button>

            </template>
          </el-table-column>

        </el-table>

      </light-card>
      <div style="width: fit-content;margin: 30px auto">
        <el-pagination background layout="prev, pager, next"
                       v-model:current-page="tickets.page" @current-change="loadTickets"
                       :total="store.ticket.tickets" :page-size="10"  ></el-pagination>
      </div>
    </div>
  </div>
</template>

<style scoped>
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