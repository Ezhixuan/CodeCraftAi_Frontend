<template>
  <div class="code-message-view" :key="navKey">
    <AppNavBar
      v-if="appId"
      :sys-app-info="appInfo"
      :is-owner="isOwner"
      @logoMouseOver="handleLogoMouseOver"
    />
    <div class="code-message-container" :key="contentKey">
      <a-drawer
        :open="isVisibleOfDrawer"
        :closable="false"
        placement="left"
        :get-container="false"
        @close="handleLogoMouseLeave"
        :style="{ position: 'absolute' }"
      >
        <div class="drawer-content">
          <!-- 顶部区域：新建应用和跳转首页 -->
          <div class="drawer-header">
            <a-space direction="vertical" size="small" style="width: 100%">
              <a-button type="primary" block @click="handleCreateApp">
                <template #icon><PlusOutlined /></template>
                新建应用
              </a-button>
            </a-space>
          </div>

          <!-- 中间区域：应用列表 -->
          <div class="drawer-body" @scroll="handleAppListScroll">
            <div class="app-list-section">
              <h4>我的应用</h4>
              <a-spin :spinning="appList.isLoading.value">
                <div
                  v-if="appList.data.value.length === 0 && !appList.isLoading.value"
                  class="empty-state"
                >
                  <div class="empty-icon">📱</div>
                  <p>暂无应用</p>
                  <a-button type="link" @click="handleCreateApp">创建第一个应用</a-button>
                </div>
                <div v-else>
                  <a-list :data-source="appList.data.value" size="small">
                    <template #renderItem="{ item }">
                      <a-list-item class="app-item" @click="handleAppClick(item)">
                        <a-list-item-meta>
                          <template #avatar>
                            <a-avatar :src="item.cover" shape="square">
                              {{ item.name?.charAt(0) || 'A' }}
                            </a-avatar>
                          </template>
                          <template #title>
                            <div class="app-title">{{ item.name }}</div>
                          </template>
                          <template #description>
                            <div class="app-time">
                              {{ DateUtil.formatAppTime(item.updateTime) }}
                            </div>
                          </template>
                        </a-list-item-meta>
                      </a-list-item>
                    </template>
                  </a-list>

                  <!-- 加载更多指示器 -->
                  <div v-if="appList.isLoading.value" class="load-more-indicator">
                    <a-spin size="small" />
                    <span>加载中...</span>
                  </div>

                  <!-- 没有更多数据指示器 -->
                  <div
                    v-if="!appList.hasMore && appList.data.value.length > 0"
                    class="no-more-indicator"
                  >
                    没有更多应用了
                  </div>
                </div>
              </a-spin>
            </div>
          </div>

          <!-- 底部区域：用户信息 -->
          <div class="drawer-footer">
            <div v-if="loginUserStore.isLogin()" class="user-info">
              <a-avatar :src="loginUserStore.loginUser.avatar" size="small">
                {{ loginUserStore.loginUser.name?.charAt(0) || 'U' }}
              </a-avatar>
              <div class="user-details">
                <div class="user-name">{{ loginUserStore.loginUser.name }}</div>
                <div class="user-role">
                  {{ loginUserStore.getRoleText(loginUserStore.loginUser.role) }}
                </div>
              </div>
            </div>
            <div v-else class="login-prompt">
              <a-button type="link" @click="handleLogin">登录</a-button>
            </div>
          </div>
        </div>
      </a-drawer>

      <div class="main-content">
        <div class="left-panel">
          <div class="chat-section">
            <div class="chat-header">
              <div class="header-left">
                <h3>与 AI 对话</h3>
                <div class="conversation-info" v-if="conversationStats.messageCount > 0">
                  <span>{{ conversationStats.messageCount }} 条对话</span>
                  <span v-if="conversationStats.lastGenerationTime">
                    耗时 {{ conversationStats.lastGenerationTime }}s
                  </span>
                </div>
              </div>
              <div class="status-indicator">
                <a-spin v-if="chat.isLoading.value" size="small" />
                <a-tag :color="statusColor">{{ statusText }}</a-tag>
              </div>
            </div>

            <div class="chat-container">
              <div class="message-list" ref="messageListRef" @scroll="handleChatScroll">
                <!-- 加载更多按钮 -->
                <div
                  v-if="
                    chat.hasMoreHistory.value &&
                    chat.messages.value.length >= chat.historyPageSize.value
                  "
                  class="load-more-section"
                >
                  <a-button
                    v-if="!chat.isLoadingHistory.value"
                    type="dashed"
                    block
                    @click="loadChatHistory(true, appId)"
                    class="load-more-btn"
                  >
                    <template #icon><ReloadOutlined /></template>
                    加载更多历史消息
                  </a-button>
                  <div v-else class="loading-more">
                    <a-spin size="small" />
                    <span>加载中...</span>
                  </div>
                </div>
                <div v-if="chat.messages.value.length === 0" class="message ai-message">
                  <div class="message-avatar">
                    <img src="@/assets/codeAi 无背景.png" alt="AI" class="ai-avatar" />
                  </div>
                  <div class="message-content">
                    <MarkdownReader :content="welcomeMessage" />
                  </div>
                </div>

                <div
                  v-for="(message, index) in chat.messages.value"
                  :key="message.id"
                  :class="['message', message.type === 'user' ? 'user-message' : 'ai-message']"
                >
                  <div class="message-avatar">
                    <div v-if="message.type === 'user'" class="user-avatar">👤</div>
                    <img v-else src="@/assets/codeAi 无背景.png" alt="AI" class="ai-avatar" />
                  </div>

                  <div class="message-content">
                    <MarkdownReader :content="message.content" />
                    <div v-if="message.isLoading" class="generating-indicator">
                      <a-spin size="small" />
                      <span>{{ generatingText }}</span>
                    </div>
                    <div
                      class="message-actions"
                      v-if="message.type === 'ai' && !message.isLoading && message.content"
                    >
                      <a-button size="small" type="text" @click="copyToClipboard(message.content)">
                        <template #icon><CopyOutlined /></template>
                        复制代码
                      </a-button>
                      <a-button size="small" type="text" @click="regenerateResponse(index)">
                        <template #icon><ReloadOutlined /></template>
                        重新生成
                      </a-button>
                    </div>
                    <div class="message-time" v-if="!message.isLoading">
                      {{ formatTime(message.timestamp) }}
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="isOwner" class="chat-input-area">
                <Input
                  v-model="newMessage"
                  fontSize="16px"
                  :required="true"
                  :show-submit-button="true"
                  submit-button-text="发送"
                  :enable-typewriter="true"
                  :placeholder-array="['您正在与CodeCraft进行对话，您可以描述您的需求']"
                  background-color="#000000"
                  :multiline="true"
                  :height="200"
                  :disabled="chat.isLoading.value"
                  @submit="sendMessage"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="right-panel">
          <div class="preview-section">
            <div class="preview-header">
              <h3>应用预览</h3>
              <div class="preview-actions">
                <!-- 只有当originalDirStatus为LOADED时才显示按钮 -->
                <template v-if="appStatus.originalDirStatus === 'LOADED'">
                  <a-button
                    v-if="preview.url"
                    size="small"
                    type="text"
                    @click="openPreviewInNewTab"
                  >
                    <template #icon><ExportOutlined /></template>
                    新窗口打开
                  </a-button>
                  <!-- 预览按钮 -->
                  <a-button
                    type="primary"
                    :loading="preview.isLoading.value || appStatus.previewStatus === 'LOADING'"
                    @click="handlePreviewClick"
                    :disabled="!isOwner"
                    size="small"
                  >
                    <template #icon><RocketOutlined /></template>
                    {{
                      appStatus.previewStatus === 'LOADING'
                        ? '预览中...'
                        : preview.isLoading.value
                          ? '预览中...'
                          : '预览'
                    }}
                  </a-button>

                  <!-- 部署按钮 -->
                  <a-button
                    type="default"
                    :loading="appStatus.loading && appStatus.deployStatus === 'LOADING'"
                    @click="handleDeployClick"
                    :disabled="!isOwner || appStatus.previewStatus === 'LOADING'"
                    size="small"
                  >
                    {{
                      appStatus.deployStatus === 'LOADING'
                        ? '部署中'
                        : appStatus.deployStatus === 'LOADED'
                          ? '重新部署'
                          : '部署'
                    }}
                  </a-button>

                  <!-- 下载按钮 -->
                  <a-button
                    type="default"
                    :loading="downloadLoading"
                    @click="handleDownloadClick"
                    :disabled="!isOwner"
                    size="small"
                  >
                    <template #icon><DownloadOutlined /></template>
                    {{ downloadLoading ? '下载中...' : '下载代码' }}
                  </a-button>
                </template>
              </div>
            </div>
            <div class="preview-content">
              <!-- 加载状态 -->
              <div
                v-if="appStatus.previewStatus === 'LOADING' || preview.isLoading.value"
                class="loading-container"
              >
                <a-spin size="large">
                  <template #indicator>
                    <LoadingOutlined style="font-size: 24px" spin />
                  </template>
                </a-spin>
                <p class="loading-text">{{ preview.progressText.value || '正在生成预览...' }}</p>
              </div>

              <!-- 错误状态 -->
              <div v-else-if="appStatus.previewStatus === 'ERROR'" class="error-container">
                <ExclamationCircleOutlined class="error-icon" />
                <p class="error-text">预览生成失败</p>
                <a-button type="primary" @click="handlePreviewClick" :disabled="!isOwner">
                  重新预览
                </a-button>
              </div>

              <!-- 预览iframe -->
              <div
                v-else-if="
                  preview.url.value && preview.preview.value && appStatus.previewStatus === 'LOADED'
                "
                class="iframe-container"
              >
                <iframe
                  :src="preview.url.value"
                  frameborder="0"
                  width="100%"
                  height="100%"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                ></iframe>
              </div>

              <!-- 默认占位符 -->
              <div v-else class="deploy-placeholder">
                <div class="placeholder-content">
                  <RocketOutlined class="placeholder-icon" />
                  <p v-if="appStatus.originalDirStatus !== 'LOADED'">请先生成代码后再进行预览</p>
                  <p v-else>点击预览按钮生成应用预览</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message, Modal } from 'ant-design-vue'
