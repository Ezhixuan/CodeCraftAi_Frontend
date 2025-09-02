import { ref, computed } from 'vue'
import { message } from 'ant-design-vue'
import { getChatHisList } from '@/api/chatHistoryController.ts'

export interface ChatMessage {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: number
  isLoading?: boolean
  error?: string
}

/**
 * 聊天功能管理 composable
 */
export function useChat() {
  const messages = ref<ChatMessage[]>([])
  const currentMessageId = ref('-1')
  const currentMessageIndex = ref(-1)
  const isLoading = ref(false)
  // 分页相关
  const isLoadingHistory = ref(false)
  const hasMoreHistory = ref(true)
  const historyPageSize = ref(4)
  const historyPageNum = ref(1)
  const lastCreateTime = ref<string>('')
  const firstLoad = ref(true)
  const historyTotal = ref(0)

  const generatingTexts = [
    'AI 正在分析您的需求...',
    'AI 正在设计应用架构...',
    'AI 正在编写核心代码...',
    'AI 正在优化代码结构...',
  ]

  const generatingTextIndex = ref(0)

  const generatingText = computed(
    () => generatingTexts[generatingTextIndex.value % generatingTexts.length],
  )

  /**
   * 获取聊天历史记录
   */
  const getChatHistoryById = async (currentAppId?: string) => {
    if (!currentAppId) return
    console.log('num', historyPageNum.value)
    isLoadingHistory.value = true
    try {
      const response = await getChatHisList({
        reqVo: {
          pageNo: historyPageNum.value,
          pageSize: historyPageSize.value,
          appId: currentAppId,
          orderBy: 'desc',
        },
      })
      if (response.data.data?.list) {
        const chatHisList = response.data.data.list
        const historyMessages: ChatMessage[] = chatHisList.map((item: API.ChatInfoResVo) => ({
          id: item.id || generateId(),
          type: item.messageType === 'user' ? 'user' : 'ai',
          content: item.message || '',
          timestamp: new Date(item.createTime || '').getTime(),
        }))

        if (firstLoad.value) {
          messages.value = historyMessages
          firstLoad.value = false
          historyTotal.value = Number(response.data.data.totalRow)
        } else {
          // 不是首次则将获取的历史数据向头部插入
          messages.value = [...historyMessages, ...messages.value]
        }

        // 更新数据以便下次查询使用
        hasMoreHistory.value = chatHisList.length >= historyPageSize.value
      }
    } catch (error) {
      console.error('获取聊天记录失败:', error)
      message.error(`获取聊天记录失败: ${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      isLoadingHistory.value = false
    }
  }

  /**
   * 生成消息 ID
   */
  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2)
  }

  /**
   * 构建消息对象
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

  return {
    messages,
    currentMessageId,
    currentMessageIndex,
    isLoading,
    isLoadingHistory,
    hasMoreHistory,
    historyPageSize,
    historyPageNum,
    lastCreateTime,
    firstLoad,
    historyTotal,
    generatingText,
    getChatHistoryById,
    buildMessage,
    generateId,
  }
}
