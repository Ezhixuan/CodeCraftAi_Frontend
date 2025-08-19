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
      <a-alert
        v-if="errorMessage"
        :message="errorMessage"
        type="error"
        closable
        @close="clearErrorMessage"
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
                <a-spin v-if="chat.isLoading.value" size="small" />
                <a-tag :color="statusColor">{{ statusText }}</a-tag>
              </div>
            </div>

            <div class="chat-container">
              <div class="message-list" ref="messageListRef">
                <div v-if="chat.messages.value.length === 0" class="message ai-message">
                  <div class="message-avatar">
                    <img src="@/assets/codeAi 无背景.png" alt="AI" class="ai-avatar" />
                  </div>
                  <div class="message-content">
                    <MarkdownRenderer :content="welcomeMessage" />
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
                    <MarkdownRenderer :content="message.content" />
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
                <a-button v-if="preview.url" size="small" type="text" @click="openPreviewInNewTab">
                  <template #icon><ExportOutlined /></template>
                  新窗口打开
                </a-button>
                <a-button
                  type="primary"
                  :loading="preview.isLoading.value"
                  :disabled="!preview.preview.value"
                  @click="handlePreview"
                  size="small"
                >
                  <template #icon><RocketOutlined /></template>
                  {{ previewButtonText }}
                </a-button>
              </div>
            </div>
            <div class="preview-content">
              <div v-if="preview.isLoading.value" class="deploying-placeholder">
                <a-spin size="large" />
                <h4>正在部署应用...</h4>
                <p>{{ deployProgress }}</p>
                <a-progress :percent="preview.progressText.value" :show-info="false" />
              </div>
              <div v-else-if="preview.preview.value" class="preview-iframe-container">
                <div v-if="preview.isLoading.value" class="iframe-loading">
                  <a-spin size="large" tip="加载预览中..." />
                </div>
                <iframe
                  :src="preview.url.value"
                  class="preview-iframe"
                  @load="!preview.isLoading"
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
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  CopyOutlined,
  ExportOutlined,
  PlusOutlined,
  ReloadOutlined,
  RocketOutlined,
} from '@ant-design/icons-vue'
import AppNavBar from '@/views/app/components/AppNavBar.vue'
import MarkdownRenderer from '@/components/MarkdownComponent.vue'
import InputComponent from '@/components/InputComponent.vue'
import { deployPreview, getDeployStatus } from '@/api/jingtaiziyuanbushukongzhiqi'
import { getInfo, getList } from '@/api/yingyongkongzhiqi'
import { useLoginUserStore } from '@/stores/loginUser'
import { BASE_URL } from '@/config/apiConfig'
import DateUtil from '@/components/DateUtil'

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
}

const chat = {
  messages: ref<ChatMessage[]>([]),
  currentMessageId: ref('-1'),
  currentMessageIndex: ref(-1),
  isLoading: ref(false),
}

const preview = {
  url: ref(''),
  isLoading: ref(false),
  deployStatus: ref<API.DeployStatusVo>(),
  preview: ref(false),
  progressText: ref(''),
}

