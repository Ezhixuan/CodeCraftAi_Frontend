<template>
  <div class="code-message-view" :key="navKey">
    <AppNavBar
      v-if="appId && appInfo"
      :sys-app-info="appInfo"
      :app-id="appId"
      :is-owner="isOwner"
      @logoMouseOver="handleLogoMouseOver"
      @startEditMode="handleStartEditMode"
    />
    <div class="code-message-container" :key="contentKey">
      <AppDrawer
        :visible="isVisibleOfDrawer"
        @close="handleLogoMouseLeave"
        @login="handleLogin"
        @app-click="handleAppClick"
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
                <a-spin v-if="chatLoading" size="small" />
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
                    <MarkdownReader :content="welcomeMessage" />
                  </div>
                </div>

                <div
                  v-for="message in messages"
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
                        复制回答
                      </a-button>
                    </div>
                    <div class="message-time" v-if="!message.isLoading">
                      {{ DateUtil.formatDate(message.timestamp, 'YYYY-MM-DD HH:mm:ss') }}
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
                  :disabled="chatLoading"
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
                  <a-button v-if="previewUrl" size="small" type="text" @click="openPreviewInNewTab">
                    <template #icon><ExportOutlined /></template>
                    新窗口打开
                  </a-button>
                  <!-- 预览按钮 -->
                  <a-button
                    type="primary"
                    :loading="previewLoading || appStatus.previewStatus === 'LOADING'"
                    @click="handlePreviewClick"
                    :disabled="!isOwner"
                    size="small"
                  >
                    <template #icon><RocketOutlined /></template>
                    {{
                      appStatus.previewStatus === 'LOADING'
                        ? '预览中...'
                        : previewLoading
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
                v-if="appStatus.previewStatus === 'LOADING' || previewLoading"
                class="loading-container"
              >
                <a-spin size="large">
                  <template #indicator>
                    <LoadingOutlined style="font-size: 24px" spin />
                  </template>
                </a-spin>
                <p class="loading-text">{{ progressText || '正在生成预览...' }}</p>
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
                v-else-if="previewUrl && previewState && appStatus.previewStatus === 'LOADED'"
                class="iframe-container"
              >
                <iframe
                  :src="previewUrl"
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
import { computed, nextTick, onMounted, ref, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message, Modal } from 'ant-design-vue'

// 定义 iframe 窗口类型
interface IframeWindow extends Window {
  __editModeDestroy?: () => void
}
import {
  CopyOutlined,
  DownloadOutlined,
  ExclamationCircleOutlined,
  ExportOutlined,
  LoadingOutlined,
  RocketOutlined,
} from '@ant-design/icons-vue'
import { useInfiniteScroll } from '@vueuse/core'
import AppNavBar from '@/views/app/components/AppNavBar.vue'
import MarkdownReader from '@/components/Markdown/index.vue'
import Input from '@/components/Input/index.vue'
import AppDrawer from '@/views/app/components/AppDrawer.vue'
import { getBaseUrl } from '@/config/env.ts'
import DateUtil from '@/utils/DateUtil.ts'
import { putAppDeploy } from '@/api/appCoreController.ts'
import { useApp } from '@/views/app/composables/useApp'
import { useChat } from '@/views/app/composables/useChat'
import { usePreview } from '@/views/app/composables/usePreview'

// 使用 composables
const { app, appStatus, getAppStatusById, initByAppId } = useApp()
const {
  messages,
  isLoading: chatLoading,
  isLoadingHistory,
  hasMoreHistory,
  historyPageNum,
  historyTotal,
  firstLoad,
  generatingText,
  getChatHistoryById,
  buildMessage,
} = useChat()
const {
  url: previewUrl,
  isLoading: previewLoading,
  preview: previewState,
  progressText,
  handlePreview,
} = usePreview()

// 下载状态
const downloadLoading = ref(false)

const isVisibleOfDrawer = ref(false)
const newMessage = ref('')
const isEditMode = ref(false)
const selectedElementInfo = ref('')

const messageListRef = ref<HTMLElement | null>(null)
const navKey = ref('0')
const contentKey = ref(0)
const loadHistoryCount = ref(0)
const route = useRoute()
const router = useRouter()

const welcomeMessage = `# 👋 欢迎使用 CodeCraftAI
我是您的 AI 编程助手，可以帮助您快速生成、优化和调试代码。请在下方输入您的需求！`

const appId = computed(() => {
  return (route.query.appId as string) || app.id
})

const appInfo = computed(() => {
  return app.data
})

const isOwner = computed(() => {
  return app.isOwner || false
})

const statusText = computed(() => {
  console.log(previewState)
  if (chatLoading.value) return '生成中'
  if (appStatus.previewStatus === 'LOADED') return '可预览'
  if (messages.value.length === 0) return '等待输入'
  return '已完成'
})

const statusColor = computed(() => {
  if (chatLoading.value) return 'processing'
  if (appStatus.previewStatus === 'LOADED') return 'success'
  return 'default'
})

onMounted(async () => {
  // 进入页面后初始化数据
  if (!route.query.appId) {
    message.error('该应用或许不存在')
    await router.push('/')
    return
  }
  const id = route.query.appId as string
  await loadAppData(id)

  const actionParam = Number(route.query.action)
  if (actionParam === 1) {
    const userMessage = route.query.userMessage as string
    if (userMessage) {
      const userMsg = buildMessage('user', userMessage, false)
      messages.value.push(userMsg)
      await startCodeGeneration(userMessage)
      // 生成成功后移除URL中的action=1参数
      await removeActionParam()
    }
  } else if (route.query.userMessage) {
    // 如果有用户消息但action不为1，只添加消息不生成
    const userMessage = route.query.userMessage as string
    const userMsg = buildMessage('user', userMessage, false)
    messages.value.push(userMsg)
  }
})

const conversationStats = computed(() => {
  // 统计用户消息总数
  const userMessages = messages.value.filter((m) => m.type === 'user')
  const messageCount = historyTotal.value

  // 计算最近一次对话的响应时间
  let lastGenerationTime = null

  // 找到最近的用户消息
  if (userMessages.length > 0) {
    const lastUserMessage = userMessages[userMessages.length - 1]

    // 找到该用户消息之后的第一个AI回复
    const subsequentAiMessage = messages.value.find(
      (m) => m.type === 'ai' && m.timestamp > lastUserMessage.timestamp && !m.isLoading,
    )

    // 计算响应时间（秒）
    if (subsequentAiMessage) {
      lastGenerationTime = Math.round(
        (subsequentAiMessage.timestamp - lastUserMessage.timestamp) / 1000,
      )
    }
  }

  return {
    messageCount,
    lastGenerationTime,
  }
})

const handleLogoMouseOver = () => {
  isVisibleOfDrawer.value = true
}

const handleLogoMouseLeave = () => {
  isVisibleOfDrawer.value = false
}

const handleStartEditMode = () => {
  isEditMode.value = !isEditMode.value
  if (isEditMode.value) {
    injectEditScriptToIframe()
  } else {
    removeEditScriptFromIframe()
  }
}

useInfiniteScroll(
  messageListRef,
  async () => {
    await getChatHistoryById(appId.value)
    historyPageNum.value += 1
  },
  {
    distance: 50,
    direction: 'top',
    canLoadMore: () =>
      hasMoreHistory.value && !isLoadingHistory.value && loadHistoryCount.value === 1,
  },
)

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
    message.error(`移除URL参数失败: ${error instanceof Error ? error.message : '未知错误'}`)
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
    chatLoading.value = false
  }

  // 统一错误处理
  const handleError = (errorMessage: string) => {
    if (streamCompleted) return

    streamCompleted = true
    cleanupResources()
    handleGenerationError(errorMessage)
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
          await handlePreview(appId.value, true)
        } catch (previewError) {
          console.error('预览更新失败:', previewError)
        }
      }
    }, 1000)
  }

  // 初始化UI状态
  previewState.value = false

  const aiMessage = buildMessage('ai', '', true)
  messages.value.push(aiMessage)
  chatLoading.value = true

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
          const currentMessage = messages.value[messages.value.length - 1]
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
        await getAppStatusById(appId.value)
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

