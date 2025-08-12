<template>
  <div class="code-message-container">

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 左侧区域：对话式交互 -->
      <div class="left-panel">
        <!-- 对话区域 -->
        <div class="chat-section">
          <div class="chat-header">
            <h3>与 AI 对话</h3>
            <div class="status-indicator">
              <a-spin v-if="isGenerating" size="small" />
              <span v-else class="status-text">{{ generatedCode ? '生成完成' : '等待生成' }}</span>
            </div>
          </div>

          <!-- 对话消息列表 -->
          <div class="chat-container">
            <div class="message-list" ref="messageListRef">
              <!-- 欢迎消息 -->
              <div v-if="!userMessage && !generatedCode" class="message ai-message welcome-message">
                <div class="message-avatar">
                  <img src="@/assets/codeAi 无背景.png" alt="AI" class="ai-avatar" />
                </div>
                <div class="message-content">
                  <MarkdownRenderer :content="welcomeMessage" />
                </div>
              </div>

              <!-- 用户消息 -->
              <div v-if="userMessage" class="message user-message">
                <div class="message-content">
                  <MarkdownRenderer :content="userMessage" />
                </div>
                <div class="message-avatar">
                  <div class="user-avatar">👤</div>
                </div>
              </div>

              <!-- AI 回复消息 -->
              <div v-if="userMessage" class="message ai-message">
                <div class="message-avatar">
                  <img src="@/assets/codeAi 无背景.png" alt="AI" class="ai-avatar" />
                </div>
                <div class="message-content">
                  <div v-if="isGenerating && !generatedCode" class="generating-indicator">
                    <a-spin size="small" />
                    <span>AI 正在思考您的需求...</span>
                  </div>
                  <div v-else-if="generatedCode" class="markdown-content code-display">
                    <MarkdownRenderer :content="generatedCode" />
                  </div>
                  <div v-else-if="!isGenerating" class="markdown-content">
                    <p>我已经收到您的需求，正在为您生成代码...</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- 输入区域 -->
            <div class="chat-input-area">
              <textarea v-model="newMessage" class="chat-input" placeholder="请描述您的需求，例如：创建一个待办事项应用..."
                :disabled="isGenerating" @keydown.ctrl.enter="sendMessage" rows="3"></textarea>
              <button class="send-button" :disabled="!newMessage.trim() || isGenerating" @click="sendMessage">
                {{ isGenerating ? '生成中...' : '发送' }}
              </button>
            </div>
            <div class="chat-tips">
              <kbd>Ctrl</kbd> + <kbd>Enter</kbd> 快速发送
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：预览区域 -->
      <div class="right-panel">
        <div class="preview-section">
          <div class="preview-header">
            <h3>应用预览</h3>
            <div class="preview-actions">
              <a-button type="primary" :loading="isDeploying" :disabled="!canPreview" @click="handlePreview"
                size="small">
                {{ previewButtonText }}
              </a-button>
            </div>
          </div>
          <div class="preview-content">
            <div v-if="isDeploying" class="deploying-placeholder">
              <a-spin size="large" tip="正在部署应用..." />
              <p class="deploy-tip">部署完成后即可预览您的应用</p>
            </div>
            <div v-else-if="previewUrl" class="preview-iframe-container">
              <iframe :src="previewUrl" frameborder="0" class="preview-iframe" @load="handleIframeLoad"></iframe>
            </div>
            <div v-else class="preview-empty">
              <div class="preview-empty-content">
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
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MarkdownRenderer from '@/components/MarkdownRenderer.vue'
import { deployPreview } from '@/api/jingtaiziyuanbushukongzhiqi'
import { BASE_URL } from '@/config/apiConfig'

// 状态管理
const appId = ref()
const userMessage = ref('')
const newMessage = ref('')
const generatedCode = ref('')
const isGenerating = ref(false)
const isDeploying = ref(false)
const previewUrl = ref('')
const canPreview = ref(false)
const eventSource = ref<EventSource | null>(null)
let connectionTimeout: number | null = null
const messageListRef = ref<HTMLElement | null>(null)

const route = useRoute()
const router = useRouter()

// 欢迎消息
const welcomeMessage = `# 👋 欢迎使用 CodeCraftAI

我是您的 AI 编程助手，可以帮助您：

- 🚀 **快速生成代码** - 根据需求描述生成完整的应用代码
- 💡 **智能优化** - 提供代码优化建议和最佳实践
- 🔧 **问题解决** - 帮助调试和修复代码问题
- 📚 **技术指导** - 解答编程相关问题

请在下方输入您的需求，我将为您生成高质量的代码！`

const previewButtonText = computed(() => {
  if (isDeploying.value) return '部署中...'
  if (previewUrl.value) return '重新预览'
  return '立即预览'
})

// 初始化
onMounted(() => {
  const id = route.query.appId
  const message = route.query.message
  const action = route.query.action

  if (!id || !message) {
    router.push('/')
    return
  }

  appId.value = id as string
  userMessage.value = message as string

  // 开始生成代码
  if (action === "true") {
    startCodeGeneration()
  }

})

