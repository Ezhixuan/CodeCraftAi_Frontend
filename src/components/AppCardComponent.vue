<template>
  <div class="dark-tech-app-card" :class="{ 'is-interactive': interactive, 'is-loading': loading }">
    <!-- 卡片头部 -->
    <div class="card-header">
      <div class="header-left">
        <h3 class="app-title">{{ computedTitle }}</h3>
        <span v-if="subtitle" class="app-subtitle">{{ subtitle }}</span>
      </div>
      <div class="header-controls">
        <span class="control-dot active"></span>
        <span class="control-dot"></span>
        <span class="control-dot"></span>
      </div>
    </div>

    <!-- 卡片内容 -->
    <div class="card-content">
      <!-- 加载状态 -->
      <div v-if="loading || isLoading" class="loading-content">
        <div class="loading-placeholder">
          <div class="loading-bar" style="--delay: 0s"></div>
          <div class="loading-bar" style="--delay: 0.2s"></div>
          <div class="loading-bar" style="--delay: 0.4s"></div>
        </div>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error" class="error-content">
        <div class="error-message">
          <span>{{ error }}</span>
        </div>
      </div>

      <!-- 应用封面图片 -->
      <div v-else-if="currentAppInfo" class="cover-content">
        <img
          v-if="currentAppInfo.cover"
          :src="currentAppInfo.cover"
          :alt="currentAppInfo.name"
          class="app-cover"
          @error="handleCoverError"
        />
        <img v-else :src="getRandomCoverUrl()" :alt="currentAppInfo.name" class="app-cover" />
      </div>
    </div>

    <!-- 卡片信息 -->
    <div class="card-info">
      <div class="info-left">
        <h4 class="info-title">{{ computedInfoTitle }}</h4>
        <p class="info-description">{{ computedInfoDescription }}</p>
        <div v-if="currentAppInfo?.userInfo" class="info-user">
          <UserAvatar
            :user-id="currentAppInfo.userInfo.id"
            show-name
            size="small"
            name-color="#ffffff"
          />
          <span v-if="currentAppInfo.updateTime" class="update-time">
            更新于 {{ formatUpdateTime(currentAppInfo.updateTime) }}
          </span>
        </div>
      </div>
    </div>

    <!-- 悬停遮罩 -->
    <div v-if="interactive" class="hover-overlay">
      <div class="overlay-content">
        <slot name="overlay">
          <button class="overlay-button" @click="handleAction">
            {{ actionText || '立即体验' }}
          </button>
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watchEffect, onMounted, computed } from 'vue'
import { getInfo } from '@/api/yingyongkongzhiqi'
import UserAvatar from './UserAvatarComponent.vue'

interface Props {
  title?: string
  subtitle?: string
  description?: string
  interactive?: boolean
  loading?: boolean
  actionText?: string
  infoTitle?: string
  infoDescription?: string
  appId?: string
  appInfo?: API.AppInfoCommonResVo
}

const props = withDefaults(defineProps<Props>(), {
  type: 'chart',
  interactive: false,
  loading: false,
})

const currentAppInfo = ref<API.AppInfoCommonResVo>()
const isLoading = ref(false)
const error = ref<string | null>(null)

const computedTitle = computed(() => currentAppInfo.value?.name || props.title || '未命名应用')
const computedDescription = computed(() => props.description || '暂无描述')
const computedInfoTitle = computed(() => props.infoTitle || computedTitle.value)
const computedInfoDescription = computed(() => props.infoDescription || computedDescription.value)

/**
 * 加载应用信息
 * 优先使用传入的 appInfo，如果没有则通过 appId 调用接口获取
 */
