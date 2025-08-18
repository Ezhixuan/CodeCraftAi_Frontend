<template>
  <CommonBackground>
    <!-- 主要内容 -->
    <div class="main-content">
      <div class="input-section">
        <h1 class="main-title">
          一句话
          <img src="../assets/codeAi 无背景.png" alt="codeAi" width="52px" height="52px" /> 呈所想
        </h1>
        <p class="subtitle">与 AI 对话轻松创建应用和网站</p>
        <div class="input-container">
          <InputComponent
            v-model="userInput"
            width="700px"
            height="150px"
            fontSize="16px"
            :required="true"
            :show-submit-button="true"
            submit-button-text="生成应用"
            :enable-typewriter="true"
            :placeholder-array="[
              '使用 CodeCraft 创建一个数据分析看板，用来分析......',
              '使用 CodeCraft 创建一个简单的博客网站',
            ]"
            @submit="handleSubmit"
          />
        </div>
      </div>
    </div>

    <!-- 用户已创建应用展示区域 -->
    <div v-if="isLoggedIn" class="apps-section user-apps-section">
      <div class="section-header">
        <h2 class="section-title">我的应用</h2>
        <p class="section-subtitle">您已创建的应用</p>
      </div>
      <div v-if="userAppsLoading" class="loading-container">
        <div class="loading-text">加载中...</div>
      </div>
      <div v-else-if="userApps.length === 0" class="empty-container">
        <div class="empty-text">您还没有创建任何应用</div>
      </div>
      <div v-else class="apps-grid">
        <AppCardComponent
          v-for="app in userApps"
          :key="app.id"
          :app-info="app"
          :interactive="true"
          action-text="查看详情"
          @action="handleAppCardClick(app)"
        />
      </div>
    </div>

    <!-- 精选应用展示区域 -->
    <div class="apps-section featured-apps-section">
      <div class="section-header">
        <h2 class="section-title">精选应用</h2>
        <p class="section-subtitle">发现优质应用模板</p>
      </div>
      <div v-if="featuredAppsLoading" class="loading-container">
        <div class="loading-text">加载中...</div>
      </div>
      <div v-else-if="featuredApps.length === 0" class="empty-container">
        <div class="empty-text">暂无精选应用</div>
      </div>
      <div v-else class="apps-grid">
        <DarkTechAppCard
          v-for="app in featuredApps"
          :key="app.id"
          :app-info="app"
          :interactive="true"
          action-text="立即使用"
          @action="handleAppCardClick(app)"
        />
      </div>
    </div>
  </CommonBackground>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { message } from 'ant-design-vue'

import CommonBackground from '@/components/CommonBackgroundComponent.vue'
import { getList, getFeaturedList, doGenerate } from '@/api/yingyongkongzhiqi'
import { useLoginUserStore } from '@/stores/loginUser'
import InputComponent from '@/components/InputComponent.vue'
import AppCardComponent from '@/components/AppCardComponent.vue'
import router from '@/router'

// 用户输入内容
const userInput = ref('')

// 登录用户状态
const loginUserStore = useLoginUserStore()

// 应用列表数据
const userApps = ref<API.AppInfoCommonResVo[]>([])
const featuredApps = ref<API.AppInfoCommonResVo[]>([])
const userAppsLoading = ref(false)
const featuredAppsLoading = ref(false)

// 计算用户是否已登录
const isLoggedIn = computed(() => {
  return loginUserStore.isLogin()
})

/**
 * 加载用户已创建的应用列表
 */
const loadUserApps = async () => {
  if (!isLoggedIn.value) return

  userAppsLoading.value = true
  try {
    const response = await getList({
      queryReqVo: {
        pageNo: 1,
        pageSize: 8,
        orderBy: 'updateTime desc',
      },
    })
    if (response.data.data?.list) {
      userApps.value = response.data?.data?.list || []
    }
  } catch (error) {
    console.error('加载用户应用失败:', error)
    message.error('加载用户应用失败')
  } finally {
    userAppsLoading.value = false
  }
}

/**
 * 加载精选应用列表
 */
const loadFeaturedApps = async () => {
  featuredAppsLoading.value = true
  try {
    const response = await getFeaturedList()
    if (response.data.data?.list) {
      featuredApps.value = response.data.data?.list || []
    }
  } catch (error) {
    console.error('加载精选应用失败:', error)
    message.error('加载精选应用失败')
  } finally {
    featuredAppsLoading.value = false
  }
}

/**
 * 处理生成应用按钮点击事件
 */
const handleSubmit = async () => {
  if (!isLoggedIn.value) {
    message.error('请先登录')
    return
  }

  const userInputMessage = userInput.value.trim()
  if (!userInputMessage) {
    return
  }
  // 初始化应用
  // 需要添加一个loading动画等待
  const response = await doGenerate({
    initPrompt: userInput.value,
  })

  if (response.data.data) {
    // 跳转对应的应用详情页
    await router.push({
      path: '/app/code-message',
      query: {
        appId: response.data.data,
        userMessage: userInputMessage,
        action: 'create',
      },
    })
  }
}

/**
 * 处理应用卡片点击事件
 */
const handleAppCardClick = (app: API.AppInfoCommonResVo) => {
  console.log('app', app)
  router.push({
    path: '/app/code-message',
    query: {
      appId: app.id,
      action: 'view',
      userId: loginUserStore.loginUser.id,
    },
  })
}

// 组件挂载时加载数据
onMounted(() => {
  loadFeaturedApps()
  if (isLoggedIn.value) {
    loadUserApps()
  }
})
</script>

<style scoped>
/* 主要内容样式 */
.main-content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 70vh;
  padding: 2rem;
}

.input-section {
  max-width: 800px;
  width: 100%;
  text-align: center;
}

.main-title {
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #00d4ff, #ff77c6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.2;
}

.subtitle {
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 3rem;
  font-weight: 300;
}

.input-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  align-items: center;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.submit-btn,
.optimize-btn {
  padding: 12px 32px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.submit-btn {
  background: linear-gradient(135deg, #00d4ff, #0099cc);
  color: #ffffff;
}

.submit-btn:hover {
  background: linear-gradient(135deg, #00b8e6, #007aa3);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 212, 255, 0.3);
}

.optimize-btn {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.optimize-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 255, 255, 0.1);
}

/* 应用展示区域样式 */
.apps-section {
  margin: 60px auto 40px;
  padding: 0 20px;
  max-width: 1200px;
  width: 100%;
}

.section-header {
  text-align: center;
  margin-bottom: 2rem;
}

.section-title {
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #00d4ff, #ff77c6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.section-subtitle {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
}

.apps-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  width: 100%;
}

.loading-container,
.empty-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  width: 100%;
}

.loading-text,
.empty-text {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.6);
  text-align: center;
}

.loading-text {
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}

.user-apps-section {
  margin-bottom: 2rem;
}

.featured-apps-section {
  margin-bottom: 4rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-title {
    font-size: 2.5rem;
  }

  .subtitle {
    font-size: 1.1rem;
    margin-bottom: 2rem;
  }

  .main-content {
    padding: 1rem;
  }

  .action-buttons {
    flex-direction: column;
    width: 100%;
  }

  .submit-btn,
  .optimize-btn {
    width: 100%;
    max-width: 300px;
  }

  .apps-section {
    margin-top: 3rem;
  }

  .section-title {
    font-size: 1.5rem;
  }

  .apps-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
</style>
