<template>
  <div class="code-message-view" :key="currentAppId">
    <AppNavBar
      v-if="sysAppInfo"
      :sys-app-info="sysAppInfo"
      :is-owner="isOwner"
      @logoMouseOver="handleLogoMouseOver"
    />
    <div class="code-message-container">
      <a-drawer
        :open="isDrawerVisible"
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
              <a-spin :spinning="appListLoading">
                <div v-if="appList.length === 0 && !appListLoading" class="empty-state">
                  <div class="empty-icon">📱</div>
                  <p>暂无应用</p>
                  <a-button type="link" @click="handleCreateApp">创建第一个应用</a-button>
                </div>
                <div v-else :key="componentKey">
                  <a-list :data-source="appList" size="small">
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
                            <div class="app-time">{{ formatAppTime(item.updateTime) }}</div>
                          </template>
                        </a-list-item-meta>
                      </a-list-item>
                    </template>
                  </a-list>

                  <!-- 加载更多指示器 -->
                  <div v-if="appListLoadingMore" class="load-more-indicator">
                    <a-spin size="small" />
                    <span>加载中...</span>
                  </div>

                  <!-- 没有更多数据指示器 -->
                  <div v-if="!hasMoreApps && appList.length > 0" class="no-more-indicator">
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
                <div class="user-role">{{ getRoleText(loginUserStore.loginUser.role) }}</div>
              </div>
            </div>
            <div v-else class="login-prompt">
              <a-button type="link" @click="handleLogin">登录</a-button>
            </div>
          </div>
        </div>
      </a-drawer>
      <a-alert
        v-if="errorMessage"
        :message="errorMessage"
        type="error"
        closable
        @close="clearError"
        class="error-alert"
      />

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
                <a-spin v-if="isGenerating" size="small" />
                <a-tag :color="statusColor">{{ statusText }}</a-tag>
              </div>
            </div>

            <div class="chat-container">
              <div class="message-list" ref="messageListRef">
                <div v-if="messages.length === 0" class="message ai-message">
                  <div class="message-avatar">
                    <img src="@/assets/codeAi 无背景.png" alt="AI" class="ai-avatar" />
                  </div>
                  <div class="message-content">
                    <MarkdownRenderer :content="welcomeMessage" />
                  </div>
                </div>

                <div
                  v-for="(message, index) in messages"
                  :key="message.id"
                  :class="['message', message.type === 'user' ? 'user-message' : 'ai-message']"
                >
                  <div class="message-avatar">
                    <div v-if="message.type === 'user'" class="user-avatar">👤</div>
                    <img v-else src="@/assets/codeAi 无背景.png" alt="AI" class="ai-avatar" />
                  </div>

                  <div class="message-content">
                    <MarkdownRenderer :content="message.content" />
                    <div v-if="message.isGenerating" class="generating-indicator">
                      <a-spin size="small" />
                      <span>{{ generatingText }}</span>
                    </div>
                    <div
                      class="message-actions"
                      v-if="message.type === 'ai' && !message.isGenerating && message.content"
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
                    <div class="message-time" v-if="!message.isGenerating">
                      {{ formatTime(message.timestamp) }}
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="isOwner" class="chat-input-area">
                <InputComponent
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
                  :disabled="isGenerating"
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
                <a-button v-if="previewUrl" size="small" type="text" @click="openInNewTab">
                  <template #icon><ExportOutlined /></template>
                  新窗口打开
                </a-button>
                <a-button
                  type="primary"
                  :loading="isDeploying"
                  :disabled="!canPreview"
                  @click="handlePreview"
                  size="small"
                >
                  <template #icon><RocketOutlined /></template>
                  {{ previewButtonText }}
                </a-button>
              </div>
            </div>
            <div class="preview-content">
              <div v-if="isDeploying" class="deploying-placeholder">
                <a-spin size="large" />
                <h4>正在部署应用...</h4>
                <p>{{ deployProgress }}</p>
                <a-progress :percent="deployPercent" :show-info="false" />
              </div>
              <div v-else-if="previewUrl" class="preview-iframe-container">
                <div v-if="iframeLoading" class="iframe-loading">
                  <a-spin size="large" tip="加载预览中..." />
                </div>
                <iframe
                  :src="previewUrl"
                  class="preview-iframe"
                  @load="iframeLoading = false"
                  :style="{ opacity: iframeLoading ? 0 : 1 }"
                ></iframe>
              </div>
              <div v-else class="preview-empty">
                <div class="preview-icon">🚀</div>
                <h4>等待预览</h4>
                <p>代码生成完成后，点击预览按钮查看应用效果</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  CopyOutlined,
  ReloadOutlined,
  ExportOutlined,
  RocketOutlined,
  PlusOutlined,
} from '@ant-design/icons-vue'
import AppNavBar from '@/views/app/components/AppNavBar.vue'
import MarkdownRenderer from '@/components/MarkdownComponent.vue'
import InputComponent from '@/components/InputComponent.vue'
import { deployPreview, getDeployStatus } from '@/api/jingtaiziyuanbushukongzhiqi'
import { getInfo, getList } from '@/api/yingyongkongzhiqi'
import { useLoginUserStore } from '@/stores/loginUser'
import { BASE_URL } from '@/config/apiConfig'