import {
  CopyOutlined,
  DownloadOutlined,
  ExclamationCircleOutlined,
  ExportOutlined,
  LoadingOutlined,
  PlusOutlined,
  ReloadOutlined,
  RocketOutlined,
} from '@ant-design/icons-vue'
import AppNavBar from '@/views/app/components/AppNavBar.vue'
import MarkdownReader from '@/components/Markdown/index.vue'
import Input from '@/components/Input/index.vue'
import { getInfo, getList } from '@/api/appController.ts'
import { doDeploy, doPreview } from '@/api/appCoreController.ts'
import { list1 } from '@/api/chatHistoryController.ts'
import { useLoginUserStore } from '@/stores/loginUser'
import { getBaseUrl } from '@/config/env.ts'
import DateUtil from '@/utils/DateUtil.ts'

interface ChatMessage {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: number
  isLoading?: boolean
}

interface App {
  id: string | undefined
  data: API.AppInfoCommonResVo
  isOwner: boolean
  isLoading: boolean
}

// 统一的应用相关变量
const app = ref<App>()
const appList = {
  data: ref<API.AppInfoCommonResVo[]>([]),
  isLoading: ref(false),
  isLoadingMore: ref(false),
  hasMore: ref(true),
  currentHasMore: ref(true),
  currentIndex: ref(''),
  lastIndex: ref(''),
  lastId: ref(''),
  // 数据补全配置
  minInitialSize: ref(20), // 最小初始数据量阈值
}

