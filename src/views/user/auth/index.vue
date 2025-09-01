<template>
  <!-- 背景组件 -->
  <CommonBackground>
    <div class="auth-container">
      <!-- 主要内容区域 -->
      <div class="auth-content">
        <!-- 滑动容器 -->
        <div class="slide-container">
          <!-- 内容包装器 -->
          <div class="content-wrapper" :class="{ 'show-register': isRegisterMode }">
            <!-- 登录页面 -->
            <div class="auth-panel login-panel">
              <!-- 左侧品牌区域 -->
              <BrandSection :show-stats="false" :show-testimonial="false" />

              <!-- 右侧登录表单 -->
              <div class="form-section">
                <LoginForm @switch-to-register="switchToRegister" />
              </div>
            </div>

            <!-- 注册页面 -->
            <div class="auth-panel register-panel">
              <!-- 左侧注册表单 -->
              <div class="form-section">
                <RegisterForm @switch-to-login="switchToLogin" />
              </div>

              <!-- 右侧品牌区域 -->
              <BrandSection :show-stats="true" :show-testimonial="true" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </CommonBackground>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CommonBackground from '@/components/Background/Common/index.vue'
import BrandSection from '@/views/user/auth/components/BrandSection.vue'
import LoginForm from '@/views/user/auth/components/LoginForm.vue'
import RegisterForm from '@/views/user/auth/components/RegisterForm.vue'

// 路由实例
const route = useRoute()
const router = useRouter()

// 当前模式状态
const isRegisterMode = ref(false)

/**
 * 切换到登录模式
 */
const switchToLogin = () => {
  isRegisterMode.value = false
  // 更新 URL 但不刷新页面，保留查询参数
  router.replace({
    path: '/auth/login',
    query: route.query,
  })
}

/**
 * 切换到注册模式
 */
const switchToRegister = () => {
  isRegisterMode.value = true
  // 更新 URL 但不刷新页面，保留查询参数
  router.replace({
    path: '/auth/register',
    query: route.query,
  })
}

/**
 * 根据路由初始化模式
 */
const initializeMode = () => {
  const path = route.path
  if (path.includes('register')) {
    isRegisterMode.value = true
  } else {
    isRegisterMode.value = false
  }
}

// 组件挂载时初始化
onMounted(() => {
  initializeMode()
})
</script>

<style scoped>
.auth-container {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: 0;
  margin: 0;
  width: 100%;
  z-index: 1;
}

.auth-content {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 1200px;
  margin: 20px auto;
}

/* 滑动容器 */
.slide-container {
  position: relative;
  width: 100%;
  overflow: hidden;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.content-wrapper {
  display: flex;
  width: 200%;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.content-wrapper.show-register {
  transform: translateX(-50%);
}

.auth-panel {
  width: 50%;
  min-height: 500px;
  display: flex;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
}

/* 表单区域 */
.form-section {
  flex: 1;
  padding: 40px 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .auth-container {
    padding: 10px;
  }

  .slide-container {
    border-radius: 15px;
  }

  .auth-panel {
    flex-direction: column;
    min-height: 400px;
  }

  .form-section {
    width: 100%;
    padding: 20px;
  }
}

@media (max-width: 480px) {
  .auth-content {
    margin: 5px;
  }

  .flip-container {
    height: 500px;
  }

  .form-section {
    padding: 20px 15px;
  }
}

@media (max-height: 700px) {
  .flip-container {
    height: 500px;
  }

  .form-section {
    padding: 20px 30px;
  }
}

@media (max-height: 600px) {
  .flip-container {
    height: 450px;
  }

  .form-section {
    padding: 15px 30px;
  }

  .switch-controls {
    margin-top: 12px;
  }
}

/* 动画增强 */
@keyframes slideInFromLeft {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInFromRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.front .form-section {
  animation: slideInFromRight 0.6s ease-out 0.3s both;
}

.back .form-section {
  animation: slideInFromLeft 0.6s ease-out 0.3s both;
}
</style>
