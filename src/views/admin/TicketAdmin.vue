<script setup>
import {EditPen, Document, Delete, Plus, View, Search} from "@element-plus/icons-vue";
import {apiAdminTicketList, apiAdminTicketDetail, apiAdminTicketUpdate, apiAdminTicketRemove, apiAdminTicketAdd} from "@/net/api/ticket.js";
import {reactive} from "vue";
import {ElMessage, ElMessageBox} from "element-plus";

const editor = reactive({
  id: 0,
  display: false,
  temp: {},
  loading: false,
  isAdd: false, // 区分是新增还是编辑
  isDetail: false // 区分是查看详情还是编辑
})

const ticketTable = reactive({
  page : 1,
  size: 10,
  total: 0,
  data: [],
  searchDesc: '', // 添加搜索描述字段
  isSearching: false // 添加搜索状态标识
})

// 打开编辑器（新增）
function openAddEditor() {
  editor.id = 0
  editor.isAdd = true
  editor.isDetail = false
  editor.display = true
  editor.loading = false
  // 初始化默认值
  editor.temp = {
    name: '',
    desc: '',
    type: 1,
    validDateType: 1,
    validDate: '',
    price: 0,
    count: 0,
    createTime: new Date()
  }
}

// 打开编辑器（编辑）
function openTicketEditor(ticket) {
  editor.id = ticket.id
  editor.isAdd = false
  editor.isDetail = false
  editor.display = true
  editor.loading = true
  apiAdminTicketDetail(editor.id, data => {
    editor.temp = { ...data, ...ticket }
    editor.loading = false
  })
}

// 打开详情查看
function openTicketDetail(ticket) {
  editor.id = ticket.id
  editor.isAdd = false
  editor.isDetail = true
  editor.display = true
  editor.loading = true
  apiAdminTicketDetail(editor.id, data => {
    editor.temp = { ...data, ...ticket }
    editor.loading = false
  })
}

function ticketType(type){
  switch(type) {
    case 1: return '永久免费'
    case 2: return '限时免费'
    case 3: return '永久付费'
    default: return '限时付费'
  }
}

function validDateType(type){
  switch(type) {
    case 1: return '永久有效'
    case 0: return '限时有效'
  }
}

// 保存神券信息（新增或更新）
function saveTicketDetail(){
  // 只有在新增或编辑模式下才能保存
  if (!editor.isDetail) {
    editor.display = false
    if(editor.isAdd) {
      // 新增
      apiAdminTicketAdd(editor.temp, () => {
        ElMessage.success('神券添加成功')
        // 重新加载列表
        if (ticketTable.isSearching) {
          searchTickets()
        } else {
          loadTicketList()
        }
      })
    } else {
      // 编辑
      apiAdminTicketUpdate(editor.temp, () => {
        const ticket = ticketTable.data.find(ticket => ticket.id === editor.id)
        Object.assign(ticket, editor.temp)
        ElMessage.success('数据保存成功')
      })
    }
  }
}

function deleteTicket(id){
  ElMessageBox.confirm(
      '此操作将删除该神券, 是否继续?',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
  ).then(() => {
    apiAdminTicketRemove(id, () => {
      ElMessage.success('删除成功!')
      if (ticketTable.isSearching) {
        searchTickets()
      } else {
        loadTicketList()
      }
    })
  }).catch(() => {
    ElMessage.info('已取消删除');
  });
}

// 加载所有神券列表（默认情况）
function loadTicketList() {
  ticketTable.isSearching = false
  apiAdminTicketList(ticketTable.page, ticketTable.size, '', data => {
    ticketTable.total = data.total
    ticketTable.data = data.list
  })
}

// 搜索功能
function searchTickets() {
  ticketTable.isSearching = true
  ticketTable.page = 1 // 搜索时重置到第一页
  apiAdminTicketList(ticketTable.page, ticketTable.size, ticketTable.searchDesc, data => {
    ticketTable.total = data.total
    ticketTable.data = data.list
  })
}

// 重置搜索
function resetSearch() {
  ticketTable.searchDesc = ''
  ticketTable.isSearching = false
  ticketTable.page = 1
  loadTicketList()
}

// 分页变化时的处理函数
function handlePageChange() {
  if (ticketTable.isSearching) {
    searchTickets()
  } else {
    loadTicketList()
  }
}

// 大小变化时的处理函数
function handleSizeChange() {
  ticketTable.page = 1 // 重置到第一页
  if (ticketTable.isSearching) {
    searchTickets()
  } else {
    loadTicketList()
  }
}

// 默认加载所有数据
loadTicketList()
</script>

