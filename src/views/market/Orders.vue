<script setup>

import Card from "../../components/Card.vue";
import router from "../../router/index.js";
import {ArrowLeft} from "@element-plus/icons-vue";
import {reactive} from "vue";
import {useStore} from "@/store/index.js";
import {ElMessage, ElMessageBox} from "element-plus";
import {apiOrderList, apiOrderRemove, apiOrderRepeat} from "@/net/api/ticket.js";
const store = useStore()
const orders = reactive({
  list:[]
})
function init(){
  apiOrderList(store.user.id,data=>{
    orders.list = data
  })
}
init()
function saveTicket(id){
  ElMessageBox.confirm(
      '此操作将购买该神券, 是否继续?',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
  ).then(() => {
    apiOrderRepeat({
      id:id,
      pay:true
    },()=>{
      ElMessage.success('购买成功!')
      router.push('/index/market')
    })
  }).catch(() => {
    ElMessage.info('已取消购买，可在订单中查询');
  });
}
function removeOrder(uid, id){
  ElMessageBox.confirm(
      '此操作将删除该订单, 是否继续?',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
  ).then(() => {
    apiOrderRemove({
      uid:uid,
      id:id,
    },()=>{
      ElMessage.success('删除成功!')
      init()
    })
  }).catch(() => {
    ElMessage.info('已取消删除，可在订单中查询');
  });
}
function cancelOrder(uid, id){
  ElMessageBox.confirm(
      '此操作将取消该订单, 是否继续?',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
  ).then(() => {
    apiOrderRemove({
      uid:uid,
      id:id,
    },()=>{
      ElMessage.success('取消成功!')
      init()
    })
  }).catch(() => {
    ElMessage.info('已取消此次操作，可在订单中查询');
  });
}
</script>

<template>
  <div style="display: flex; margin: 20px auto; max-width: 1300px;">
    <div style="flex: 1;">
      <card class="orders-main" style="height: 50px">
        <div style="display: flex;">
          <el-button @click="router.push('/index/market')" :icon="ArrowLeft" type="info" size="small" plain round>返回列表</el-button>
          <div style="font-weight: bold; text-align: center;flex: 1;margin-left: -50px">我的订单</div>
        </div>
      </card>
      <card class="orders-main" style="height: 700px">
        <el-scrollbar height="650px">
           <div style="margin: 10px;" v-for="item in orders.list">
              <el-card shadow="no" style="height: 140px; border-radius: 10px;">
            <div style="display: flex;">
              <div style="font-size: 14px;color: grey;margin: -8px -6px">
                订单时间: {{new Date(item.time).toLocaleString()}}
              </div>
              <div style="text-align: right;flex: 1;font-size: 14px;color: grey;margin: -8px -6px">
                订单号: {{item.id}}
              </div>
            </div>
            <div style="display: flex;margin-top: 15px">
              <div style="text-align: left;">
                {{item.name}}
              </div>
              <div style="flex: 1;text-align: right">
                x{{item.count}}件
              </div>
            </div>
            <div style="font-size: 12px;color: grey; margin-top: 6px">
              不支持无理由退货
            </div>
            <div style="display: flex;margin-top: 10px">
                <div style="flex: 1;text-align: right">
                  <span v-if="item.pay === false" style="font-weight: bold;font-size: 18px">待支付</span>价格：<span style="font-weight: bold">{{item.price}}</span>
                </div>
            </div>
            <div style="border-radius: 5px">
              <el-button size="small"  type="primary" plain v-if="item.pay === true" @click="removeOrder(store.user.id, item.id)">
                删除订单
              </el-button>
              <el-button size="small" type="danger" plain v-else @click="cancelOrder(store.user.id, item.id)">
                取消订单
              </el-button>
              <el-button size="small" type="warning" plain v-if="item.pay === true" @click="router.push(`/index/market/ticket-order/${item.tid}`)">
                再买一单
              </el-button>
              <el-button size="small" type="success" plain v-else @click="saveTicket(item.id)">
                点击支付
              </el-button>
            </div>
          </el-card>
        </div>
        </el-scrollbar>
      </card>
    </div>
  </div>
</template>

<style scoped>
.orders-main{
  width: 600px;
  margin: 20px auto
}
</style>