const chat = {
  messages: ref<ChatMessage[]>([]),
  currentMessageId: ref('-1'),
  currentMessageIndex: ref(-1),
  isLoading: ref(false),
  // 分页相关
  isLoadingHistory: ref(false),
  hasMoreHistory: ref(true),
  historyPageSize: ref(10),
  lastCreateTime: ref<string>(''),
}

const preview = {
  url: ref(''),
  isLoading: ref(false),
  preview: ref(false),
  progressText: ref(''),
}

// 下载状态
const downloadLoading = ref(false)

// 应用状态管理
const appStatus = reactive({
  deployStatus: '' as 'LOADING' | 'LOADED' | 'ERROR' | '',
  previewStatus: '' as 'LOADING' | 'LOADED' | 'ERROR' | '',
  originalDirStatus: '' as 'LOADING' | 'LOADED' | 'ERROR' | '',
  loading: false,
  error: '',
})

const isVisibleOfDrawer = ref(false)
const newMessage = ref('')

const messageListRef = ref<HTMLElement | null>(null)
const navKey = ref('0')
const contentKey = ref(0)
const route = useRoute()
const router = useRouter()
const loginUserStore = useLoginUserStore()
const currentPage = ref(1)
const pageSize = ref(20)
let scrollDebounceTimer: number | null = null
const SCROLL_DEBOUNCE_DELAY = 300 // 防抖延迟时间（毫秒）
const generatingTextIndex = ref(0)

const welcomeMessage = `# 👋 欢迎使用 CodeCraftAI
我是您的 AI 编程助手，可以帮助您快速生成、优化和调试代码。请在下方输入您的需求！`
const generatingTexts = [
  'AI 正在分析您的需求...',
  'AI 正在设计应用架构...',
  'AI 正在编写核心代码...',
  'AI 正在优化代码结构...',
]

const appId = computed(() => {
  return app.value?.id || (route.params.appId as string)
})

const appInfo = computed(() => {
  return app.value?.data
})

const isOwner = computed(() => {
  return app.value?.isOwner || false
})

const generatingText = computed(
  () => generatingTexts[generatingTextIndex.value % generatingTexts.length],
)
const statusText = computed(() => {
  console.log(preview)
  if (chat.isLoading.value) return '生成中'
  if (preview.preview.value) return '可预览'
  if (chat.messages.value.length === 0) return '等待输入'
  return '已完成'
})
const statusColor = computed(() => {
  if (chat.isLoading.value) return 'processing'
  if (preview.preview.value) return 'success'
  return 'default'
})
const conversationStats = computed(() => {
  const userMessages = chat.messages.value.filter((m) => m.type === 'user')
  const lastUserMessage = userMessages.pop()
  let lastGenerationTime = null

  if (lastUserMessage) {
    const subsequentAiMessage = chat.messages.value.find(
      (m) => m.type === 'ai' && m.timestamp > lastUserMessage.timestamp && !m.isLoading,
    )
    if (subsequentAiMessage) {
      lastGenerationTime = Math.round(
        (subsequentAiMessage.timestamp - lastUserMessage.timestamp) / 1000,
      )
    }
  }

  return {
    messageCount: userMessages.length + (lastUserMessage ? 1 : 0),
    lastGenerationTime,
  }
})

const handleLogoMouseOver = () => {
  isVisibleOfDrawer.value = true
  if (loginUserStore.isLogin() && appList.data.value.length === 0) {
    getAppList()
  }
}

const handleLogoMouseLeave = () => {
  isVisibleOfDrawer.value = false
}

onMounted(async () => {
  // 进入页面后初始化数据
  // 1. 获取应用 id
  if (!route.query.appId) {
    message.error('该应用或许不存在')
    await router.push('/')
  }
  const appId = route.query.appId as string
  await initByAppId(appId)

  // 3. 检查URL参数action是否等于1
  const actionParam = Number(route.query.action)
  if (actionParam === 1) {
    const userMessage = route.query.userMessage as string
    if (userMessage) {
      const userMsg = buildMessage('user', userMessage, false)
      chat.messages.value.push(userMsg)
      await startCodeGeneration(userMessage)
      // 生成成功后移除URL中的action=1参数
      await removeActionParam()
    }
  } else if (route.query.userMessage) {
    // 如果有用户消息但action不为1，只添加消息不生成
    const userMessage = route.query.userMessage as string
    const userMsg = buildMessage('user', userMessage, false)
    chat.messages.value.push(userMsg)
  }
})

/**
 * 核心初始化方法
 * 对应用信息以及部署信息进行初始化
 * @param currentAppId 应用id
 */
const initByAppId = async (currentAppId: string) => {
  console.log(currentAppId)
  await getAppInfo(currentAppId)
  await loadChatHistory(false, currentAppId)
  await getAppStatus(currentAppId)
}

/**
 * 获取应用信息
 * @param currentAppId 应用id
 */
const getAppInfo = async (currentAppId: string) => {
  if (!currentAppId) {
    message.error('appId 不存在')
    return
  }
  try {
    const response = await getInfo({ id: currentAppId })
    if (response.data.data) {
      const appInfo = response.data.data
      app.value = {
        id: appInfo.id,
        data: appInfo,
        isOwner: appInfo.userId === loginUserStore.loginUser.id,
        isLoading: false,
      }
    }
  } catch (error) {
    console.error('获取应用信息失败:', error)
    message.error('获取应用信息失败')
  }
}

/**
 * 获取应用状态
 * @param currentAppId 应用id
 */