// 清理
onUnmounted(() => {
  if (eventSource.value) {
    eventSource.value.close()
    eventSource.value = null
  }
  if (connectionTimeout) {
    clearTimeout(connectionTimeout)
  }
})

// 关闭SSE连接的统一方法
const closeConnection = () => {
  console.log('正在关闭SSE连接')
  isGenerating.value = false
  canPreview.value = true

  // 清除超时定时器
  if (connectionTimeout) {
    clearTimeout(connectionTimeout)
    connectionTimeout = null
  }

  // 延迟滚动确保最后内容显示
  setTimeout(() => {
    scrollToBottom()
  }, 100)

  if (eventSource.value) {
    eventSource.value.close()
    eventSource.value = null
    console.log('SSE连接已关闭')
  }
}

// 开始代码生成
const startCodeGeneration = async () => {
  if (!appId.value || !userMessage.value) return

  isGenerating.value = true
  generatedCode.value = ''

  try {
    // 使用 EventSource 进行 SSE 连接
    // 使用配置文件中的基础URL拼接完整的后端服务地址
    const url = `${BASE_URL}/app/generate/code?message=${encodeURIComponent(userMessage.value)}&appId=${appId.value}`
    eventSource.value = new EventSource(url, { withCredentials: true })

    // 设置超时机制，5分钟后自动关闭连接
    connectionTimeout = setTimeout(() => {
      console.log('SSE连接超时，自动关闭')
      closeConnection()
    }, 5 * 60 * 1000) // 5分钟

    // 监听所有可能的结束事件
    eventSource.value.addEventListener('done', () => {
      console.log('收到done事件，代码生成完成')
      closeConnection()
    }, { once: true })

    // 监听自定义事件（可能是end或finish）
    eventSource.value.addEventListener('end', () => {
      console.log('收到end事件，代码生成完成')
      closeConnection()
    }, { once: true })

    eventSource.value.addEventListener('finish', () => {
      console.log('收到finish事件，代码生成完成')
      closeConnection()
    }, { once: true })

    // 统一的message事件处理（合并之前的重复逻辑）
    eventSource.value.onmessage = (event) => {
      console.log('收到SSE数据:', event.data) // 添加调试日志
      
      try {
        const data = JSON.parse(event.data)
        console.log('解析后的数据:', data) // 添加调试日志

        // 检查是否是结束标记
        if (data.type === 'done' || data.event === 'done' || data.status === 'completed') {
          console.log('在message事件中检测到完成标记:', data)
          closeConnection()
          return
        }

        if (data.d) {
          console.log('接收到内容片段，长度:', data.d.length) // 添加调试日志
          // 直接追加内容，立即更新UI
          generatedCode.value += data.d

          // 立即滚动到底部，提供更流畅的体验
          nextTick(() => {
            scrollToBottom()
          })
        }
      } catch (e) {
        console.error('解析SSE数据失败:', e, '原始数据:', event.data)
        // 如果解析失败，检查是否是纯文本的结束标记
        if (event.data === 'done' || event.data === '[DONE]' || event.data === 'END') {
          console.log('检测到文本结束标记:', event.data)
          closeConnection()
        }
      }
    }

    eventSource.value.onerror = (error) => {
      console.error('SSE连接错误:', error)
      closeConnection()
    }

  } catch (error) {
    console.error('开始代码生成失败:', error)
    isGenerating.value = false
  }
}

// 自动滚动到底部
/**
 * 自动滚动到代码显示区域底部
 * - 优先选择新布局下的 .code-display 容器
 * - 向下兼容旧布局的 .code-content 容器
 */
const scrollToBottom = () => {
  nextTick(() => {
    const container = messageListRef.value
    if (container) {
      container.scrollTop = container.scrollHeight
    }
  })
}

// 处理预览
const handlePreview = async () => {
  if (!canPreview.value || isDeploying.value) return

  isDeploying.value = true

  try {
    const response = await deployPreview({ appId: appId.value })
    const deployKey = response
    // 构建预览URL
    previewUrl.value = `${BASE_URL}/deploy/redirect/${deployKey}`
  } catch (error) {
    console.error('部署预览出错:', error)
  } finally {
    isDeploying.value = false
  }
}

// 处理iframe加载
const handleIframeLoad = () => {
  console.log('预览加载完成')
}

// 发送消息给AI
const sendMessage = () => {
  if (!newMessage.value.trim() || isGenerating.value) return

  // 更新用户消息
  userMessage.value = newMessage.value

  // 重置生成状态
  generatedCode.value = ''
  canPreview.value = false
  previewUrl.value = ''

  // 开始生成代码
  startCodeGeneration()

  // 清空输入框
  newMessage.value = ''

  // 滚动到底部显示新消息
  nextTick(() => {
    scrollToBottom()
  })
}
</script>

<style scoped>
.code-message-container {
  height: 84vh;
  background: #f7f8fa;
  color: #333;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  /* 防止外层滚动 */
}