<template>
  <div class="ticket-admin">
    <div class="title">
      <el-icon><Document/></el-icon>
      神券列表
    </div>
    <div class="desc">
      在这里管理平台的所有神券，包括神券信息、价格和有效期设置
    </div>
    <!-- 添加搜索区域 -->
    <div style="margin-bottom: 15px; display: flex; gap: 10px; align-items: center;">
      <el-input
        v-model="ticketTable.searchDesc"
        placeholder="请输入神券描述进行搜索"
        clearable
        style="width: 300px"
        @keyup.enter="searchTickets"
      />
      <el-button type="primary" :icon="Search" @click="searchTickets">搜索</el-button>
      <el-button @click="resetSearch">重置</el-button>
      <el-button type="primary" :icon="Plus" @click="openAddEditor" style="margin-left: auto;">新增神券</el-button>
    </div>
    <el-table :data="ticketTable.data" height="500">
      <el-table-column prop="id" label="编号" width="80"/>
      <el-table-column label="神券名称" width="150">
        <template #default="{ row }">
          <div class="table-ticket-name">
            {{ row.name }}
          </div>
        </template>
      </el-table-column>
      <el-table-column label="描述" align="center" width="200">
        <template #default="{ row }">
          {{ row.desc.length > 30 ? row.desc.substring(0, 30) + '...' : row.desc }}
        </template>
      </el-table-column>
      <el-table-column label="类型" width="120" align="center">
        <template #default="{ row }">
          {{ ticketType(row.type) }}
        </template>
      </el-table-column>
      <el-table-column label="购买价格" width="120" align="center">
        <template #default="{ row }">
          {{row.price }}
        </template>
      </el-table-column>
      <el-table-column label="有效期类型" width="120" align="center">
        <template #default="{ row }">
          {{ validDateType(row.validDateType) }}
        </template>
      </el-table-column>
      <el-table-column label="有效期" width="120" align="center">
        <template #default="{ row }">
          {{ row.validDate ? new Date(row.validDate).toLocaleDateString() : '' }}
        </template>
      </el-table-column>
      <el-table-column label="剩余数量" width="100" align="center">
        <template #default="{ row }">
          {{ row.count }}
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="180" align="center">
        <template #default="{ row }">
          {{ new Date(row.createTime).toLocaleString() }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center">
        <template #default="{ row }">
          <el-button type="primary" size="small" :icon="View"
                     @click="openTicketDetail(row)">查看</el-button>
          <el-button type="success" size="small" :icon="EditPen"
                     @click="openTicketEditor(row)">编辑</el-button>
          <el-button type="danger" size="small" :icon="Delete"
                     @click="deleteTicket(row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="pagination">
      <el-pagination :total="ticketTable.total"
                     v-model:current-page="ticketTable.page"
                     v-model:page-size="ticketTable.size"
                     layout="total, sizes, prev, pager, next, jumper"
                     @current-change="handlePageChange"
                     @size-change="handleSizeChange"/>
    </div>
    <el-drawer v-model="editor.display">
      <template #header>
        <div>
          <div style="font-weight: bold">
            <el-icon><EditPen/></el-icon> {{ editor.isDetail ? '查看神券信息' : (editor.isAdd ? '新增神券' : '编辑神券信息') }}
          </div>
          <div style="font-size: 13px">{{ editor.isDetail ? '神券详细信息' : (editor.isAdd ? '填写神券信息后点击保存按钮' : '编辑完成后请点击下方保存按钮') }}</div>
        </div>
      </template>
      <el-form label-position="top" :disabled="editor.isDetail">
        <el-form-item label="神券名称">
          <el-input v-model="editor.temp.name"/>
        </el-form-item>
        <el-form-item label="描述">
          <el-input type="textarea" :rows="3" v-model="editor.temp.desc"/>
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="editor.temp.type" style="width: 100%">
            <el-option :value="1" label="永久免费"/>
            <el-option :value="2" label="限时免费"/>
            <el-option :value="3" label="永久付费"/>
            <el-option :value="4" label="限时付费"/>
          </el-select>
        </el-form-item>
        <el-form-item label="价格" v-if="editor.temp.type === 3 || editor.temp.type === 4">
          <el-input-number v-model="editor.temp.price" :min="0" controls-position="right" style="width: 100%"/>
        </el-form-item>
        <el-form-item label="有效期类型">
          <el-select v-model="editor.temp.validDateType" style="width: 100%">
            <el-option :value="0" label="限时有效"/>
            <el-option :value="1" label="永久有效"/>
          </el-select>
        </el-form-item>
        <el-form-item label="有效期" v-if="editor.temp.validDateType === 0">
          <el-date-picker
              v-model="editor.temp.validDate"
              type="date"
              placeholder="选择日期"
              style="width: 100%"
              value-format="YYYY-MM-DD">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="数量">
          <el-input-number v-model="editor.temp.count" :min="0" controls-position="right" style="width: 100%"/>
        </el-form-item>
        <div style="margin-top: 10px;color: #606266;font-size: 14px" v-if="!editor.isAdd">
          创建时间: {{ new Date(editor.temp.createTime).toLocaleString() }}
        </div>
        <el-divider/>
      </el-form>
      <template #footer>
        <div style="text-align: center">
          <el-button type="success" @click="saveTicketDetail" v-if="!editor.isDetail">保存</el-button>
          <el-button type="info" @click="editor.display = false">{{ editor.isDetail ? '关闭' : '取消' }}</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<style lang="less" scoped>
.ticket-admin{
  .title{
    font-weight: bold;
  }

  .desc{
    color: #bababa;
    font-size: 13px;
    margin-bottom: 20px;
  }

  .table-ticket-name {
    height: 30px;
    display: flex;
    align-items: center;
  }

  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: right;
  }

  :deep(.el-drawer__header) {
    margin-bottom: 0;
  }
}
</style>
