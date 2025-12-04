<script setup>
import {EditPen, User} from "@element-plus/icons-vue";
import {apiUserDetailTotal, apiUserList, apiUserSave} from "@/net/api/user.js";
import {reactive, onMounted} from "vue";
import {useStore} from "@/store/index.js";
import {ElMessage} from "element-plus";
const store = useStore()

const editor = reactive({
  id: 0,
  display: false,
  temp: {},
  loading: false
})

const userTable = reactive({
  page : 1,
  size: 10,
  total: 0,
  data: []
})

// 加载用户列表
function loadUserList() {
  apiUserList(userTable.page, userTable.size, data => {
    userTable.total = data.total
    userTable.data = data.list
  })
}

function openUserEditor(user) {
  editor.id = user.id
  editor.display = true
  editor.loading = true
  apiUserDetailTotal(editor.id, data => {
    editor.temp = { ...data, ...user }
    editor.loading = false
  })
}
function userStatus(user){
  if(user.mute && user.banned)
    return '禁言中、封禁中'
  else if(user.mute)
    return '禁言中'
  else if(user.banned)
    return '封禁中'
  else
    return '正常'
}

function saveUserDetail(){
  editor.display = false
  apiUserSave(editor.temp, () => {
    const user = userTable.data.find(user => user.id === editor.id)
    Object.assign(user, editor.temp)
    ElMessage.success('数据保存成功')
  })
}
// 组件挂载时加载数据
onMounted(() => {
  loadUserList()
})

</script>

<template>
  <div style="padding: 10px 20px">
    <el-card>
      <template #header>
        <div class="card-header">
          <el-icon><User /></el-icon>
          社区用户列表
        </div>
      </template>
     <div class="desc">
        在这里管理社区的所有用户信息
      </div>
      <!-- 搜索区域 -->
      <div style="display: flex; justify-content: space-between; margin-bottom: 15px">
        <div class="search-area">
          <!-- 这里可以添加搜索功能 -->
        </div>
      </div>

      <!-- 表格区域 -->
      <el-table :data="userTable.data" style="width: 100%" border height="600">
        <el-table-column prop="id" label="编号" width="80"/>
        <el-table-column label="用户名" width="180">
          <template #default="{ row }">
            <div class="table-username">
              <el-avatar :size="30" :src="store.avatarUserUrl(row.avatar)"/>
              <div>{{ row.username }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="角色" width="100" align="center">
          <template #default="{ row }">
            <el-tag type="danger" v-if="row.role === 'admin'">管理员</el-tag>
            <el-tag v-else>普通用户</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="email" label="电子邮件"/>
        <el-table-column label="注册时间">
          <template #default="{ row }">
            {{ new Date(row.registerTime).toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column label="状态" align="center">
          <template #default="{ row }">
            {{userStatus(row)}}
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="120">
          <template #default="{ row }">
            <el-button type="success" size="small" :icon="EditPen"
                       @click="openUserEditor(row)"
                       :disabled="row.role === 'admin'">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页组件 -->
      <div style="margin-top: 15px; display: flex; justify-content: center">
        <el-pagination
            v-model:current-page="userTable.page"
            v-model:page-size="userTable.size"
            :page-sizes="[5, 10, 20, 50]"
            :total="userTable.total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="loadUserList"
            @current-change="loadUserList"
        />
      </div>
    </el-card>

    <!-- 编辑对话框 -->
    <el-dialog v-model="editor.display" title="编辑用户信息" width="500" draggable>
      <el-form :model="editor.temp" label-width="80px" ref="formRef">
        <el-form-item label="用户名">
          <el-input v-model="editor.temp.username"/>
        </el-form-item>
        <el-form-item label="电子邮件">
          <el-input v-model="editor.temp.email"/>
        </el-form-item>
        <div style="display: flex;font-size: 14px;gap: 20px">
          <div>
            <span style="margin-right: 10px">禁言</span>
            <el-switch v-model="editor.temp.mute"/>
          </div>
          <el-divider style="height: 30px" direction="vertical"/>
          <div>
            <span style="margin-right: 10px">账号封禁</span>
            <el-switch v-model="editor.temp.banned"/>
          </div>
        </div>
        <div style="margin-top: 10px;color: #606266;font-size: 14px">
          注册时间: {{ new Date(editor.temp.registerTime).toLocaleString() }}
        </div>
        <el-divider/>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editor.display = false">取消</el-button>
          <el-button type="primary" @click="saveUserDetail">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="less" scoped>
.user-admin{
  .title{
    font-weight: bold;
  }

  .desc{
    color: #bababa;
    font-size: 13px;
    margin-bottom: 20px;
  }

  .table-username {
    height: 30px;
    display: flex;
    align-items: center;
    gap: 15px;
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

.desc{
  color: #bababa;
  font-size: 13px;
  margin-bottom: 20px;
}

</style>