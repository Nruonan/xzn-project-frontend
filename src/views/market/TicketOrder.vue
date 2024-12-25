<script setup>
import Card from "../../components/Card.vue";
import {useRoute} from "vue-router";
import router from "../../router/index.js";
import {ArrowLeft,ArrowLeftBold,ArrowRightBold} from "@element-plus/icons-vue";
import {get, post} from "../../net/index.js";
import {onMounted, reactive, ref} from "vue";
import {useStore} from "../../store/index.js";
import LightCard from "../../components/LightCard.vue";
import { AlipayOutlined,WechatFilled,CreditCardFilled,SkypeFilled} from '@ant-design/icons-vue';
import {ElMessage, ElMessageBox} from "element-plus";
import {apiOrderSave, apiTakeTicketOrder, apiTicketDetail} from "@/net/api/ticket.js";

const store = useStore()
const route = useRoute()

const tid = route.params.tid
const count = ref(1)
const radio = ref(0)
const ticket = reactive({
    data:{
      id : Number,
      desc: String,
      type: Number,
      name: String,
      createTime: Date,
      validDate: Date,
      price: Number,
    },
})


function takeTicketOrder(){
  apiTakeTicketOrder({
    uid: store.user.id,
    tid: ticket.data.id,
    count:count.value,
    pay:true
  },()=>{
    ElMessage.success('领取成功!')
    router.push('/index/market')
  })
}
const isSuccess = ref('')
function buyTicketOrder(){
  ElMessageBox.confirm(
      '此操作将购买该神券, 是否继续?',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
  ).then(() => {
    apiOrderSave({
      uid: store.user.id,
      tid: ticket.data.id,
      count:count.value,
      price:count.value * ticket.data.price,
      pay:true
    },()=>{
      ElMessage.success('购买成功!')
      router.push('/index/market')
    })
  }).catch(() => {
    apiOrderSave({
      uid: store.user.id,
      tid: ticket.data.id,
      count:count.value,
      price:count.value * ticket.data.price,
      pay:false
    },(data)=>{
      isSuccess.value = data;
      ElMessage.info('已取消购买，可在订单中查询');
      router.push('/index/market')
    })
  });
}
onMounted(() => {
  apiTicketDetail(tid, data => {
    ticket.data = data
  })
})
</script>

<template>
  <div style="display: flex; margin: 30px 250px; gap:20px; max-width: 600px;" v-loading="!ticket.data">
      <div style="flex: 1">
        <div class="ticket-main" style="position: sticky; top:0;z-index: 10">
          <card style="display: flex;width: 100%">
            <el-button @click="router.push('/index/market')" :icon="ArrowLeft" type="info" size="small" plain round>返回列表</el-button>
            <div style="text-align: center;flex: 1" >
              <el-tag
                  size="large"
                  round
                  :type="ticket.data.type === 1 || ticket.data.type === 3 ? 'primary' : 'danger'"
                  disable-transitions
              >{{store.findTicketTypeById(ticket.data.type)?.name}}</el-tag>
              <span style="font-weight: bold;margin-left: 5px;">{{ticket.data.name}} {{ticket.data.desc}}</span>
            </div>
          </card>
          <light-card class="ticket-main" style="margin-top: 15px; max-height: 600px">
            <div style="font-size: 18px;font-weight: bold;margin-left: 5px">
              订单结算
            </div>
            <div style="margin: 5px 5px;color: grey;font-size: 14px">希望大家少吃外卖，多吃家里人做的饭菜</div>

            <el-card shadow="no" style="border-radius: 5px; margin-top: 20px">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div style="text-align: left;" v-loading="ticket.data.name === null">
                  {{ticket.data.name}} {{ticket.data.desc}}
                </div>
                <div style="text-align: right;">
                  <el-icon class="arrow"  @click="count--" v-if="count > 1"><ArrowLeftBold /></el-icon>
                  {{count}}
                  <el-icon class="arrow" @click="count++" v-if="ticket.data.type === 2 || ticket.data.type === 4"><ArrowRightBold /></el-icon>
                </div>
              </div>
            </el-card>
            <div style="margin:10px 10px;font-size: 14px; color: grey">该券是与用户绑定的，非本用户无法使用该券</div>
            <div style="margin: 10px 10px;font-size: 17px;font-weight: bold" v-if="ticket.data.price !== 0">
              <div style="margin-top: 10px">支付方式</div>
              <div style="margin-top: 10px; display: flex;justify-content: space-between;align-items: center;">
                <light-card>
                  <div style="margin-top: -22px">
                    <a-icon> <AlipayOutlined /></a-icon>
                    <a-icon class="icon"> <WechatFilled /></a-icon>
                    <a-icon class="icon"> <CreditCardFilled /></a-icon>
                    <a-icon class="icon"> <SkypeFilled /></a-icon>
                  </div>
                </light-card>
                <light-card>
                  <el-radio-group v-model="radio">
                    <el-radio :value="1" size="large">支付宝</el-radio>
                    <el-radio :value="2" size="large">微信</el-radio>
                    <el-radio :value="3" size="large">银行卡</el-radio>
                    <el-radio :value="4" size="large">白条</el-radio>
                  </el-radio-group>
                </light-card>
              </div>
            </div>
            <div style="display: flex;justify-content: space-between; align-items: center;">
              <div style="text-align: left;font-size: 16px;font-weight:bold;margin-left: 20px">余量: {{ticket.data.count - count}}</div>
              <div style="text-align: right;font-size: 16px;font-weight:bold;margin-right: 50px">价格: {{ticket.data.price * count}}</div>
            </div>
            <div style="margin-top: 20px">
              <div style="text-align: center" v-if="ticket.data.price === 0">
                <el-button type="success" @click="takeTicketOrder">领取</el-button>
              </div>
              <div style="text-align: center" v-else>
                <el-button style="width: 120px" type="success" @click="buyTicketOrder" :disabled="radio > 5 || radio < 1">
                  {{radio > 5 || radio < 1 ? '请选择购买方式' : '购买' }}</el-button>
              </div>
            </div>
          </light-card>
        </div>
      </div>
  </div>
</template>

<style scoped lang="less">
.ticket-main{
  border-radius: 7px;
  margin: 0 auto;
  width: 900px;
}
.arrow{
  font-size: 17px;
  transform: translateY(3px);

  &:hover{
    cursor: pointer;
    background-color: var(--el-border-color);
  }
}
.icon{
  display: block;
  margin-top: 20px
}
:deep(.el-radio-group) {
   display: block;
}
:deep(.el-radio) {
    display: block;
}
</style>