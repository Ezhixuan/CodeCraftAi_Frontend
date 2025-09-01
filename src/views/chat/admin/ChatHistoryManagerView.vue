<template>
  <div class="chat-history-manager">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>对话历史管理</h2>
    </div>

    <!-- 搜索表单 -->
    <a-card class="search-card" title="搜索条件">
      <a-form :model="searchForm" layout="inline" @finish="handleSearch" @reset="handleReset">
        <a-form-item label="对话ID" name="id">
          <a-input v-model:value="searchForm.id" placeholder="请输入对话ID" style="width: 150px" />
        </a-form-item>

        <a-form-item label="应用ID" name="appId">
          <a-input
            v-model:value="searchForm.appId"
            placeholder="请输入应用ID"
            style="width: 150px"
          />
        </a-form-item>

        <a-form-item label="用户ID" name="userId">
          <a-input
            v-model:value="searchForm.userId"
            placeholder="请输入用户ID"
            style="width: 150px"
          />
        </a-form-item>

        <a-form-item label="消息类型" name="messageType">
          <a-select
            v-model:value="searchForm.messageType"
            placeholder="请选择消息类型"
            style="width: 120px"
            allow-clear
          >
            <a-select-option value="user">用户消息</a-select-option>
            <a-select-option value="ai">AI回复</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="创建时间" name="dateRange">
          <a-range-picker
            v-model:value="searchForm.dateRange"
            style="width: 240px"
            format="YYYY-MM-DD"
            placeholder="[开始时间, 结束时间]"
          />
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
    </a-card>

    <!-- 对话历史列表 -->
    <a-card class="table-card" title="对话历史列表">
      <a-table
        :columns="columns"
        :data-source="chatList"
        :pagination="pagination"
        :loading="loading"
        row-key="id"
        @change="handleTableChange"
        :scroll="{ x: 1200 }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'messageType'">
            <a-tag :color="record.messageType === 'user' ? 'blue' : 'green'">
              {{ record.messageType === 'user' ? '用户消息' : 'AI回复' }}
            </a-tag>
          </template>

          <template v-if="column.key === 'content'">
            <div class="message-content">
              <a-typography-text
                :ellipsis="{ rows: 2, expandable: true, symbol: '展开' }"
                :content="record.message"
              >
                {{ record.message }}
              </a-typography-text>
            </div>
          </template>

          <template v-if="column.key === 'appInfo'">
            <div v-if="record.appId">
              <div class="app-name">应用 {{ record.appId }}</div>
              <div class="app-id">ID: {{ record.appId }}</div>
            </div>
            <span v-else class="text-gray">-</span>
          </template>

          <template v-if="column.key === 'userInfo'">
            <div v-if="record.userId">
              <div class="user-name">用户 {{ record.userId }}</div>
              <div class="user-id">ID: {{ record.userId }}</div>
            </div>
            <span v-else class="text-gray">-</span>
          </template>

          <template v-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="viewChatDetail(record)">
                查看详情
              </a-button>
              <a-button type="link" size="small" danger @click="() => deleteChatRecord(record)">
                删除
              </a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 对话详情模态框 -->
    <a-modal v-model:open="chatDetailVisible" title="对话详情" width="800px" :footer="null">
      <div v-if="currentChat" class="chat-detail">
        <!-- 基本信息 -->
        <div class="chat-header-section">
          <div class="chat-basic-info">
            <h3>对话记录 #{{ currentChat.id }}</h3>
            <div class="chat-meta">
              <a-tag :color="currentChat.messageType === 'USER' ? 'blue' : 'green'">
                {{ currentChat.messageType === 'USER' ? '用户消息' : 'AI回复' }}
              </a-tag>
              <span class="create-time">{{ currentChat.createTime }}</span>
            </div>
          </div>
        </div>

        <!-- 关联信息 -->
        <a-descriptions :column="2" bordered style="margin-bottom: 24px">
          <a-descriptions-item label="对话ID">{{ currentChat.id }}</a-descriptions-item>
          <a-descriptions-item label="应用ID">{{ currentChat.appId || '-' }}</a-descriptions-item>
          <a-descriptions-item label="用户ID">{{ currentChat.userId || '-' }}</a-descriptions-item>
          <a-descriptions-item label="消息类型">
            <a-tag :color="currentChat.messageType === 'USER' ? 'blue' : 'green'">
              {{ currentChat.messageType === 'USER' ? '用户消息' : 'AI回复' }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="创建时间" :span="2">{{
            currentChat.createTime
          }}</a-descriptions-item>
        </a-descriptions>

        <!-- 消息内容 -->
        <div class="chat-content-section">
          <h4>消息内容</h4>
          <div class="chat-content">
            <pre>{{ currentChat.message }}</pre>
          </div>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import type { TableColumnsType, TableProps } from 'ant-design-vue'
import { message, Modal } from 'ant-design-vue'
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons-vue'
import type { Dayjs } from 'dayjs'
import { adminList } from '@/api/duihualishi'
import DateUtil from '@/utils/DateUtil.ts'

// 搜索表单
const searchForm = reactive<{
  pageNo: number
  pageSize: number
  id?: string
  appId: string
  userId?: string
  messageType?: string
  dateRange?: [Dayjs, Dayjs]
  startTime?: string
  endTime?: string
}>({
  pageNo: 1,
  pageSize: 10,
  id: undefined,
  appId: '-1',
  userId: undefined,
  messageType: undefined,
  dateRange: undefined,
  startTime: undefined,
  endTime: undefined,
})

// 对话历史列表数据
const chatList = ref<API.ChatInfoResVo[]>([])
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
    fixed: 'left',
  },
  {
    title: '消息类型',
    dataIndex: 'messageType',
    key: 'messageType',
    width: 100,
  },
  {
    title: '消息内容',
    dataIndex: 'content',
    key: 'content',
    width: 300,
  },
  {
    title: '应用信息',
    key: 'appInfo',
    width: 150,
  },
  {
    title: '用户信息',
    key: 'userInfo',
    width: 150,
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

// 对话详情
const chatDetailVisible = ref(false)
const currentChat = ref<API.ChatInfoResVo | null>(null)

// 获取对话历史列表
const getChatList = async () => {
  try {
    loading.value = true

    // 处理日期范围
    if (searchForm.dateRange && searchForm.dateRange.length === 2) {
      searchForm.startTime = searchForm.dateRange[0].format(DateUtil.getDefaultFormat())
      searchForm.endTime = searchForm.dateRange[1].format(DateUtil.getDefaultFormat())
    } else {
      searchForm.startTime = undefined
      searchForm.endTime = undefined
    }

    const res = await adminList({
      reqVo: {
        pageNo: searchForm.pageNo,
        pageSize: searchForm.pageSize,
        appId: searchForm.appId || '-1',
        userId: searchForm.userId,
        startTime: searchForm.startTime,
        endTime: searchForm.endTime,
        id: searchForm.id,
        messageType: searchForm.messageType,
      },
    })

    if (res.data?.data) {
      chatList.value = res.data.data.list || []
      total.value = Number(res.data.data.totalRow) || 0
    }
  } catch (error) {
    console.error('获取对话历史列表失败:', error)
    message.error('获取对话历史列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索处理
const handleSearch = () => {
  searchForm.pageNo = 1
  getChatList()
}

// 重置搜索
const handleReset = () => {
  Object.assign(searchForm, {
    pageNo: 1,
    pageSize: 10,
    id: undefined,
    appId: undefined,
    userId: undefined,
    messageType: undefined,
    dateRange: undefined,
    startTime: undefined,
    endTime: undefined,
  })
  getChatList()
}

// 表格变化处理
const handleTableChange: TableProps['onChange'] = (pag) => {
  if (pag) {
    searchForm.pageNo = pag.current || 1
    searchForm.pageSize = pag.pageSize || 10
    getChatList()
  }
}

// 查看对话详情
const viewChatDetail = (chat: API.ChatInfoResVo) => {
  currentChat.value = chat
  chatDetailVisible.value = true
}

// 删除对话记录
const deleteChatRecord = (record: API.ChatInfoResVo) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除ID为 ${record.id} 的对话记录吗？此操作不可恢复。`,
    onOk: async () => {
      try {
        // TODO: 实现删除API调用
        // await deleteChatApi({ id: record.id })
        console.log('删除对话记录:', record.id)
        message.success('对话记录删除成功')
        getChatList() // 刷新列表
      } catch (error) {
        console.error('删除对话记录失败:', error)
        message.error('删除对话记录失败')
      }
    },
  })
}

// 页面初始化
onMounted(() => {
  getChatList()
})
</script>

<style scoped>
.chat-history-manager {
  padding: 24px;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h2 {
  margin: 0;
  color: #262626;
  font-size: 24px;
  font-weight: 600;
}

.search-card,
.table-card {
  margin-bottom: 16px;
}

.message-content {
  max-width: 300px;
}

.app-name,
.user-name {
  font-weight: 500;
  color: #262626;
}

.app-id,
.user-id {
  font-size: 12px;
  color: #8c8c8c;
}

.text-gray {
  color: #8c8c8c;
}

.chat-detail {
  padding: 16px 0;
}

.chat-header-section {
  margin-bottom: 24px;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
}

.chat-basic-info h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
}

.chat-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.create-time {
  color: #666;
  font-size: 14px;
}

.chat-content-section {
  margin-bottom: 24px;
  padding: 16px;
  background: #f9f9f9;
  border-radius: 8px;
  border-left: 4px solid #1890ff;
}

.chat-content-section h4 {
  margin: 0 0 12px 0;
  color: #1890ff;
  font-size: 14px;
  font-weight: 600;
}

.chat-content {
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  padding: 12px;
  max-height: 300px;
  overflow-y: auto;
}

.chat-content pre {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 14px;
  line-height: 1.5;
  color: #333;
}

:deep(.ant-table) {
  .ant-table-thead > tr > th {
    background-color: #fafafa;
    font-weight: 600;
  }
}

:deep(.ant-descriptions-item-label) {
  font-weight: 600;
  background-color: #fafafa;
}

:deep(.ant-typography) {
  margin-bottom: 0;
}
</style>