const getAppStatus = async (currentAppId?: string) => {
  const targetAppId = currentAppId || appId.value
  if (!targetAppId) return
  try {
    appStatus.loading = true
    appStatus.error = ''
    const response = await getStatus({ appId: targetAppId })
    if (response.data.data) {
      const statusData = response.data.data
      appStatus.deployStatus = statusData.deployStatus || ''
      appStatus.previewStatus = statusData.previewStatus || ''
      appStatus.originalDirStatus = statusData.originalDirStatus || ''

      // 更新预览状态
      preview.preview.value = statusData.previewStatus === 'LOADED'
      if (preview.preview.value) {
        preview.url.value = getPreviewUrl()
      }
    }
  } catch (error) {
    console.error('获取应用状态失败:', error)
    appStatus.error = '获取状态失败'
    message.error('获取应用状态失败')
  } finally {
    appStatus.loading = false
  }
}

/**
 * 加载对话历史
 * @param isLoadMore 是否为加载更多模式
 * @param currentAppId
 */
const loadChatHistory = async (isLoadMore = false, currentAppId: string) => {
  console.log('history', currentAppId)
  if (!currentAppId) return

  console.log(currentAppId)
  if (!isLoadMore) {
    // 重置状态
    chat.isLoadingHistory.value = false
    chat.hasMoreHistory.value = true
  }
  console.log('history', chat.isLoadingHistory.value || (!isLoadMore && !chat.hasMoreHistory.value))

  // 防止重复加载
  if (chat.isLoadingHistory.value || (!isLoadMore && !chat.hasMoreHistory.value)) {
    return
  }

  try {
    chat.isLoadingHistory.value = true

    const queryParams: API.ChatQueryReqVo = {
      pageNo: 1,
      pageSize: chat.historyPageSize.value,
      appId: currentAppId,
      orderBy: 'asc',
    }

    // 如果是加载更多，添加时间游标
    if (isLoadMore && chat.lastCreateTime.value) {
      queryParams.endTime = DateUtil.formatDate(chat.lastCreateTime.value)
    }

    const response = await list1({ reqVo: queryParams })

    if (response.data.data?.list) {
      const historyList = response.data.data.list

      // 转换API数据为ChatMessage格式
      const historyMessages: ChatMessage[] = historyList.map((item: API.ChatInfoResVo) => ({
        id: item.id || generateId(),
        type: item.messageType === 'user' ? 'user' : 'ai',
        content: item.message || '',
        timestamp: new Date(item.createTime || '').getTime(),
      }))

      if (isLoadMore) {
        // 加载更多：在前面插入历史消息
        chat.messages.value = [...historyMessages, ...chat.messages.value]
      } else {
        // 首次加载：替换消息列表
        chat.messages.value = historyMessages
      }

      // 更新分页状态
      chat.hasMoreHistory.value = historyList.length === chat.historyPageSize.value

      // 更新最后的创建时间作为下次查询的游标
      if (historyList.length > 0) {
        const lastItem = historyList[0]
        chat.lastCreateTime.value = lastItem.createTime || ''
      }
    } else {
      chat.hasMoreHistory.value = false
    }
  } catch (error) {
    console.error('加载对话历史失败:', error)
    message.error('加载对话历史失败')
  } finally {
    chat.isLoadingHistory.value = false
  }
}

/**
 * 移除URL中的action参数
 */
const removeActionParam = async () => {
  try {
    const currentQuery = { ...route.query }
    delete currentQuery.action
    delete currentQuery.userMessage

    await router.replace({
      path: route.path,
      query: currentQuery,
    })
  } catch (error) {
    console.error('移除URL参数失败:', error)
  }
}

const startCodeGeneration = async (messageContent: string) => {
  console.log(appId.value, messageContent)
  if (!appId.value) {
    console.warn('appId 为空，无法生成代码')
    return
  }

  console.log('开始生成代码')
  let eventSource: EventSource | null = null
  let streamCompleted = false
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  // 资源清理函数
  const cleanupResources = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
    if (eventSource) {
      eventSource.close()
      eventSource = null
    }
    chat.isLoading.value = false
  }

  // 统一错误处理
  const handleError = (errorMessage: string) => {
    if (streamCompleted) return

    streamCompleted = true
    cleanupResources()
    handleGenerationError(errorMessage, chat.currentMessageIndex.value)
  }

  // 成功完成处理
  const handleSuccess = () => {
    if (streamCompleted) return

    streamCompleted = true
    cleanupResources()

    // 延迟更新预览，确保后端处理结束
    setTimeout(async () => {
      if (appId.value) {
        try {
          await handlePreview()
        } catch (previewError) {
          console.error('预览更新失败:', previewError)
        }
      }
    }, 1000)
  }

  // 初始化UI状态
  preview.preview.value = false

  const aiMessage = buildMessage('ai', '', true)
  chat.messages.value.push(aiMessage)
  chat.currentMessageId.value = aiMessage.id
  chat.isLoading.value = true
  chat.currentMessageIndex.value = chat.messages.value.length - 1

  await nextTick()
  scrollToBottom()

  try {
    const url = `${getBaseUrl()}/app/generate/code?message=${encodeURIComponent(messageContent)}&appId=${appId.value}`
    eventSource = new EventSource(url, { withCredentials: true })
    console.log('EventSource 已创建', eventSource)

    // 设置超时定时器
    timeoutId = setTimeout(() => handleError('生成超时，请重试'), 10 * 60 * 1000)

    let fullContent = ''

    eventSource.onmessage = function (event) {
      if (streamCompleted) return

      try {
        const data = JSON.parse(event.data)
        const content = data.d

        if (content !== undefined && content !== null) {
          fullContent += content
          const currentMessage = chat.messages.value[chat.currentMessageIndex.value]
          if (currentMessage) {
            currentMessage.content = fullContent
            currentMessage.isLoading = false
            scrollToBottom()
          }
        }
      } catch (error) {
        console.error('处理SSE消息失败:', error)
        handleError('处理SSE消息失败')
      }
    }

    // 处理 done 事件
    eventSource.addEventListener('done', async function () {
      console.log('收到 done 事件，代码生成完成')

      // 获取最新状态
      if (appId.value) {
        await getAppStatus(appId.value)
      }

      handleSuccess()
    })

    // 处理 error 事件
    eventSource.onerror = function (error) {
      console.error('EventSource 错误:', error)

      if (streamCompleted) return

      // 检查连接状态
      if (eventSource && eventSource.readyState === EventSource.CONNECTING) {
        // 连接中，可能是重连，不立即报错
        console.log('EventSource 正在重新连接...')
      } else {
        handleError('生成失败，请重试')
      }
    }

    // 添加连接打开事件
    eventSource.addEventListener('open', function () {
      console.log('EventSource 连接已建立')
    })
  } catch (setupError) {
    console.error('初始化代码生成失败:', setupError)
    handleError('初始化失败，请重试')
  }
}

