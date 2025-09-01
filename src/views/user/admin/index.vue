<template>
  <AdminPageWrapper title="用户管理">
    <!-- 搜索表单 -->
    <template #searchForm>
      <a-form :model="searchForm" layout="inline" @finish="handleSearch" @reset="handleReset">
        <a-form-item label="用户ID" name="id">
          <a-input-number
            v-model:value="searchForm.id"
            placeholder="请输入用户ID"
            style="width: 150px"
          />
        </a-form-item>

        <a-form-item label="用户名称" name="name">
          <a-input
            v-model:value="searchForm.name"
            placeholder="请输入用户名称"
            style="width: 200px"
          />
        </a-form-item>

        <a-form-item label="用户状态" name="status">
          <a-select
            v-model:value="searchForm.status"
            placeholder="请选择状态"
            style="width: 120px"
            allow-clear
          >
            <a-select-option :value="1">正常</a-select-option>
            <a-select-option :value="0">禁用</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="用户角色" name="role">
          <a-select
            v-model:value="searchForm.role"
            placeholder="请选择角色"
            style="width: 150px"
            allow-clear
          >
            <a-select-option value="USER">普通用户</a-select-option>
            <a-select-option value="ADMIN">管理员</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item>
          <a-space>
            <a-button type="primary" html-type="submit" :loading="loading">
              <SearchOutlined /> 搜索
            </a-button>
            <a-button html-type="reset"> <ReloadOutlined /> 重置 </a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </template>

    <!-- 操作按钮 -->
    <template #actions>
      <a-space>
        <a-button type="primary" @click="showAddByAccountModal">
          <PlusOutlined /> 批量创建用户(按账号)
        </a-button>
        <a-button type="primary" @click="showAddBySizeModal">
          <PlusOutlined /> 批量创建用户(按数量)
        </a-button>
        <a-button type="default" @click="exportCreatedUsers" :disabled="createdUsers.length === 0">
          <DownloadOutlined /> 导出创建的用户
        </a-button>
      </a-space>
    </template>

    <!-- 用户列表 -->
    <template #default>
      <a-table
        :columns="columns"
        :data-source="userList"
        :pagination="pagination"
        :loading="loading"
        row-key="id"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="record.status === 1 ? 'green' : 'red'">
              {{ record.status === 1 ? '正常' : '禁用' }}
            </a-tag>
          </template>

          <template v-if="column.key === 'role'">
            <a-tag :color="record.role === 'ADMIN' ? 'blue' : 'default'">
              {{ record.role === 'ADMIN' ? '管理员' : '普通用户' }}
            </a-tag>
          </template>

          <template v-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="viewUser(record)"> 查看 </a-button>
              <a-button
                type="link"
                size="small"
                danger
                @click="disableUser(record)"
                :disabled="record.status === 0"
              >
                禁用
              </a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </template>

    <!-- 模态框 -->
    <template #modals>
      <!-- 按账号批量创建用户模态框 -->
      <a-modal
        v-model:open="addByAccountVisible"
        title="批量创建用户(按账号)"
        width="600px"
        @ok="handleAddByAccount"
        :confirm-loading="addLoading"
      >
        <a-form :model="addByAccountForm" layout="vertical">
          <a-form-item label="用户账号列表">
            <a-textarea
              v-model:value="addByAccountForm.accounts"
              placeholder="请输入用户账号，每行一个账号"
              :rows="6"
            />
            <div class="form-tip">每行输入一个账号，系统将自动生成密码</div>
          </a-form-item>
        </a-form>
      </a-modal>

      <!-- 按数量批量创建用户模态框 -->
      <a-modal
        v-model:open="addBySizeVisible"
        title="批量创建用户(按数量)"
        width="400px"
        @ok="handleAddBySize"
        :confirm-loading="addLoading"
      >
        <a-form :model="addBySizeForm" layout="vertical">
          <a-form-item label="创建数量">
            <a-input-number
              v-model:value="addBySizeForm.size"
              :min="1"
              :max="1000"
              placeholder="请输入要创建的用户数量"
              style="width: 100%"
            />
            <div class="form-tip">系统将自动生成账号和密码，最多支持1000个</div>
          </a-form-item>
        </a-form>
      </a-modal>

      <!-- 用户详情模态框 -->
      <a-modal v-model:open="userDetailVisible" title="用户详情" width="600px" :footer="null">
        <div v-if="currentUser" class="user-detail">
          <!-- 用户头像 -->
          <div class="user-avatar-section">
            <UserAvatar :size="80" :user-id="currentUser.id" />
            <div class="user-basic-info">
              <h3>{{ currentUser.name || currentUser.account }}</h3>
              <p class="user-account">@{{ currentUser.account }}</p>
            </div>
          </div>

          <!-- 用户简介 -->
          <div class="user-profile-section" v-if="currentUser.profile">
            <h4>用户简介</h4>
            <p class="user-profile">{{ currentUser.profile }}</p>
          </div>

          <!-- 详细信息 -->
          <a-descriptions :column="2" bordered>
            <a-descriptions-item label="用户ID">{{ currentUser.id }}</a-descriptions-item>
            <a-descriptions-item label="邮箱">{{
              currentUser.email || '未设置'
            }}</a-descriptions-item>
            <a-descriptions-item label="状态">
              <a-tag :color="currentUser.status === 1 ? 'green' : 'red'">
                {{ currentUser.status === 1 ? '正常' : '禁用' }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="角色">
              <a-tag :color="currentUser.role === 'ADMIN' ? 'blue' : 'default'">
                {{ currentUser.role === 'ADMIN' ? '管理员' : '普通用户' }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="创建时间" :span="2">
              {{ currentUser.createTime }}
            </a-descriptions-item>
            <a-descriptions-item label="更新时间" :span="2">
              {{ currentUser.updateTime }}
            </a-descriptions-item>
          </a-descriptions>
        </div>
      </a-modal>

      <!-- 创建用户结果展示模态框 -->
      <a-modal v-model:open="showCreatedUsersModal" title="用户创建成功" width="800px" :footer="null">
        <div class="created-users-result">
          <a-alert
            message="用户创建成功"
            :description="`成功创建 ${currentCreatedUsers.length} 个用户，请妥善保存账号密码信息`"
            type="success"
            show-icon
            style="margin-bottom: 16px"
          />

          <div class="result-actions" style="margin-bottom: 16px">
            <a-space>
              <a-button type="primary" @click="exportCreatedUsers()">
                <DownloadOutlined /> 导出当前创建的用户
              </a-button>
              <a-button
                @click="exportAllCreatedUsers()"
                v-if="createdUsers.length > currentCreatedUsers.length"
              >
                <DownloadOutlined /> 导出本次所有创建的用户 ({{ createdUsers.length }}个)
              </a-button>
            </a-space>
          </div>

          <a-table
            :columns="createdUsersColumns"
            :data-source="currentCreatedUsers"
            :pagination="false"
            size="small"
            bordered
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'password'">
                <a-typography-text copyable>{{ record.password }}</a-typography-text>
              </template>
              <template v-if="column.key === 'account'">
                <a-typography-text copyable>{{ record.account }}</a-typography-text>
              </template>
            </template>
          </a-table>
        </div>
      </a-modal>
    </template>
  </AdminPageWrapper>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import type { TableColumnsType, TableProps } from 'ant-design-vue'
import { message, Modal } from 'ant-design-vue'
import {
  DownloadOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
} from '@ant-design/icons-vue'
import {
  adminAddByAccount,
  adminAddBySize,
  adminDisable,
  adminGetList,
} from '@/api/userController.ts'
import UserAvatar from '@/components/User/Avatar/index.vue'
import AdminPageWrapper from '@/components/AdminPageWrapper.vue'

// 搜索表单
const searchForm = reactive<API.UserQueryReqVo>({
  pageNo: 1,
  pageSize: 10,
  id: undefined,
  name: undefined,
  status: undefined,
  role: undefined,
})

// 用户列表数据
const userList = ref<API.UserInfoAdminResVo[]>([])
const loading = ref(false)
const total = ref(0)

// 分页配置
const pagination = computed(() => ({
  current: searchForm.pageNo,
  pageSize: searchForm.pageSize,
  total: total.value,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number, range: [number, number]) =>
    `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
}))

// 表格列配置
const columns: TableColumnsType = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    width: 80,
  },
  {
    title: '账号',
    dataIndex: 'account',
    key: 'account',
    width: 150,
  },
  {
    title: '昵称',
    dataIndex: 'name',
    key: 'name',
    width: 120,
  },
  {
    title: '邮箱',
    dataIndex: 'email',
    key: 'email',
    width: 200,
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100,
  },
  {
    title: '角色',
    dataIndex: 'role',
    key: 'role',
    width: 120,
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    key: 'createTime',
    width: 180,
  },
  {
    title: '操作',
    key: 'action',
    width: 150,
    fixed: 'right',
  },
]

// 批量创建相关
const addByAccountVisible = ref(false)
const addBySizeVisible = ref(false)
const addLoading = ref(false)
const createdUsers = ref<API.UserAddResVo[]>([])
const showCreatedUsersModal = ref(false)
const currentCreatedUsers = ref<API.UserAddResVo[]>([])

const addByAccountForm = reactive({
  accounts: '',
})

const addBySizeForm = reactive({
  size: 1,
})

// 用户详情
const userDetailVisible = ref(false)
const currentUser = ref<API.UserInfoAdminResVo | null>(null)

// 获取用户列表
const getUserList = async () => {
  try {
    loading.value = true
    const res = await adminGetList({
      queryReqVo: searchForm,
    })

    if (res.data.data) {
      userList.value = res.data.data.list || []
      total.value = Number(res.data.data.totalRow) || 0
    }
  } catch (error) {
    console.error('获取用户列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 搜索处理
const handleSearch = () => {
  searchForm.pageNo = 1
  getUserList()
}

// 重置搜索
const handleReset = () => {
  Object.assign(searchForm, {
    pageNo: 1,
    pageSize: 10,
    id: undefined,
    name: undefined,
    status: undefined,
    role: undefined,
  })
  getUserList()
}

// 表格变化处理
const handleTableChange: TableProps['onChange'] = (pag) => {
  if (pag) {
    searchForm.pageNo = pag.current || 1
    searchForm.pageSize = pag.pageSize || 10
    getUserList()
  }
}

// 显示按账号创建模态框
const showAddByAccountModal = () => {
  addByAccountForm.accounts = ''
  addByAccountVisible.value = true
}

// 显示按数量创建模态框
const showAddBySizeModal = () => {
  addBySizeForm.size = 1
  addBySizeVisible.value = true
}

// 按账号批量创建用户
const handleAddByAccount = async () => {
  if (!addByAccountForm.accounts.trim()) {
    message.error('请输入用户账号')
    return
  }

  try {
    addLoading.value = true
    const accounts = addByAccountForm.accounts
      .split('\n')
      .map((account) => account.trim())
      .filter((account) => account)

    const userAddReqs: API.UserAddReqVo[] = accounts.map((account) => ({
      account,
      name: account, // 默认昵称为账号
    }))

    const response = await adminAddByAccount(userAddReqs)

    if (response.data.data?.list) {
      currentCreatedUsers.value = response.data.data.list
      createdUsers.value.push(...response.data.data.list)
      message.success(`成功创建 ${response.data.data.totalPage} 个用户`)
      addByAccountVisible.value = false
      showCreatedUsersModal.value = true // 显示创建结果
      getUserList() // 刷新列表
    }
  } catch (error) {
    console.error('批量创建用户失败:', error)
  } finally {
    addLoading.value = false
  }
}

// 按数量批量创建用户
const handleAddBySize = async () => {
  if (!addBySizeForm.size || addBySizeForm.size < 1) {
    message.error('请输入有效的创建数量')
    return
  }

  try {
    addLoading.value = true
    const response = await adminAddBySize({
      size: addBySizeForm.size,
    })

    if (response.data.data?.list) {
      currentCreatedUsers.value = response.data.data.list
      createdUsers.value.push(...response.data.data.list)
      message.success(`成功创建 ${response.data.data.list.length} 个用户`)
      addBySizeVisible.value = false
      showCreatedUsersModal.value = true // 显示创建结果
      getUserList() // 刷新列表
    }
  } catch (error) {
    console.error('批量创建用户失败:', error)
  } finally {
    addLoading.value = false
  }
}

// 查看用户详情
const viewUser = (user: API.UserInfoAdminResVo) => {
  currentUser.value = user
  userDetailVisible.value = true
}

// 禁用用户
const disableUser = (user: API.UserInfoAdminResVo) => {
  Modal.confirm({
    title: '确认禁用',
    content: `确定要禁用用户 "${user.name}" 吗？`,
    onOk: async () => {
      try {
        await adminDisable({ disableId: user.id! })
        message.success('用户禁用成功')
        getUserList() // 刷新列表
      } catch (error) {
        console.error('禁用用户失败:', error)
      }
    },
  })
}

// 导出创建的用户数据
const exportCreatedUsers = (users: API.UserAddResVo[] = currentCreatedUsers.value) => {
  if (users.length === 0) {
    message.warning('暂无可导出的用户数据')
    return
  }

  // 生成CSV内容
  const csvContent = [
    ['账号', '密码'], // 表头
    ...users.map((user) => [user.account, user.password]),
  ]
    .map((row) => row.join(','))
    .join('\n')

  // 创建下载链接
  const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', `created_users_${new Date().getTime()}.csv`)
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  message.success('用户数据导出成功')
}

// 导出所有历史创建的用户
const exportAllCreatedUsers = () => {
  exportCreatedUsers(createdUsers.value)
}

// 创建用户结果表格列配置
const createdUsersColumns = [
  {
    title: '账号',
    dataIndex: 'account',
    key: 'account',
    width: '50%',
  },
  {
    title: '密码',
    dataIndex: 'password',
    key: 'password',
    width: '50%',
  },
]

// 页面初始化
onMounted(() => {
  getUserList()
})
</script>

<style scoped>
.form-tip {
  margin-top: 4px;
  color: #8c8c8c;
  font-size: 12px;
}

.user-detail {
  padding: 16px 0;
}

.user-avatar-section {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
}

.user-basic-info {
  margin-left: 16px;
}

.user-basic-info h3 {
  margin: 0 0 4px 0;
  font-size: 18px;
  font-weight: 600;
}

.user-account {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.user-profile-section {
  margin-bottom: 24px;
  padding: 16px;
  background: #f9f9f9;
  border-radius: 8px;
  border-left: 4px solid #1890ff;
}

.user-profile-section h4 {
  margin: 0 0 8px 0;
  color: #1890ff;
  font-size: 14px;
  font-weight: 600;
}

.user-profile {
  margin: 0;
  line-height: 1.6;
  color: #333;
}

.created-users-result {
  padding: 8px 0;
}

.result-actions {
  text-align: center;
}
</style>