/* 主体左右5:5布局 */
.main-content {
  display: flex;
  gap: 24px;
  padding: 16px;
  /* 减去 BasicLayout 的 padding 和 gap */
  height: calc(100vh - 64px - 48px - 24px);
  /* 100vh - header高度 - footer高度 - layout的padding */
  flex: 1;
  min-height: 0;
}

/* 左侧面板 */
.left-panel {
  flex: 1;
  /* 改为flex: 1以实现动态缩放 */
  display: flex;
  flex-direction: column;
  min-width: 0;
  /* 防止内容溢出 */
}

/* 对话区域 */
.chat-section {
  flex: 1;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
}

.chat-header {
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.chat-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-text {
  font-size: 14px;
  color: #6b7280;
}

.chat-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #f7f8fa;
}

.message-list {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
  scroll-behavior: smooth;
}

.message {
  display: flex;
  gap: 12px;
  max-width: 90%;
  align-items: flex-start;
}

/* 用户消息样式 */
.user-message {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.user-message .message-content {
  background: #3b82f6;
  color: white;
  border-radius: 12px 12px 0 12px;
}

/* AI消息样式 */
.ai-message {
  align-self: flex-start;
}

.ai-message .message-content {
  background: #ffffff;
  color: #374151;
  border: 1px solid #e5e7eb;
  border-radius: 12px 12px 12px 0;
}

.message-content {
  padding: 12px 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  font-size: 14px;
  line-height: 1.6;
  word-break: break-word;
  /* 修复长单词溢出问题 */
  white-space: pre-wrap;
  /* 保证长内容能换行 */
  overflow-wrap: break-word;
  /* 确保长内容能够换行 */
  max-width: 100%;
  /* 防止内容超出容器宽度 */
  overflow-x: hidden;
  /* 隐藏横向滚动条 */
}

/* 欢迎消息特殊样式 */
.welcome-message .message-content {
  background: #fff;
  border: 1px solid #e5e7eb;
}

/* 头像样式 */
.message-avatar {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  overflow: hidden;
}

.ai-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-avatar {
  width: 100%;
  height: 100%;
  background: #dbeafe;
  color: #3b82f6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 500;
}

/* 生成指示器 */
.generating-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #6b7280;
  font-style: italic;
  padding: 8px 0;
}

/* Markdown内容样式 */
.markdown-content {
  line-height: 1.7;
  font-size: 14px;
  word-break: break-word;
  /* 确保内容不会溢出 */
  white-space: normal;
  /* 覆盖 pre 标签的样式 */
  overflow-wrap: break-word;
  /* 确保长内容能够换行 */
  max-width: 100%;
  /* 防止内容超出容器宽度 */
}

.user-message .markdown-content :deep(h1),
.user-message .markdown-content :deep(h2),
.user-message .markdown-content :deep(h3) {
  color: white;
}

.ai-message .markdown-content :deep(code) {
  background: rgba(0, 0, 0, 0.05);
  padding: 2px 5px;
  border-radius: 4px;
  font-family: 'SF Mono', 'Monaco', monospace;
  font-size: 0.9em;
}

.user-message .markdown-content :deep(code) {
  background: rgba(255, 255, 255, 0.15);
  color: #e0e0e0;
}


/* 聊天输入区域 */
.chat-input-area {
  padding: 16px 20px;
  border-top: 1px solid #e5e7eb;
  background: #fff;
}

.chat-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.5;
  resize: none;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  font-family: inherit;
}

.chat-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.chat-input-area {
  position: relative;
}

.send-button {
  position: absolute;
  right: 30px;
  bottom: 28px;
  padding: 6px 12px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.send-button:hover:not(:disabled) {
  background: #2563eb;
}

.send-button:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.chat-tips {
  padding-top: 8px;
  font-size: 12px;
  color: #9ca3af;
  text-align: right;
  padding-right: 4px;
}

.chat-tips kbd {
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 11px;
  color: #4b5563;
  font-family: monospace;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
}

/* 右侧面板 */
.right-panel {
  flex: 1;
  /* 改为flex: 1以实现动态缩放 */
  display: flex;
  flex-direction: column;
  min-width: 0;
  /* 防止内容溢出 */
}

.preview-section {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.preview-header {
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
}

.preview-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.preview-content {
  flex: 1;
  overflow: hidden;
  position: relative;
  background: #f7f8fa;
}

.preview-iframe-container {
  width: 100%;
  height: 100%;
}

.preview-iframe {
  width: 100%;
  height: 100%;
  border: none;
}

.deploying-placeholder,
.preview-empty {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  color: #6b7280;
  text-align: center;
  padding: 20px;
}

.deploy-tip {
  margin-top: 16px;
  color: #6b7280;
  font-size: 14px;
}

.preview-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.6;
}

.preview-empty-content h4 {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 500;
  color: #4b5563;
}

.preview-empty-content p {
  margin: 0;
  font-size: 14px;
  color: #9ca3af;
}

/* 响应式 */
@media (max-width: 1024px) {
  .main-content {
    grid-template-columns: 1fr;
    height: auto;
  }

  .left-panel,
  .right-panel {
    height: 80vh;
    /* 在移动端给一个固定高度 */
  }
}
</style>