const handleGenerationError = (message: string, messageIndex: number) => {
  // 实现错误处理逻辑，比如更新消息内容显示错误
  if (chat.messages.value[messageIndex]) {
    chat.messages.value[messageIndex].content = message
    chat.messages.value[messageIndex].isLoading = false
  }
  chat.isLoading.value = false
  scrollToBottom()
}

/**
 * 构建消息
 * @param type 消息类型
 * @param content 消息内容
 * @param isLoading 是否正在加载
 */
const buildMessage = (type: 'user' | 'ai', content: string, isLoading: boolean): ChatMessage => {
  return {
    id: generateId(),
    type,
    content,
    timestamp: Date.now(),
    isLoading: isLoading,
  }
}

/**
 * 预览处理
 */
const handlePreview = async () => {
  if (!appId.value) {
    message.error('appId 不存在')
    return
  }
  preview.isLoading.value = true
  preview.url.value = ''

  const progressSteps = [
    { text: '思考理解需求...' },
    { text: '构建应用代码...' },
    { text: '输出目标内容...' },
  ]
  let stepIndex = 0
  const updateProgress = () => {
    if (stepIndex < progressSteps.length) {
      const step = progressSteps[stepIndex]
      preview.progressText.value = step.text
      stepIndex++
      setTimeout(updateProgress, 800)
    }
  }
  updateProgress()

  try {
    // 调用新的预览接口
    await doPreview({ appId: appId.value, reBuild: true })

    // 预览成功后更新iframe URL
    preview.url.value = getPreviewUrl()
    preview.progressText.value = '部署完成！'
    preview.preview.value = true
    message.success('应用部署成功！')

    // 获取最新状态
    await getAppStatus()
  } catch (error) {
    console.error('部署预览出错:', error)
    message.error('部署失败，请重试')
  } finally {
    preview.isLoading.value = false
  }
}

/**
 * 处理部署按钮点击
 */
const handleDeployClick = async () => {
  if (!appId.value) return

  // 如果已经部署，询问是否重新部署
  if (appStatus.deployStatus === 'LOADED') {
    Modal.confirm({
      title: '确认重新部署',
      content: '应用已部署，是否重新部署？',
      okText: '确认',
      cancelText: '取消',
      onOk: () => handleDeploy(true),
    })
  } else {
    await handleDeploy(false)
  }
}

/**
 * 处理部署
 */
const handleDeploy = async (reDeploy: boolean = false) => {
  if (!appId.value) return

  try {
    appStatus.loading = true
    await doDeploy({ appId: appId.value })
    message.success(reDeploy ? '重新部署成功！' : '部署成功！')

    // 获取最新状态
    await getAppStatus()
  } catch (error) {
    console.error('部署失败:', error)
    message.error('部署失败，请重试')
  } finally {
    appStatus.loading = false
  }
}

/**
 * 处理预览按钮点击
 */
const handlePreviewClick = async () => {
  if (!appId.value) return

  try {
    preview.isLoading.value = true
    await doPreview({ appId: appId.value, reBuild: false })

    // 预览成功后更新iframe URL
    preview.url.value = getPreviewUrl()
    preview.preview.value = true
    message.success('预览生成成功！')

    // 获取最新状态
    await getAppStatus()
  } catch (error) {
    console.error('预览失败:', error)
    message.error('预览生成失败')
  } finally {
    preview.isLoading.value = false
  }
}

/**
 * 生成消息 id
 */
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

/**
 * 格式化时间
 * @param timestamp 时间戳
 */
const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

/**
 * 滚动到底部
 */
const scrollToBottom = () => {
  nextTick(() => {
    if (messageListRef.value) {
      messageListRef.value.scrollTop = messageListRef.value.scrollHeight
    }
  })
}

/**
 * 聊天区域滚动监听函数，实现滚动到顶部时加载更多历史消息
 * @param event 滚动事件对象
 */
const handleChatScroll = (event: Event) => {
  const target = event.target as HTMLElement
  if (!target) return

  // 检查是否滚动到顶部附近（距离顶部50px以内）
  if (target.scrollTop <= 50 && chat.hasMoreHistory.value && !chat.isLoadingHistory.value) {
    loadChatHistory(true, appId.value)
  }
}

/**
 * 智能滚动监听函数，实现滚动到底部时加载更多
 * 使用防抖机制避免频繁触发，并采用更智能的触发条件
 * @param event 滚动事件对象
 */
const handleAppListScroll = (event: Event) => {
  const target = event.target as HTMLElement
  if (!target) return

  // 清除之前的防抖定时器
  if (scrollDebounceTimer) {
    clearTimeout(scrollDebounceTimer)
  }

  // 设置防抖定时器
  scrollDebounceTimer = setTimeout(() => {
    // 检查基本条件
    if (!appList.hasMore.value || appList.isLoadingMore.value || appList.isLoading.value) {
      return
    }

    const scrollTop = target.scrollTop
    const scrollHeight = target.scrollHeight
    const clientHeight = target.clientHeight

    // 计算滚动百分比
    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight

    // 使用80%阈值触发加载更多
    if (scrollPercentage >= 0.8) {
      console.log(`滚动达到 ${Math.round(scrollPercentage * 100)}% 阈值，触发加载更多`)
      getAppList(true)
    }
  }, SCROLL_DEBOUNCE_DELAY)
}

