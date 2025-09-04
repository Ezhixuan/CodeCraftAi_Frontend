<!--
  AppCard 应用卡片组件
  
  该组件用于展示应用信息的卡片，包含以下特性：
  1. 应用封面图片展示（支持默认图片）
  2. 应用名称显示
  3. 应用作者信息（通过 UserAvatar 组件展示）
  4. 应用更新时间显示（格式化显示）
  5. 交互模式（悬停显示操作按钮）
  
  Props 说明：
  - appInfo: 应用信息对象，类型为 API.AppInfoCommonResVo，包含应用的详细信息
    - cover: 应用封面图片 URL
    - name: 应用名称
    - userInfo: 应用作者信息
    - updateTime: 应用更新时间
  - interactive: 是否启用交互模式，启用后悬停会显示操作按钮，默认为 false
  - actionText: 操作按钮文本，如果不提供则默认显示"立即体验"
  
  Events 说明：
  - action: 当用户点击操作按钮时触发
  
  Slots 说明：
  - overlay: 自定义悬停遮罩内容，可以替换默认的操作按钮
  
  使用示例：
  1. 基础用法：
  <AppCard :app-info="appData" />
  
  2. 交互模式：
  <AppCard 
    :app-info="appData" 
    :interactive="true" 
    action-text="查看详情"
    @action="handleAppAction"
  />
  
  3. 自定义遮罩内容：
  <AppCard 
    :app-info="appData" 
    :interactive="true"
    @action="handleAppAction"
  >
    <template #overlay>
      <div class="custom-overlay">
        <button @click="handleEdit">编辑</button>
        <button @click="handleDelete">删除</button>
      </div>
    </template>
  </AppCard>
  
  对应的数据结构示例：
  const appData = {
    id: "1",
    name: "示例应用",
    cover: "https://example.com/cover.jpg",
    updateTime: "2023-05-20T10:30:00Z",
    userInfo: {
      id: "101",
      name: "张三",
      avatar: "https://example.com/avatar.jpg"
    }
  };
  
  事件处理函数示例：
  const handleAppAction = () => {
    console.log("执行应用操作");
    // 跳转到应用详情页或其他操作
  };
  
  const handleEdit = () => {
    console.log("编辑应用");
  };
  
  const handleDelete = () => {
    console.log("删除应用");
  };
-->

<template>
  <div class="app-card" :class="{ 'is-interactive': interactive }">
    <!-- 卡片内容 -->
    <div class="card-content">
      <div v-if="appInfo" class="cover-content">
        <img
          v-if="appInfo.cover"
          :src="appInfo.cover"
          :alt="appInfo.name"
          class="app-cover"
          @error="handleCoverError"
        />
        <img v-else :src="defaultCoverUrl" :alt="appInfo.name" class="app-cover" />
      </div>
    </div>

    <!-- 卡片信息 -->
    <div class="card-info">
      <div class="info-left">
        <h4 class="info-title">{{ appInfo?.name || '未命名应用' }}</h4>
        <div v-if="appInfo?.userInfo" class="info-user">
          <UserAvatar :user-info="appInfo.userInfo" show-name size="small" name-color="#ffffff" />
          <span v-if="appInfo.updateTime" class="update-time">
            更新于 {{ formatUpdateTime(appInfo.updateTime) }}
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
import UserAvatar from '../../User/UserAvatar.vue'

defineProps<{
  appInfo: API.AppInfoCommonResVo
  interactive: boolean
  actionText: string
}>()

const emit = defineEmits<{
  action: []
}>()

const defaultCoverUrl = 'https://picsum.photos/300/200?random=1'

const handleAction = () => {
  emit('action')
}

// 处理封面图片加载错误
const handleCoverError = (event: Event) => {
  const img = event.target as HTMLImageElement
  // 生成一个随机的默认图片
  const randomId = Math.floor(Math.random() * 1000)
  img.src = `https://picsum.photos/300/200?random=${randomId}`
}

// 格式化更新时间
const formatUpdateTime = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return '今天'
  } else if (diffDays === 1) {
    return '昨天'
  } else if (diffDays < 7) {
    return `${diffDays}天前`
  } else {
    return date.toLocaleDateString('zh-CN')
  }
}
</script>

<style scoped>
.app-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  overflow: hidden;
  transition: all 0.3s ease;
  position: relative;
}

.app-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.app-card.is-interactive {
  cursor: pointer;
}

/* 卡片内容 */
.card-content {
  padding: 0;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
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

/* 卡片信息 */
.card-info {
  padding: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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

.app-card.is-interactive:hover .hover-overlay {
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
    min-height: 150px;
  }

  .card-info {
    padding: 1rem 1.5rem;
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}
</style>