// --- Type Definitions ---
interface ChatMessage {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: number
  isGenerating?: boolean
}

// --- Core State Management ---
const appId = ref<string | null>(null)
const sysAppInfo = ref<API.AppInfoCommonResVo>()
const isOwner = ref(false)
const messages = ref<ChatMessage[]>([])
const newMessage = ref('')
const errorMessage = ref('')
const isGenerating = ref(false)
const isDeploying = ref(false)
const iframeLoading = ref(true)
const previewUrl = ref('')
const canPreview = ref(false)
const deployPercent = ref(0)
const deployProgress = ref('准备部署环境...')
const messageListRef = ref<HTMLElement | null>(null)
const currentAppId = ref('0')

// --- Timers and Intervals ---
let deployTimer: ReturnType<typeof setTimeout> | null = null

// --- Router and Stores ---
const route = useRoute()
const router = useRouter()
const loginUserStore = useLoginUserStore()

// --- Drawer State ---// 应用列表相关状态
const appList = ref<API.AppInfoCommonResVo[]>([])
const appListLoading = ref(false)
const appListLoadingMore = ref(false)
const currentPage = ref(1)
const pageSize = ref(20)
const hasMoreApps = ref(true)
const componentKey = ref(0) // 用于强制重新渲染组件 --- Static Content ---
const welcomeMessage = `# 👋 欢迎使用 CodeCraftAI
我是您的 AI 编程助手，可以帮助您快速生成、优化和调试代码。请在下方输入您的需求！`
const generatingTexts = [
  'AI 正在分析您的需求...',
  'AI 正在设计应用架构...',
  'AI 正在编写核心代码...',
  'AI 正在优化代码结构...',
]
const generatingTextIndex = ref(0)