/**
 * 智能获取应用列表
 * @param isLoadMore 是否为加载更多模式
 */
const getAppList = async (isLoadMore = false) => {
  if (!loginUserStore.isLogin()) return

  // 防止重复加载或已无更多数据
  if (isLoadMore && (appList.isLoadingMore.value || !appList.hasMore.value)) {
    return
  }

  if (!isLoadMore && appList.isLoading.value) {
    return
  }

  try {
    if (isLoadMore) {
      appList.isLoadingMore.value = true
    } else {
      appList.isLoading.value = true
      appList.isLoadingMore.value = false
      appList.hasMore.value = true
      currentPage.value = 1
    }

    // 智能调整页面大小：首次加载时确保达到最小数据量
    let requestPageSize = pageSize.value
    if (!isLoadMore) {
      requestPageSize = Math.max(pageSize.value, appList.minInitialSize.value)
    }

    const queryReq: API.AppQueryReqVo = {
      pageNo: currentPage.value,
      pageSize: requestPageSize,
      startTime: appList.currentIndex.value || DateUtil.getFormattedPreviousPeriod(1, 'day'),
      endTime: appList.lastIndex.value || DateUtil.getCurrentFormatted(),
      maxId: appList.lastId.value || undefined,
    }
    const response = await getList({ queryReqVo: queryReq })
    console.log('response', response)
    if (response.data.data?.list && response.data.data?.list.length > 0) {
      await handleAppList(response.data.data, isLoadMore)

      // 首次加载后检查数据量是否足够
      if (!isLoadMore) {
        const dataCount = response.data.data.list.length
        const minRequired = appList.minInitialSize.value

        // 如果数据存在但不足最小要求，执行补全查询
        if (dataCount > 0 && dataCount < minRequired && appList.data.value.length > 0) {
          console.log(`首次查询数据不足(${dataCount}/${minRequired})，执行补全查询`)
          await performSupplementQuery()
        }

        // 自动加载计数器重置逻辑已简化
      }
    } else {
      // 备用查询逻辑：完全没有数据时的左开右闭查询
      const reQueryReq: API.AppQueryReqVo = {
        pageNo: 1,
        pageSize: 20,
        endTime: appList.lastIndex.value || DateUtil.getCurrentFormatted(),
        maxId: appList.lastId.value || undefined,
      }
      const response = await getList({ queryReqVo: reQueryReq })
      if (response.data.data?.list && response.data.data?.list.length > 0) {
        await handleAppList(response.data.data, isLoadMore)
      } else {
        appList.hasMore.value = false
      }
    }
  } catch (error) {
    console.error('获取应用列表失败:', error)
    handleLoadError(error)
  } finally {
    appList.isLoading.value = false
    appList.isLoadingMore.value = false
  }
}

/**
 * 执行数据补全查询
 * 当首次查询数据不足时，基于最早数据时间执行左开右闭查询
 */
const performSupplementQuery = async () => {
  try {
    if (appList.data.value.length === 0) return

    // 获取当前数据中最早的时间作为endTime
    const earliestApp = appList.data.value[appList.data.value.length - 1]
    const earliestTime = DateUtil.formatDate(earliestApp.updateTime)

    console.log(`执行补全查询，endTime: ${earliestTime}`)

    const supplementReq: API.AppQueryReqVo = {
      pageNo: 1,
      pageSize: appList.minInitialSize.value,
      endTime: earliestTime, // 左开右闭：不包含当前最早时间
      maxId: undefined, // 不使用maxId限制
    }

    const response = await getList({ queryReqVo: supplementReq })
    if (response.data.data?.list && response.data.data?.list.length > 0) {
      // 将补全数据追加到现有数据后面
      appList.data.value = [...appList.data.value, ...response.data.data.list]

      // 更新时间索引和分页信息
      const lastApp = response.data.data.list[response.data.data.list.length - 1]
      if (lastApp && lastApp.id) {
        appList.lastId.value = lastApp.id
        appList.lastIndex.value = DateUtil.formatDate(lastApp.updateTime)
        appList.currentIndex.value = DateUtil.getFormattedPreviousPeriod(
          1,
          'day',
          appList.lastIndex.value,
        )
      }

      // 更新hasMore状态
      const supplementCount = response.data.data.list.length
      appList.currentHasMore.value = supplementCount === appList.minInitialSize.value

      console.log(
        `补全查询完成，新增 ${supplementCount} 条数据，总数据量: ${appList.data.value.length}`,
      )
    } else {
      console.log('补全查询无数据，设置hasMore为false')
      appList.hasMore.value = false
      appList.currentHasMore.value = false
    }
  } catch (error) {
    console.error('补全查询失败:', error)
    // 补全查询失败不影响主流程，只记录错误
  }
}

/**
 * 处理加载错误的恢复机制
 * @param error 错误对象
 */
const handleLoadError = (error: unknown) => {
  console.error('应用列表加载失败:', error)

  // 重置加载状态
  appList.isLoading.value = false
  appList.isLoadingMore.value = false

  // 显示用户友好的错误提示
  message.error('加载应用列表失败，请稍后重试')
}

/**
 * 处理应用列表数据
 * @param responseData 响应数据
 * @param isLoadMore 是否加载更多
 */
