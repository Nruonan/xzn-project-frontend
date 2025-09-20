<script setup>
import {Document, Delete, Refresh} from "@element-plus/icons-vue";
import {
  apiAdminOrderDelete,
  apiAdminOrderDetail,
  apiAdminOrderList,
  apiAdminOrderUpdate
} from "@/net/api/ticket.js";
import {reactive, watchEffect} from "vue";
import {ElMessage, ElMessageBox} from "element-plus";

const editor = reactive({
  id: 0,
  display: false,
  temp: {},
  loading: false,
  isDetail: false // 区分是查看详情还是编辑
})

const orderTable = reactive({
  page : 1,
  size: 10,
  total: 0,
  data: []
})

// 打开详情查看
function openOrderDetail(order) {
  editor.id = order.id
  editor.isDetail = true
  editor.display = true
  editor.loading = true
  apiAdminOrderDetail(editor.id, data => {
    editor.temp = { ...data, ...order }
    editor.loading = false
  })
}

// 打开编辑器
function openOrderEditor(order) {
  editor.id = order.id
  editor.isDetail = false
  editor.display = true
  editor.loading = true
  apiAdminOrderDetail(editor.id, data => {
    editor.temp = { ...data, ...order }
    editor.loading = false
  })
}

function orderStatus(pay){
  return pay ? '已支付' : '未支付'
}

// 保存订单信息
function saveOrderDetail(){
  editor.display = false
  apiAdminOrderUpdate(editor.temp, () => {
    const order = orderTable.data.find(order => order.id === editor.id)
    Object.assign(order, editor.temp)
    ElMessage.success('数据保存成功')
  })
}

function deleteOrder(id){
  ElMessageBox.confirm(
      '此操作将删除该订单, 是否继续?',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
  ).then(() => {
    apiAdminOrderDelete(id, () => {
      ElMessage.success('删除成功!')
      apiAdminOrderList(orderTable.page, orderTable.size, data => {
        orderTable.total = data.total
        orderTable.data = data.list
      });
    })
  }).catch(() => {
    ElMessage.info('已取消删除');
  });
}

watchEffect(() => apiAdminOrderList(orderTable.page, orderTable.size, data => {
  orderTable.total = data.total
  orderTable.data = data.list
}))

</script>

<template>
  <div class="order-admin">
    <div class="title">
      <el-icon><Document/></el-icon>
      订单列表
    </div>
    <div class="desc">
      在这里管理平台的所有订单信息
    </div>
    <el-table :data="orderTable.data" height="500">
      <el-table-column prop="id" label="订单编号" width="220"/>
      <el-table-column label="用户ID" width="200" align="center">
        <template #default="{ row }">
          {{ row.uid }}
        </template>
      </el-table-column>
      <el-table-column label="神券ID" width="200" align="center">
        <template #default="{ row }">
          {{ row.tid }}
        </template>
      </el-table-column>
      <el-table-column label="购买数量" width="200" align="center">
        <template #default="{ row }">
          {{ row.count }}
        </template>
      </el-table-column>
      <el-table-column label="订单金额" width="100" align="center">
        <template #default="{ row }">
          {{ row.price }}
        </template>
      </el-table-column>
      <el-table-column label="下单时间" width="280" align="center">
        <template #default="{ row }">
          {{ new Date(row.time).toLocaleString() }}
        </template>
      </el-table-column>
      <el-table-column label="支付状态" width="200" align="center">
        <template #default="{ row }">
          <el-tag :type="row.pay ? 'success' : 'danger'">{{ orderStatus(row.pay) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center">
        <template #default="{ row }">
          <el-button type="success" size="small" :icon="EditPen"
                     @click="openOrderEditor(row)">编辑</el-button>
          <el-button type="danger" size="small" :icon="Delete"
                     @click="deleteOrder(row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="pagination">
      <el-pagination :total="orderTable.total"
                     v-model:current-page="orderTable.page"
                     v-model:page-size="orderTable.size"
                     layout="total, sizes, prev, pager, next, jumper"/>
    </div>
    <!-- 订单详情/编辑抽屉 -->
    <el-drawer v-model="editor.display">
      <template #header>
        <div>
          <div style="font-weight: bold">
            <el-icon><Document/></el-icon> {{ editor.isDetail ? '订单详情' : '编辑订单' }}
          </div>
          <div style="font-size: 13px">{{ editor.isDetail ? '订单详细信息' : '编辑完成后请点击下方保存按钮' }}</div>
        </div>
      </template>
      <el-form label-position="top" :disabled="editor.isDetail">
        <el-form-item label="订单编号">
          <el-input v-model="editor.temp.id" disabled/>
        </el-form-item>
        <el-form-item label="用户ID">
          <el-input v-model="editor.temp.uid" disabled/>
        </el-form-item>
        <el-form-item label="神券ID">
          <el-input v-model="editor.temp.tid" disabled/>
        </el-form-item>
        <el-form-item label="购买数量">
          <el-input-number v-model="editor.temp.count" :min="1" controls-position="right" style="width: 100%"/>
        </el-form-item>
        <el-form-item label="订单金额">
          <el-input-number v-model="editor.temp.price" :min="0" controls-position="right" style="width: 100%"/>
        </el-form-item>
        <el-form-item label="下单时间">
          <el-date-picker
              v-model="editor.temp.time"
              type="datetime"
              placeholder="选择日期时间"
              style="width: 100%"
              value-format="YYYY-MM-DD HH:mm:ss">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="支付状态">
          <el-switch
              v-model="editor.temp.pay"
              active-text="已支付"
              inactive-text="未支付">
          </el-switch>
        </el-form-item>
      </el-form>
      <template #footer>
        <div style="text-align: center">
          <el-button type="success" @click="saveOrderDetail" v-if="!editor.isDetail">保存</el-button>
          <el-button type="info" @click="editor.display = false">{{ editor.isDetail ? '关闭' : '取消' }}</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<style lang="less" scoped>
.order-admin{
  .title{
    font-weight: bold;
  }

  .desc{
    color: #bababa;
    font-size: 13px;
    margin-bottom: 20px;
  }

  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: right;
  }
}
</style>