const handleGenerationError = (errorMessage: string) => {
  // 实现错误处理逻辑，更新消息内容显示错误
  const lastMessage = messages.value[messages.value.length - 1]
  if (lastMessage) {
    lastMessage.content = errorMessage
    lastMessage.isLoading = false
    lastMessage.error = errorMessage
  }
  chatLoading.value = false
  scrollToBottom()
}

/**
 * 处理预览按钮点击
 */
const handlePreviewClick = async () => {
  if (!appId.value) return
  await handlePreview(appId.value, true)
  // 更新应用状态
  await getAppStatusById(appId.value)
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
      onOk: () => handleDeploy(),
    })
  }
}

/**
 * 处理部署
 */
const handleDeploy = async () => {
  if (!appId.value) return
  appStatus.loading = true
  try {
    // todo 这里后期需要根据配置的 nginx 进行路由跳转
    await putAppDeploy({ appId: appId.value })

    // 获取最新状态
    await getAppStatusById(appId.value)
  } catch (error) {
    console.error('部署失败:', error)
    message.error(`部署失败: ${error instanceof Error ? error.message : '请重试'}`)
  } finally {
    appStatus.loading = false
  }
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
 * 处理应用项点击事件
 */
const handleAppClick = async (app: API.AppInfoCommonResVo) => {
  if (!app || !app.id) return

  try {
    isVisibleOfDrawer.value = false
    await router.push('/App/code-message?appId=' + app.id)
    // 应用切换由 watch(appId) 处理，确保与无限滚动协调
  } catch (error) {
    console.error('应用跳转失败', error)
    message.error(`应用跳转失败: ${error instanceof Error ? error.message : '未知错误'}`)
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
  let content = newMessage.value.trim()
  if (!content || chatLoading.value) return

  // 如果有选中的元素信息，拼接到消息中
  if (selectedElementInfo.value) {
    content += `\n\n选中的元素: ${selectedElementInfo.value}`
    selectedElementInfo.value = '' // 发送后清空选中信息
  }

  messages.value.push(buildMessage('user', content, false))

  newMessage.value = ''
  previewUrl.value = ''
  previewState.value = false
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
  } catch (error) {
    console.error('复制失败:', error)
    message.error(`复制失败: ${error instanceof Error ? error.message : '未知错误'}`)
  }
}

/**
 * 打开新窗口预览
 */
const openPreviewInNewTab = () => {
  if (previewUrl.value) {
    window.open(previewUrl.value, '_blank')
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
    message.error(`下载失败: ${error instanceof Error ? error.message : '请稍后重试'}`)
  } finally {
    downloadLoading.value = false
  }
}
/**
 * 加载应用数据（历史记录和应用信息）
 */
const loadAppData = async (appId: string) => {
  firstLoad.value = true
  historyPageNum.value = 1
  loadHistoryCount.value = 0
  await initByAppId(appId)
  await getChatHistoryById(appId)
  navKey.value += 1
  contentKey.value += 1
  scrollToBottom()
  // 等待 50ms
  await new Promise((resolve) => setTimeout(resolve, 50))
  loadHistoryCount.value += 1
}

// 监听 appId 变化，处理应用切换
watch(appId, async (newAppId, oldAppId) => {
  if (newAppId && newAppId !== oldAppId) {
    await loadAppData(newAppId)
  }
})

// 添加组件卸载时的清理逻辑
onUnmounted(() => {
  // 清理可能的异步操作和事件监听器
  if (chatLoading.value) {
    chatLoading.value = false
  }
  if (previewLoading.value) {
    previewLoading.value = false
  }
  // 移除消息监听器
  window.removeEventListener('message', handleIframeMessage)
})

// 监听 iframe 消息
const handleIframeMessage = (event: MessageEvent) => {
  if (event.data.type === 'elementSelected') {
    selectedElementInfo.value = event.data.elementInfo
    message.info(`已选择元素: ${event.data.elementInfo}`)
  }
}

// 添加消息监听器
window.addEventListener('message', handleIframeMessage)

// 向 iframe 注入编辑脚本
const injectEditScriptToIframe = () => {
  const iframe = document.querySelector('iframe')
  if (!iframe) {
    message.error('未找到 iframe')
    return
  }

  const scriptContent = `
    (function() {
      let selectedElement = null;
      let selectionOverlay = null;
      let actionButtons = null;
      let isEditModeActive = true;

      // 创建选择覆盖层
      function createSelectionOverlay() {
        selectionOverlay = document.createElement('div');
        selectionOverlay.style.position = 'fixed';
        selectionOverlay.style.border = '2px dashed #1890ff';
        selectionOverlay.style.backgroundColor = 'rgba(24, 144, 255, 0.1)';
        selectionOverlay.style.pointerEvents = 'none';
        selectionOverlay.style.zIndex = '9999';
        selectionOverlay.style.display = 'none';
        document.body.appendChild(selectionOverlay);
      }

      // 创建操作按钮
      function createActionButtons() {
        actionButtons = document.createElement('div');
        actionButtons.style.position = 'fixed';
        actionButtons.style.background = 'white';
        actionButtons.style.border = '1px solid #d9d9d9';
        actionButtons.style.borderRadius = '4px';
        actionButtons.style.padding = '8px';
        actionButtons.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
        actionButtons.style.zIndex = '10000';
        actionButtons.style.display = 'none';
        actionButtons.style.pointerEvents = 'auto'; // 确保按钮可点击
        
        const confirmBtn = document.createElement('button');
        confirmBtn.textContent = '确认';
        confirmBtn.style.marginRight = '8px';
        confirmBtn.style.padding = '6px 12px';
        confirmBtn.style.background = '#1890ff';
        confirmBtn.style.color = 'white';
        confirmBtn.style.border = 'none';
        confirmBtn.style.borderRadius = '4px';
        confirmBtn.style.cursor = 'pointer';
        confirmBtn.onclick = handleConfirm;
        
        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = '取消';
        cancelBtn.style.padding = '6px 12px';
        cancelBtn.style.background = '#f5f5f5';
        cancelBtn.style.color = '#666';
        cancelBtn.style.border = '1px solid #d9d9d9';
        cancelBtn.style.borderRadius = '4px';
        cancelBtn.style.cursor = 'pointer';
        cancelBtn.onclick = handleCancel;
        
        actionButtons.appendChild(confirmBtn);
        actionButtons.appendChild(cancelBtn);
        document.body.appendChild(actionButtons);
      }

      // 处理元素选择
      function handleElementHover(e) {
        if (!isEditModeActive || selectedElement) return;
        
        const element = e.target;
        // 跳过按钮、覆盖层元素及其子元素
        if (element === actionButtons || actionButtons.contains(element) ||
            element === selectionOverlay || selectionOverlay.contains(element)) {
          return;
        }
        
        const rect = element.getBoundingClientRect();
        
        // 更新选择覆盖层位置
        selectionOverlay.style.display = 'block';
        selectionOverlay.style.left = rect.left + 'px';
        selectionOverlay.style.top = rect.top + 'px';
        selectionOverlay.style.width = rect.width + 'px';
        selectionOverlay.style.height = rect.height + 'px';
      }

      // 处理元素点击
      function handleElementClick(e) {
        if (!isEditModeActive) return;
        
        // 如果点击的是按钮或按钮的子元素，不处理
        if (e.target === actionButtons || actionButtons.contains(e.target)) {
          return;
        }
        
        e.preventDefault();
        e.stopPropagation();
        
        selectedElement = e.target;
        const rect = selectedElement.getBoundingClientRect();
        
        // 更新选择覆盖层
        selectionOverlay.style.border = '2px solid #1890ff';
        selectionOverlay.style.backgroundColor = 'rgba(24, 144, 255, 0.2)';
        selectionOverlay.style.left = rect.left + 'px';
        selectionOverlay.style.top = rect.top + 'px';
        selectionOverlay.style.width = rect.width + 'px';
        selectionOverlay.style.height = rect.height + 'px';
        
        // 显示操作按钮
        actionButtons.style.display = 'flex';
        actionButtons.style.flexDirection = 'row';
        actionButtons.style.gap = '8px';
        
        // 确保按钮在视口内
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const buttonWidth = actionButtons.offsetWidth;
        const buttonHeight = actionButtons.offsetHeight;
        
        let buttonLeft = rect.left + window.scrollX;
        let buttonTop = rect.bottom + window.scrollY + 10;
        
        // 如果按钮超出右边界，调整位置
        if (buttonLeft + buttonWidth > viewportWidth) {
          buttonLeft = Math.max(10, viewportWidth - buttonWidth - 10);
        }
        
        // 如果按钮超出底部边界，调整到元素上方
        if (buttonTop + buttonHeight > viewportHeight + window.scrollY) {
          buttonTop = Math.max(10, rect.top + window.scrollY - buttonHeight - 10);
        }
        
        // 确保按钮位置有效
        buttonLeft = Math.max(0, buttonLeft);
        buttonTop = Math.max(0, buttonTop);
        
        actionButtons.style.left = buttonLeft + 'px';
        actionButtons.style.top = buttonTop + 'px';
        
        // 强制重绘以确保按钮显示
        actionButtons.style.opacity = '1';
      }

      // 处理确认
      function handleConfirm(e) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        
        if (selectedElement) {
          const elementInfo = getElementInfo(selectedElement);
          window.parent.postMessage({
            type: 'elementSelected',
            elementInfo: elementInfo
          }, '*');
          
          cleanup();
        }
      }

      // 处理取消
      function handleCancel(e) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        cleanup();
      }

      // 清理函数
      function cleanup() {
        selectedElement = null;
        selectionOverlay.style.display = 'none';
        actionButtons.style.display = 'none';
        selectionOverlay.style.border = '2px dashed #1890ff';
        selectionOverlay.style.backgroundColor = 'rgba(24, 144, 255, 0.1)';
      }

      // 获取元素信息
      function getElementInfo(element) {
        const info = {
          tag: element.tagName.toLowerCase(),
          id: element.id || '',
          class: element.className || '',
          text: element.textContent?.trim().substring(0, 50) || '',
          type: element.type || ''
        };
        
        return \`\${info.tag}\${info.id ? '#' + info.id : ''}\${info.class ? '.' + info.class.replace(/\\\\s+/g, '.') : ''} \${info.text ? '文本: ' + info.text : ''}\${info.type ? '类型: ' + info.type : ''}\`.trim();
      }

      // 初始化
      function init() {
        createSelectionOverlay();
        createActionButtons();
        
        document.addEventListener('mousemove', handleElementHover);
        document.addEventListener('click', handleElementClick);
      }

      // 清理事件监听器
      function destroy() {
        isEditModeActive = false;
        document.removeEventListener('mousemove', handleElementHover);
        document.removeEventListener('click', handleElementClick);
        
        if (selectionOverlay && selectionOverlay.parentNode) {
          selectionOverlay.parentNode.removeChild(selectionOverlay);
        }
        
        if (actionButtons && actionButtons.parentNode) {
          actionButtons.parentNode.removeChild(actionButtons);
        }
      }

      // 启动编辑模式
      init();

      // 存储销毁函数以便后续调用
      window.__editModeDestroy = destroy;
    })();
  `

  try {
    // 等待 iframe 加载完成
    iframe.onload = function () {
      const iframeDoc =
        iframe.contentDocument || (iframe.contentWindow ? iframe.contentWindow.document : null)
      if (iframeDoc) {
        const script = iframeDoc.createElement('script')
        script.textContent = scriptContent
        iframeDoc.head.appendChild(script)
        message.success('已进入编辑模式')
      }
    }

    // 如果 iframe 已经加载，立即注入
    if (iframe.contentDocument && iframe.contentDocument.readyState === 'complete') {
      const iframeDoc = iframe.contentDocument
      const script = iframeDoc.createElement('script')
      script.textContent = scriptContent
      iframeDoc.head.appendChild(script)
      message.success('已进入编辑模式')
    }
  } catch (error) {
    console.error('注入脚本失败:', error)
    message.error('注入脚本失败')
  }
}

// 从 iframe 移除编辑脚本
const removeEditScriptFromIframe = () => {
  const iframe = document.querySelector('iframe')
  if (!iframe) return

  try {
    const iframeWindow = iframe.contentWindow as IframeWindow
    if (iframeWindow && iframeWindow.__editModeDestroy) {
      iframeWindow.__editModeDestroy()
      message.info('已退出编辑模式')
    }
  } catch (error) {
    console.error('移除脚本失败:', error)
  }
}
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

.app-list-section h4 {
  margin-bottom: 12px;
  color: #1f2937;
  font-weight: 600;
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