const handleAppList = (responseData: API.PageResVoAppInfoCommonResVo, isLoadMore: boolean) => {
  if (!responseData || !responseData.list) {
    appList.currentHasMore.value = false
    return
  }

  const handleList = responseData.list

  if (isLoadMore) {
    // 加载更多：追加数据
    appList.data.value = [...appList.data.value, ...handleList]
  } else {
    // 首次加载：替换数据
    appList.data.value = handleList
  }

  // 优化判断是否还有更多数据的逻辑
  // 考虑数据完整性而不仅仅是数量匹配
  if (isLoadMore) {
    // 加载更多时：基于返回数据量和总页数判断
    appList.currentHasMore.value =
      handleList.length === pageSize.value && currentPage.value < Number(responseData.totalPage)
  } else {
    // 首次加载时：考虑数据补全机制，更宽松的判断
    const hasFullPage = handleList.length >= pageSize.value
    const hasMorePages = currentPage.value < Number(responseData.totalPage)
    const hasMinimumData =
      handleList.length >= Math.min(pageSize.value, appList.minInitialSize.value)

    // 如果有完整页面数据或者有更多页面，则认为可能有更多数据
    // 如果数据量达到最小要求但不足一页，通过补全查询来确定
    appList.currentHasMore.value =
      (hasFullPage && hasMorePages) ||
      (hasMinimumData && hasMorePages) ||
      (handleList.length > 0 && Number(responseData.totalPage) > 1)
  }

  appList.hasMore.value = true

  // 更新时间索引
  if (handleList.length > 0) {
    const lastApp = handleList[handleList.length - 1]
    if (lastApp && lastApp.id) {
      appList.lastId.value = lastApp.id
    }
    if (appList.currentHasMore.value) {
      appList.lastIndex.value = DateUtil.formatDate(lastApp.updateTime)
      appList.currentIndex.value = DateUtil.getFormattedPreviousPeriod(
        1,
        'day',
        appList.lastIndex.value,
      )
    } else {
      appList.lastIndex.value = appList.currentIndex.value
      appList.currentIndex.value = DateUtil.getFormattedPreviousPeriod(
        1,
        'day',
        appList.lastIndex.value,
      )
    }
  }
}

/**
 * 处理新建应用点击事件
 */
const handleCreateApp = () => {
  isVisibleOfDrawer.value = false
  router.push('/')
}

/**
 * 处理应用项点击事件
 */
const handleAppClick = async (app: API.AppInfoCommonResVo) => {
  if (!app || !app.id) return

  try {
    isVisibleOfDrawer.value = false

    await router.push('/App/code-message?appId=' + app.id)
    await initByAppId(app.id)
    navKey.value += 1
    contentKey.value += 1
  } catch (error) {
    console.error('应用跳转失败', error)
    message.error('应用跳转失败')
  }
}

/**
 * 处理登录点击事件
 */
const handleLogin = () => {
  router.push('/auth/login?redirect=/App/code-message?appId=' + appId.value)
  isVisibleOfDrawer.value = false
}

/**
 * 发送消息
 */
const sendMessage = async () => {
  const content = newMessage.value.trim()
  if (!content || chat.isLoading.value) return

  chat.messages.value.push({
    id: generateId(),
    type: 'user',
    content,
    timestamp: Date.now(),
  })

  newMessage.value = ''
  preview.url.value = ''
  preview.preview.value = false
  await startCodeGeneration(content)
}

/**
 * 复制文本
 * @param text 要复制的文本
 */
const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    message.success('代码已复制')
  } catch (err) {
    console.error(err)
    message.error('复制失败')
  }
}

/**
 * 重新生成回复
 * @param messageIndex 消息下标
 */
const regenerateResponse = async (messageIndex: number) => {
  if (chat.isLoading.value) return

  const userMessage = chat.messages.value[messageIndex]

  if (userMessage) {
    chat.messages.value = chat.messages.value.slice(0, chat.messages.value.indexOf(userMessage) + 1)
    await startCodeGeneration(userMessage.content)
  }
}

/**
 * 打开新窗口预览
 */
const openPreviewInNewTab = () => {
  if (preview.url.value) {
    window.open(preview.url.value, '_blank')
  }
}

/**
 * 处理下载按钮点击事件
 */
const handleDownloadClick = async () => {
  if (!appId.value) {
    message.error('应用ID不存在')
    return
  }

  try {
    downloadLoading.value = true
    const url = `${getBaseUrl()}/app/download/${appId.value}`
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
    })

    if (!response.ok) {
      throw new Error(`下载失败: ${response.status}`)
    }

    // 验证 Content-Type
    const contentType = response.headers.get('content-type') || ''
    if (!contentType.includes('application/zip')) {
      throw new Error('不支持的文件类型')
    }

    // 获取文件名
    const contentDisposition = response.headers.get('Content-Disposition')
    const fileName =
      contentDisposition?.match(/filename="(.+)"/)?.[1] ||
      `${appInfo.value?.name || 'app'}_code.zip`

    // 获取原始二进制数据
    const blob = await response.blob()

    // 验证ZIP文件头
    const arrayBuffer = await blob.arrayBuffer()
    const view = new DataView(arrayBuffer)
    const zipHeader = (view.getUint8(0) << 8) + view.getUint8(1)
    if (zipHeader !== 0x504b) {
      throw new Error('不是有效的ZIP文件')
    }

    // 创建下载链接
    const downloadUrl = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(downloadUrl)

    message.success('代码下载成功')
  } catch (error) {
    console.error('下载失败:', error)
    message.error('下载失败，请稍后重试')
  } finally {
    downloadLoading.value = false
  }
}

/**
 * 获取预览URL
 * @param currentAppId 应用ID
 */
const getPreviewUrl = () => {
  return `${getBaseUrl()}/app/preview/${appId.value}`
}

// 组件卸载时清理防抖定时器
onUnmounted(() => {
  if (scrollDebounceTimer) {
    clearTimeout(scrollDebounceTimer)
    scrollDebounceTimer = null
  }
})
</script>