// --- Computed Properties ---
const generatingText = computed(
  () => generatingTexts[generatingTextIndex.value % generatingTexts.length],
)
const previewButtonText = computed(() =>
  isDeploying.value ? '部署中...' : previewUrl.value ? '重新预览' : '立即预览',
)
const statusText = computed(() => {
  if (isGenerating.value) return '生成中'
  if (canPreview.value) return '可预览'
  if (messages.value.length === 0) return '等待输入'
  return '已完成'
})
const statusColor = computed(() => {
  if (isGenerating.value) return 'processing'
  if (canPreview.value) return 'success'
  return 'default'
})
const conversationStats = computed(() => {
  const userMessages = messages.value.filter((m) => m.type === 'user')
  const lastUserMessage = userMessages.pop()
  let lastGenerationTime = null

  if (lastUserMessage) {
    const subsequentAiMessage = messages.value.find(
      (m) => m.type === 'ai' && m.timestamp > lastUserMessage.timestamp && !m.isGenerating,
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

// --- Utility Functions ---
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substring(2)
const formatTime = (timestamp: number) =>
  new Date(timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
const scrollToBottom = () => {
  nextTick(() => {
    if (messageListRef.value) {
      messageListRef.value.scrollTop = messageListRef.value.scrollHeight
    }
  })
}

// --- Drawer Functions ---
/**
 * 获取应用列表 - 支持分页加载
 * @param isLoadMore 是否为加载更多模式
 */
const fetchAppList = async (isLoadMore = false) => {
  if (!loginUserStore.isLogin()) return

  if (!isLoadMore) {
    appListLoading.value = true
    appListLoadingMore.value = false
    currentPage.value = 1
    hasMoreApps.value = true
  } else {
    if (appListLoadingMore.value || !hasMoreApps.value) {
      return // 防止重复加载或已无更多数据
    }
    appListLoadingMore.value = true
  }

  try {
    const queryReq: API.AppQueryReqVo = {
      pageNo: currentPage.value,
      pageSize: pageSize.value,
      orderBy: 'updateTime desc',
    }
    const response = await getList({ queryReqVo: queryReq })
    const newApps = response.data.data?.list || []

    if (isLoadMore) {
      // 加载更多：追加数据
      appList.value = [...appList.value, ...newApps]
    } else {
      // 首次加载：替换数据
      appList.value = newApps
    }

    // 更新分页状态
    const totalPage = Number(response.data.data?.totalPage || 1)
    hasMoreApps.value = newApps.length === pageSize.value && currentPage.value < totalPage
    if (hasMoreApps.value) {
      currentPage.value += 1
    }
  } catch (error) {
    console.error('获取应用列表失败:', error)
    message.error('获取应用列表失败')
  } finally {
    appListLoading.value = false
    appListLoadingMore.value = false
  }
}

/**
 * 滚动监听函数，实现滚动到底部时加载更多
 */
const handleAppListScroll = (event: Event) => {
  const target = event.target as HTMLElement
  if (!target || !hasMoreApps.value || appListLoadingMore.value) return

  const scrollTop = target.scrollTop
  const scrollHeight = target.scrollHeight
  const clientHeight = target.clientHeight

  // 当滚动到距离底部50px时触发加载更多
  if (scrollTop + clientHeight >= scrollHeight - 50) {
    fetchAppList(true)
  }
}

/**
 * 处理新建应用点击事件
 */
const handleCreateApp = () => {
  router.push('/')
  isDrawerVisible.value = false
}

/**
 * 处理应用项点击事件
 */
const handleAppClick = async (app: API.AppInfoCommonResVo) => {
  if (app.id) {
    router.push(`/app/code-message?appId=${app.id}`)
    appId.value = app.id
    await getAppInfo(app.id)
    isDrawerVisible.value = false

    // 使用componentKey强制重新渲染组件，避免Pinia状态丢失
    componentKey.value += 1
    currentAppId.value += 1
    init()

    // 使用nextTick确保路由跳转完成后重新获取应用列表
    await nextTick()
    fetchAppList(false)
  }
}

/**
 * 处理登录点击事件
 */
const handleLogin = () => {
  router.push('/auth/login?redirect=/app/code-message?appId=' + appId.value)
  isDrawerVisible.value = false
}

/**
 * 格式化应用时间显示
 */
const formatAppTime = (timeStr?: string) => {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) {
    return '今天'
  } else if (days === 1) {
    return '昨天'
  } else if (days < 7) {
    return `${days}天前`
  } else {
    return date.toLocaleDateString('zh-CN')
  }
}

/**
 * 获取角色文本显示
 */
const getRoleText = (role?: string) => {
  switch (role) {
    case 'ADMIN':
      return '管理员'
    case 'USER':
      return '用户'
    case 'GUEST':
      return '访客'
    default:
      return '用户'
  }
}

// --- Application Initialization ---
onMounted(async () => {
  await init()
})

const init = async () => {
  const id = route.query.appId as string
  if (!id) {
    router.push('/')
    return
  }
  appId.value = id
  currentAppId.value = id
  await getAppInfo(id)

  const messageContent = route.query.userMessage as string
  const shouldStartGeneration = route.query.action === 'create'
  if (shouldStartGeneration && messageContent && isOwner.value) {
    const userMsg: ChatMessage = {
      id: generateId(),
      type: 'user',
      content: messageContent,
      timestamp: Date.now(),
    }
    messages.value.push(userMsg)
    startCodeGeneration(messageContent)
  }
  getDeployPreviewStatus()
}

async function getAppInfo(id: string) {
  try {
    const response = await getInfo({ id })
    if (response.data.data) {
      sysAppInfo.value = response.data.data
      isOwner.value = sysAppInfo.value.userId === loginUserStore.loginUser.id
    }
  } catch (error) {
    console.error('获取应用信息失败:', error)
    errorMessage.value = '获取应用信息失败'
  }
}

async function getDeployPreviewStatus() {
  if (!appId.value) return
  const response = await getDeployStatus({ appId: appId.value })
  if (response.data.data) {
    const status = response.data.data
    console.log('status', status)
    if (status.deployFileExists && status.deployTime && status.preDeployKey) {
      canPreview.value = true
      previewUrl.value = getPreviewUrl(status.preDeployKey)
      console.log('previewUrl', previewUrl.value)
      console.log('canPreview', canPreview.value)
    }
  }
}

// --- AI Chat & Code Generation ---
const sendMessage = async () => {
  const content = newMessage.value.trim()
  if (!content || isGenerating.value) return

  messages.value.push({
    id: generateId(),
    type: 'user',
    content,
    timestamp: Date.now(),
  })

  newMessage.value = ''
  canPreview.value = false
  previewUrl.value = ''
  await startCodeGeneration(content)
}

async function startCodeGeneration(messageContent: string) {
  if (!appId.value) return
  let eventSource: EventSource | null = null
  let streamCompleted = false

  isGenerating.value = true
  canPreview.value = false

  const aiMessage: ChatMessage = {
    id: generateId(),
    type: 'ai',
    content: '',
    timestamp: Date.now(),
    isGenerating: true,
  }
  messages.value.push(aiMessage)
  await nextTick()
  scrollToBottom()

  // Start generating text animation
  generatingTextIndex.value = messages.value.length - 1

  const url = `${BASE_URL}/app/generate/code?message=${encodeURIComponent(messageContent)}&appId=${appId.value}`
  eventSource = new EventSource(url, { withCredentials: true })

  setTimeout(
    () => handleGenerationError('生成超时，请重试', generatingTextIndex.value),
    10 * 60 * 1000,
  ) // 10 minutes

  let fullContent = ''

  eventSource.onmessage = function (event) {
    if (streamCompleted) return
    try {
      const data = JSON.parse(event.data)
      const content = data.d
      if (content !== undefined && content !== null) {
        fullContent += content
        messages.value[generatingTextIndex.value].content = fullContent
        messages.value[generatingTextIndex.value].isGenerating = false
        scrollToBottom()
      }
    } catch (error) {
      console.error('处理SSE消息失败:', error)
      handleGenerationError('处理SSE消息失败', generatingTextIndex.value)
    }
  }

  // 处理 done 事件
  eventSource.addEventListener('done', function () {
    if (streamCompleted) return

    streamCompleted = true
    isGenerating.value = false
    eventSource.close()

    // 延迟更新预览,确保后端处理结束
    setTimeout(async () => {
      if (appId.value) {
        await getAppInfo(appId.value)
        handlePreview()
      }
    }, 1000)
  })

  // 处理异常事件
  eventSource.onerror = function () {
    if (streamCompleted || !isGenerating.value) return
    // 检查链接是否关闭
    if (eventSource.readyState === eventSource.CONNECTING) {
      streamCompleted = true
      isGenerating.value = false
      eventSource.close()

      setTimeout(async () => {
        if (appId.value) {
          await getAppInfo(appId.value)
          handlePreview()
        }
      }, 1000)
    } else {
      handleGenerationError('生成失败，请重试', generatingTextIndex.value)
    }
  }
}

function handleGenerationError(error: string, index: number) {
  errorMessage.value = error
  isGenerating.value = false
  messages.value[index].content = error
  messages.value[index].isGenerating = false
}

// --- User Interface Actions ---
async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    message.success('代码已复制')
  } catch (err) {
    console.error(err)
    message.error('复制失败')
  }
}

function regenerateResponse(messageIndex: number) {
  if (isGenerating.value) return
  const userMessageIndex = Math.floor(messageIndex / 2)
  const userMessage = messages.value.filter((m) => m.type === 'user')[userMessageIndex]

  if (userMessage) {
    messages.value = messages.value.slice(0, messages.value.indexOf(userMessage) + 1)
    startCodeGeneration(userMessage.content)
  }
}

function clearError() {
  errorMessage.value = ''
}

function openInNewTab() {
  if (previewUrl.value) {
    window.open(previewUrl.value, '_blank')
  }
}

// --- Code Preview & Deployment ---
async function handlePreview() {
  console.log('handlePreview', canPreview.value, isDeploying.value)
  if (!appId.value) return

  isDeploying.value = true
  iframeLoading.value = true
  deployPercent.value = 0
  previewUrl.value = ''

  // Simulate deployment progress
  const progressSteps = [
    { percent: 20, text: '准备部署环境...' },
    { percent: 50, text: '构建应用代码...' },
    { percent: 80, text: '配置服务器...' },
  ]
  let stepIndex = 0
  const updateProgress = () => {
    if (stepIndex < progressSteps.length) {
      const step = progressSteps[stepIndex]
      deployPercent.value = step.percent
      deployProgress.value = step.text
      stepIndex++
      deployTimer = setTimeout(updateProgress, 800)
    }
  }
  updateProgress()

  try {
    const response = await deployPreview({ appId: appId.value })
    const deployKey = response.data.data
    console.log(deployKey)
    if (deployKey) {
      previewUrl.value = getPreviewUrl(deployKey)
      deployPercent.value = 100
      deployProgress.value = '部署完成！'
      canPreview.value = true
      message.success('应用部署成功！')
    } else {
      canPreview.value = false
      throw new Error('Invalid deploy key received')
    }
  } catch (error) {
    console.error('部署预览出错:', error)
    message.error('部署失败，请重试')
  } finally {
    if (deployTimer) clearTimeout(deployTimer)
    setTimeout(() => {
      isDeploying.value = false
    }, 1000)
  }
}

const getPreviewUrl = (deployKey: string) => {
  return `${BASE_URL}/deploy/redirect/${deployKey}`
}

// --- Drawer State ---
const isDrawerVisible = ref(false)

const handleLogoMouseOver = () => {
  isDrawerVisible.value = true
  // 当抽屉打开时获取应用列表
  if (loginUserStore.isLogin()) {
    fetchAppList()
  }
}

const handleLogoMouseLeave = () => {
  isDrawerVisible.value = false
}

// --- Watchers ---
watch(() => messages.value.length, scrollToBottom)
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
