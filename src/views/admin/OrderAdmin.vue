<script setup>
import {Document, Delete, EditPen, View, Search} from "@element-plus/icons-vue";
import {
  apiAdminOrderDelete,
  apiAdminOrderDetail,
  apiAdminOrderList,
  apiAdminOrderUpdate
} from "@/net/api/ticket.js";
import {reactive} from "vue";
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
  data: [],
  searchTid: '', // 添加搜索神券ID字段
  isSearching: false // 添加搜索状态标识
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
      // 删除后根据当前状态重新加载数据
      if (orderTable.isSearching) {
        searchOrders()
      } else {
        loadOrderList()
      }
    })
  }).catch(() => {
    ElMessage.info('已取消删除');
  });
}

// 加载所有订单列表（默认情况）
function loadOrderList() {
  orderTable.isSearching = false
  apiAdminOrderList(orderTable.page, orderTable.size, '', data => {
    orderTable.total = data.total
    orderTable.data = data.list
  })
}

// 搜索功能
function searchOrders() {
  orderTable.isSearching = true
  orderTable.page = 1 // 搜索时重置到第一页
  apiAdminOrderList(orderTable.page, orderTable.size, orderTable.searchTid, data => {
    orderTable.total = data.total
    orderTable.data = data.list
  })
}

// 重置搜索
function resetSearch() {
  orderTable.searchTid = ''
  orderTable.isSearching = false
  orderTable.page = 1
  loadOrderList()
}

// 分页变化时的处理函数
function handlePageChange() {
  if (orderTable.isSearching) {
    searchOrders()
  } else {
    loadOrderList()
  }
}

// 大小变化时的处理函数
function handleSizeChange() {
  orderTable.page = 1 // 重置到第一页
  if (orderTable.isSearching) {
    searchOrders()
  } else {
    loadOrderList()
  }
}

// 默认加载所有数据
loadOrderList()
</script>

<template>
  <div class="order-admin" style="padding: 10px 20px">
    <el-card :icon="Document" title="订单列表" desc="在这里管理平台的所有订单信息">
      <!-- 搜索区域 -->
      <div style="margin-bottom: 15px; display: flex; gap: 10px; align-items: center;">
        <el-input
            v-model="orderTable.searchDesc"
            placeholder="请输入订单编号或用户ID进行搜索"
            clearable
            style="width: 300px"
            @keyup.enter="searchOrders"
        />
        <el-button type="primary" :icon="Search" @click="searchOrders">搜索</el-button>
        <el-button @click="resetSearch">重置</el-button>
      </div>
      <el-table :data="orderTable.data" height="500">
        <el-table-column prop="id" label="订单编号" width="180"/>
        <el-table-column prop="uid" label="用户ID" width="80" align="center"/>
        <el-table-column prop="tid" label="神券ID" width="80" align="center"/>
        <el-table-column label="神券名称" width="150">
          <template #default="{ row }">
            <div class="table-ticket-name">
              {{ row.ticketName }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="购买数量" width="80" align="center">
          <template #default="{ row }">
            {{ row.count }}
          </template>
        </el-table-column>
        <el-table-column label="订单金额" width="80" align="center">
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
            <el-button type="primary" size="small" :icon="View"
                       @click="openOrderDetail(row)">查看</el-button>
            <el-button type="success" size="small" :icon="EditPen"
                       @click="openOrderEditor(row)">编辑</el-button>
            <el-button type="danger" size="small" :icon="Delete"
                       @click="deleteOrder(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination" style="margin-top: 20px; display: flex; justify-content: center">
        <el-pagination :total="orderTable.total"
                       v-model:current-page="orderTable.page"
                       v-model:page-size="orderTable.size"
                       layout="total, sizes, prev, pager, next, jumper"
                       @current-change="handlePageChange"
                       @size-change="handleSizeChange"/>
      </div>
    </el-card>
    <!-- 订单详情/编辑弹窗 -->
    <el-dialog v-model="editor.display" width="500px" :title="editor.isDetail ? '订单详情' : '编辑订单'">
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
    </el-dialog>
  </div>
</template>

<style lang="less" scoped>
.order-admin {
  .order-card {
    width: 100%;

    .card-header {
      display: flex;
      align-items: center;
      font-weight: bold;
      gap: 8px;
    }

    .desc {
      color: #bababa;
      font-size: 13px;
      margin-bottom: 20px;
    }

    .search-area {
      display: flex;
      gap: 10px;
      align-items: center;
      margin-bottom: 15px;
    }

    .order-table {
      width: 100%;
    }

    .pagination {
      margin-top: 20px;
      display: flex;
      justify-content: center;
    }
  }
}
</style>