<style scoped>
/* General Layout */
.code-message-view {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.code-message-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  overflow: hidden;
  position: relative; /* This is crucial for the drawer's positioning */
}

.error-alert {
  margin: 16px;
}

.main-content {
  flex: 1;
  display: flex;
  gap: 16px;
  padding: 16px;
  overflow: hidden;
}

/* Left & Right Panels */
.left-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.right-panel {
  width: 45%;
  display: flex;
  flex-direction: column;
}

/* Chat & Preview Sections */
.chat-section,
.preview-section {
  flex: 1;
  background: #ffffff;
  border: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-header,
.preview-header {
  padding: 16px 20px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8f9fa;
}

.chat-header h3,
.preview-header h3 {
  margin: 0;
  color: #333333;
  font-size: 16px;
  font-weight: 600;
}

/* Chat Header Specifics */
.header-left {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.conversation-info {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #666666;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Message List */
.chat-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.message-list {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  scroll-behavior: smooth;
}

.message-list::-webkit-scrollbar {
  width: 6px;
}
.message-list::-webkit-scrollbar-track {
  background: #f1f1f1;
}
.message-list::-webkit-scrollbar-thumb {
  background: #ccc;
}
.message-list::-webkit-scrollbar-thumb:hover {
  background: #999;
}

/* Individual Messages */
.message {
  display: flex;
  gap: 12px;
  max-width: 100%;
}

.user-message {
  flex-direction: row-reverse;
}
.ai-message {
  flex-direction: row;
}

.message-avatar .ai-avatar,
.message-avatar .user-avatar {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
}

.user-avatar {
  background: #007bff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
}

.message-content {
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  position: relative;
}

.user-message .message-content {
  background: #007bff;
  color: white;
  border-color: #007bff;
  margin-left: auto;
  max-width: 80%;
}

.ai-message .message-content {
  background: #f8f9fa;
  max-width: 90%;
}

.message-time {
  font-size: 11px;
  color: #666666;
  margin-top: 6px;
}
.user-message .message-time {
  color: rgba(255, 255, 255, 0.8);
  text-align: right;
}

.message-actions {
  display: flex;
  gap: 6px;
  margin-top: 8px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.message:hover .message-actions {
  opacity: 1;
}

.generating-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666666;
  font-style: italic;
  margin-top: 8px;
}

/* Input Area */
.chat-input-area {
  padding: 16px;
  border-top: 1px solid #e0e0e0;
  background: #ffffff;
}

/* Preview Area */
.preview-actions {
  display: flex;
  gap: 8px;
}

.preview-content {
  flex: 1;
  position: relative;
  overflow: hidden;
  background: #f8f9fa;
}

.preview-iframe-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.iframe-loading {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.9);
  z-index: 10;
}

.preview-iframe {
  width: 100%;
  height: 100%;
  border: none;
  background: white;
  transition: opacity 0.3s ease;
}

.deploying-placeholder,
.preview-empty {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 32px;
  color: #666;
}

.deploying-placeholder h4,
.preview-empty h4 {
  margin: 12px 0 8px 0;
  color: #333;
  font-size: 16px;
}

.deploying-placeholder .ant-progress {
  width: 100%;
  max-width: 250px;
  margin-top: 16px;
}

.preview-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.6;
}

.deploy-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
  text-align: center;
}

.placeholder-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.placeholder-icon {
  font-size: 48px;
  color: #d9d9d9;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 16px;
}

.loading-text {
  color: #666;
  margin: 0;
}

.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 16px;
}

.error-icon {
  font-size: 48px;
  color: #ff4d4f;
}

.error-text {
  color: #ff4d4f;
  margin: 0;
  font-size: 16px;
}

.iframe-container {
  width: 100%;
  height: 100%;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  overflow: hidden;
}

/* Drawer Styles */
.drawer-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 16px;
}

.drawer-header {
  margin-bottom: 16px;
}

.drawer-body {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 16px;
}

.app-list-section h4 {
  margin-bottom: 12px;
  color: #1f2937;
  font-weight: 600;
}

.empty-state {
  text-align: center;
  padding: 24px 0;
  color: #6b7280;
}

.empty-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.app-item {
  cursor: pointer;
  border-radius: 8px;
  margin-bottom: 8px;
  transition: all 0.2s ease;
}

.app-item:hover {
  background-color: #f3f4f6;
}

.app-title {
  font-weight: 500;
  color: #1f2937;
  font-size: 14px;
}

.app-time {
  color: #6b7280;
  font-size: 12px;
}

/* 加载更多历史消息样式 */
.load-more-section {
  padding: 12px 0;
  margin-bottom: 16px;
}

.load-more-btn {
  border-style: dashed;
  border-color: #d9d9d9;
  color: #666;
  font-size: 14px;
  height: 36px;
}

.load-more-btn:hover {
  border-color: #40a9ff;
  color: #40a9ff;
}

.loading-more {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px;
  color: #666;
  font-size: 14px;
}

/* 加载更多指示器样式 */
.load-more-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  color: #666;
  font-size: 14px;

  .anticon {
    margin-right: 8px;
  }
}

/* 没有更多数据指示器样式 */
.no-more-indicator {
  text-align: center;
  padding: 16px;
  color: #999;
  font-size: 14px;
  border-top: 1px solid #f0f0f0;
}

.drawer-footer {
  border-top: 1px solid #e5e7eb;
  padding-top: 16px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-details {
  flex: 1;
}

.user-name {
  font-weight: 500;
  color: #1f2937;
  font-size: 14px;
  line-height: 1.2;
}

.user-role {
  color: #6b7280;
  font-size: 12px;
  line-height: 1.2;
}

.login-prompt {
  text-align: center;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .right-panel {
    width: 40%;
  }
}

@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
  }
  .right-panel {
    width: 100%;
    height: 400px; /* Fixed height on smaller screens */
  }
}
</style>