const loadAppInfo = async () => {
  // 如果直接提供了 appInfo，则使用它
  if (props.appInfo) {
    currentAppInfo.value = props.appInfo
    isLoading.value = false
    error.value = null
    return
  }

  // 如果没有 appId，则清空数据
  if (!props.appId) {
    currentAppInfo.value = undefined
    isLoading.value = false
    error.value = null
    return
  }

  // 通过 appId 调用接口获取应用信息
  isLoading.value = true
  error.value = null

  try {
    const data = await getInfo({ id: props.appId })
    currentAppInfo.value = data.data.data
  } catch (err) {
    console.error('Failed to load app info:', err)
    error.value = '获取应用信息失败'
  } finally {
    isLoading.value = false
  }
}

// 监听 appInfo 和 appId 的变化，统一处理数据加载逻辑
watchEffect(() => {
  loadAppInfo()
})

onMounted(() => {
  loadAppInfo()
})

const emit = defineEmits<{
  action: []
}>()

const handleAction = () => {
  emit('action')
}

const formatUpdateTime = (timestamp: string | number) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    if (diffHours === 0) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60))
      return `${diffMinutes}分钟前`
    }
    return `${diffHours}小时前`
  } else if (diffDays === 1) {
    return '昨天'
  } else if (diffDays < 7) {
    return `${diffDays}天前`
  } else {
    return date.toLocaleDateString('zh-CN')
  }
}

// 处理封面图片加载错误
const handleCoverError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = getRandomCoverUrl()
}

// 获取随机封面图片URL
const getRandomCoverUrl = () => {
  const width = 300
  const height = 200
  const randomId = Math.floor(Math.random() * 1000)
  return `https://picsum.photos/${width}/${height}?random=${randomId}`
}
</script>

<style scoped>
.dark-tech-app-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  overflow: hidden;
  transition: all 0.3s ease;
  position: relative;
}

.dark-tech-app-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.dark-tech-app-card.is-interactive {
  cursor: pointer;
}

.dark-tech-app-card.is-loading {
  pointer-events: none;
  opacity: 0.7;
}

/* 卡片头部 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.app-title {
  font-size: 1rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0;
}

.app-subtitle {
  font-size: 0.875rem;
  color: #a0a0a0;
}

.header-controls {
  display: flex;
  gap: 0.25rem;
}

.control-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transition: background-color 0.3s ease;
}

.control-dot.active {
  background: #00d4ff;
}

/* 卡片内容 */
.card-content {
  padding: 2rem;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 加载状态 */
.loading-content {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-placeholder {
  display: flex;
  align-items: end;
  gap: 0.5rem;
  height: 100px;
}

.loading-bar {
  width: 30px;
  height: 30px;
  background: linear-gradient(180deg, #00d4ff, #ff00ff);
  border-radius: 3px;
  animation: loading-pulse 1.5s ease-in-out infinite;
  animation-delay: var(--delay);
}

@keyframes loading-pulse {
  0%,
  100% {
    opacity: 0.3;
    transform: scaleY(0.5);
  }

  50% {
    opacity: 1;
    transform: scaleY(1);
  }
}

/* 错误状态 */
.error-content {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.error-message {
  text-align: center;
  color: #ff6b6b;
  font-size: 0.875rem;
}

/* 卡片信息 */
.card-info {
  padding: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.cover-content {
  width: 100%;
  height: 200px;
  overflow: hidden;
  position: relative;
}

.app-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.app-cover:hover {
  transform: scale(1.05);
}

.info-left {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0;
}

.info-description {
  font-size: 0.875rem;
  color: #a0a0a0;
  margin: 0;
}

.info-user {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.update-time {
  font-size: 0.75rem;
  color: #8c8c8c;
}

/* 悬停遮罩 */
.hover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.dark-tech-app-card.is-interactive:hover .hover-overlay {
  opacity: 1;
  pointer-events: auto;
}

.overlay-content {
  text-align: center;
}

.overlay-button {
  background: linear-gradient(135deg, #00d4ff, #ff00ff);
  border: none;
  color: #ffffff;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.overlay-button:hover {
  transform: scale(1.05);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .card-content {
    padding: 1.5rem;
    min-height: 150px;
  }

  .card-info {
    padding: 1rem 1.5rem;
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .info-actions {
    width: 100%;
  }
}
</style>