const action = ref<number>(0)
const isVisibleOfDrawer = ref(false)
const newMessage = ref('')
const errorMessage = ref('')
const deployProgress = ref('准备部署环境...')
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
  return app.value?.id
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
const previewButtonText = computed(() =>
  preview.isLoading.value ? '部署中...' : preview.url.value ? '重新预览' : '立即预览',
)
const statusText = computed(() => {
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

onMounted(() => {
  // 进入页面后初始化数据
  // 1. 获取应用 id
  if (!route.query.appId) {
    message.error('该应用或许不存在')
    router.push('/')
  }
  const appId = route.query.appId as string
  initByAppId(appId)
})

/**
 * 核心初始化方法
 * 对应用信息以及部署信息进行初始化
 * @param currentAppId 应用id
 */
const initByAppId = async (currentAppId: string) => {
  console.log(currentAppId)
  await getAppInfo(currentAppId)
  action.value = Number(route.query.action) || 0
  await getPreviewStatus(currentAppId)
  if (!route.query.userMessage && action.value !== 1) {
    // 只有存在用户消息并且action为1时才处理
    return
  }
  const userMessage = route.query.userMessage as string
  const userMsg = buildMessage('user', userMessage, true)
  chat.messages.value.push(userMsg)
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
 * 获取应用部署状态
 * @param currentAppId 应用id
 */
const getPreviewStatus = async (currentAppId: string) => {
  if (!currentAppId) return
  try {
    const response = await getDeployStatus({ appId: currentAppId })
    if (response.data.data) {
      const previewStatus = response.data.data
      console.log('previewStatus', previewStatus)
      preview.preview.value =
        (previewStatus.deployFileExists || false) && previewStatus.deployTime !== null
      preview.deployStatus.value = previewStatus
      if (preview.preview.value && previewStatus.preDeployKey) {
        preview.url.value = getPreviewUrl(previewStatus.preDeployKey)
      }
    }
  } catch (error) {
    console.error('获取应用部署状态失败:', error)
    message.error('获取应用部署状态失败')
  }
}

const startCodeGeneration = async (messageContent: string) => {
  if (!appId.value) return
  let eventSource: EventSource | null = null
  let streamCompleted = false

  preview.preview.value = false

  const aiMessage = buildMessage('ai', '', true)
  chat.messages.value.push(aiMessage)
  chat.currentMessageId.value = aiMessage.id
  chat.isLoading.value = true
  chat.currentMessageIndex.value = chat.messages.value.length - 1

  await nextTick()
  scrollToBottom()

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
        chat.messages.value[generatingTextIndex.value].content = fullContent
        chat.messages.value[generatingTextIndex.value].isLoading = false
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
    chat.isLoading.value = false
    eventSource.close()

    // 延迟更新预览,确保后端处理结束
    setTimeout(async () => {
      if (appId.value) {
        await handlePreview()
      }
    }, 1000)
  })

  // 处理异常事件
  eventSource.onerror = function () {
    if (streamCompleted || !chat.isLoading.value) return
    // 检查链接是否关闭
    if (eventSource.readyState === eventSource.CONNECTING) {
      streamCompleted = true
      chat.isLoading.value = false
      eventSource.close()
    } else {
      handleGenerationError('生成失败，请重试', generatingTextIndex.value)
    }
  }
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
    const response = await deployPreview({ appId: appId.value })
    const deployKey = response.data.data
    if (deployKey) {
      preview.url.value = getPreviewUrl(deployKey)
      preview.progressText.value = '部署完成！'
      preview.preview.value = true
      message.success('应用部署成功！')
    }
  } catch (error) {
    console.error('部署预览出错:', error)
    message.error('部署失败，请重试')
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
 * 滚动监听函数，实现滚动到底部时加载更多
 * 使用防抖机制避免频繁触发
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

    // 当滚动到距离底部100px时触发加载更多
    if (scrollTop + clientHeight >= scrollHeight - 100) {
      getAppList(true)
    }
  }, SCROLL_DEBOUNCE_DELAY)
}

/**
 * 滚动获取应用列表
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

    const queryReq: API.AppQueryReqVo = {
      pageNo: currentPage.value,
      pageSize: pageSize.value,
      startTime: appList.currentIndex.value || DateUtil.getFormattedPreviousPeriod(1, 'day'),
      endTime: appList.lastIndex.value || DateUtil.getCurrentFormatted(),
      maxId: appList.lastId.value || undefined,
    }
    const response = await getList({ queryReqVo: queryReq })
    console.log('response', response)
    if (response.data.data?.list && response.data.data?.list.length > 0) {
      handleAppList(response.data.data, isLoadMore)
    } else {
      const reQueryReq: API.AppQueryReqVo = {
        pageNo: 1,
        pageSize: 20,
        endTime: appList.lastIndex.value || DateUtil.getCurrentFormatted(),
        maxId: appList.lastId.value || undefined,
      }
      const response = await getList({ queryReqVo: reQueryReq })
      if (response.data.data?.list && response.data.data?.list.length > 0) {
        handleAppList(response.data.data, isLoadMore)
      } else {
        appList.hasMore.value = false
      }
    }
  } catch (error) {
    console.error('获取应用列表失败:', error)
    message.error('获取应用列表失败')
  } finally {
    appList.isLoading.value = false
    appList.isLoadingMore.value = false
  }
}

/**
 * 处理应用列表数据
 * @param responseData 响应数据
 * @param isLoadMore 是否加载更多
 */
const handleAppList = (responseData: API.PageResVoAppInfoCommonResVo, isLoadMore: boolean) => {
  if (!responseData || !responseData.list) {
    appList.hasMore.value = false
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

  // 判断是否还有更多数据
  appList.currentHasMore.value =
    handleList.length === pageSize.value && currentPage.value < Number(responseData.totalPage)
  console.log('hasMoreData', appList.currentHasMore.value)
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

    await router.push('/app/code-message?appId=' + app.id)
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
  router.push('/auth/login?redirect=/app/code-message?appId=' + appId.value)
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
 * 处理异常
 */
const handleGenerationError = (error: string, index: number) => {
  errorMessage.value = error
  chat.isLoading.value = false
  chat.messages.value[index].content = error
  chat.messages.value[index].isLoading = false
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
 * 清空错误信息
 */
const clearErrorMessage = () => {
  errorMessage.value = ''
}

/**
 * 在新标签页中打开预览
 */
const openPreviewInNewTab = () => {
  if (preview.url.value) {
    window.open(preview.url.value, '_blank')
  }
}

/**
 * 获取预览URL
 * @param deployKey 部署密钥
 */
const getPreviewUrl = (deployKey: string) => {
  return `${BASE_URL}/deploy/redirect/${deployKey}`
}

watch(() => chat.messages.value.length, scrollToBottom)

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
