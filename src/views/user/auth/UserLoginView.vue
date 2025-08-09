<template>
  <div class="login-container">
    <!-- 背景动画效果 -->
    <div class="background-animation">
      <div class="floating-shapes">
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
        <div class="shape shape-4"></div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="login-content">
      <!-- 左侧品牌区域 -->
      <div class="brand-section">
        <div class="brand-content">
          <h1 class="brand-title">
            <span class="gradient-text">CodeCraft</span>
            <span class="ai-text">AI</span>
          </h1>
          <p class="brand-subtitle">智能代码生成平台</p>
          <div class="feature-list">
            <div class="feature-item">
              <div class="feature-icon">🚀</div>
              <span>AI 驱动的零代码开发</span>
            </div>
            <div class="feature-item">
              <div class="feature-icon">⚡</div>
              <span>可视化拖拽编辑器</span>
            </div>
            <div class="feature-item">
              <div class="feature-icon">🎯</div>
              <span>实时预览与部署</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧登录表单 -->
      <div class="form-section">
        <div class="form-container">
          <div class="form-header">
            <h2 class="form-title">欢迎回来</h2>
            <p class="form-subtitle">登录您的 CodeCraftAI 账户</p>
          </div>

          <a-form :model="loginForm" :rules="loginRules" @finish="handleLogin" @finishFailed="handleLoginFailed"
            layout="vertical" class="login-form">
            <a-form-item name="account" label="账号">
              <a-input v-model:value="loginForm.account" size="large" placeholder="请输入账号" class="custom-input">
                <template #prefix>
                  <UserOutlined class="input-icon" />
                </template>
              </a-input>
            </a-form-item>

            <a-form-item name="password" label="密码">
              <a-input-password v-model:value="loginForm.password" size="large" placeholder="请输入密码"
                class="custom-input">
                <template #prefix>
                  <LockOutlined class="input-icon" />
                </template>
              </a-input-password>
            </a-form-item>

            <a-form-item>
              <div class="form-options">
                <a-checkbox v-model:checked="loginForm.remember">
                  记住我
                </a-checkbox>
                <a class="forgot-link" @click="handleForgotPassword">
                  忘记密码？
                </a>
              </div>
            </a-form-item>

            <a-form-item>
              <a-button type="primary" html-type="submit" size="large" :loading="loading" class="login-button" block>
                登录
              </a-button>
            </a-form-item>
          </a-form>

          <div class="form-footer">
            <span>还没有账户？</span>
            <router-link to="/register" class="register-link">
              立即注册
            </router-link>
          </div>

          <!-- 第三方登录 -->
          <div class="social-login">
            <a-divider>
              <span class="divider-text">或使用以下方式登录</span>
            </a-divider>
            <div class="social-buttons">
              <a-button class="social-btn github-btn" @click="handleGithubLogin">
                <GithubOutlined />
                GitHub
              </a-button>
              <a-button class="social-btn google-btn" @click="handleGoogleLogin">
                <GoogleOutlined />
                Google
              </a-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  UserOutlined,
  LockOutlined,
  GithubOutlined,
  GoogleOutlined,
} from '@ant-design/icons-vue'
import type { Rule } from 'ant-design-vue/es/form'
import { doLogin } from '@/api/yonghukongzhiqi'
import { useLoginUserStore } from '@/stores/loginUser'

// 路由实例
const router = useRouter()
const loginUserStore = useLoginUserStore()

// 表单数据
const loginForm = reactive({
  account: '',
  password: '',
  remember: false,
})

// 加载状态
const loading = ref(false)

// 表单验证规则
const loginRules: Record<string, Rule[]> = {
  account: [
    { required: true, message: '请输入账号', trigger: 'blur' },
    { min: 4, max: 20, message: '账号长度为 4-20 个字符', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于 6 个字符', trigger: 'blur' },
  ],
}

/**
 * 处理登录提交
 */
const handleLogin = async (values: typeof loginForm) => {
  try {
    loading.value = true
    const loginReq: API.UserLoginReqVo = {
      account: values.account,
      password: values.password,
    }
    const userInfo = await doLogin(loginReq) as API.UserInfoCommonResVo

    // 存储用户信息到store
    loginUserStore.setLoginUser(userInfo)

    message.success('登录成功！')

    // 处理重定向
    const redirect = new URLSearchParams(window.location.search).get('redirect')
    router.push(redirect || '/')
  } catch (error) {
    console.error('登录失败:', error)
  } finally {
    loading.value = false
  }
}

/**
 * 处理登录失败
 */
const handleLoginFailed = (errorInfo: { errorFields: Array<{ name: string[]; errors: string[] }> }) => {
  console.log('表单验证失败:', errorInfo)
}

/**
 * 处理忘记密码
 */
const handleForgotPassword = () => {
  message.info('忘记密码功能开发中...')
}

/**
 * 处理 GitHub 登录
 */
const handleGithubLogin = () => {
  message.info('GitHub 登录功能开发中...')
}

/**
 * 处理 Google 登录
 */
const handleGoogleLogin = () => {
  message.info('Google 登录功能开发中...')
}
</script>

<style scoped>
.login-container {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  overflow: hidden;
  padding: 0;
  margin: 0;
  width: 100%;
}

/* 背景动画效果 */
.background-animation {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.floating-shapes {
  position: relative;
  width: 100%;
  height: 100%;
}

.shape {
  position: absolute;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  animation: float 6s ease-in-out infinite;
}

.shape-1 {
  width: 80px;
  height: 80px;
  top: 20%;
  left: 10%;
  animation-delay: 0s;
}

.shape-2 {
  width: 120px;
  height: 120px;
  top: 60%;
  right: 10%;
  animation-delay: 2s;
}

.shape-3 {
  width: 60px;
  height: 60px;
  bottom: 20%;
  left: 20%;
  animation-delay: 4s;
}

.shape-4 {
  width: 100px;
  height: 100px;
  top: 10%;
  right: 30%;
  animation-delay: 1s;
}

@keyframes float {

  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
  }

  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

/* 主要内容区域 */
.login-content {
  display: flex;
  width: 100%;
  max-width: 1200px;
  margin: 20px auto;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  overflow: hidden;
  min-height: 500px;
}

/* 左侧品牌区域 */
.brand-section {
  flex: 1;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.brand-content {
  text-align: center;
  max-width: 400px;
}

.brand-title {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 16px;
  line-height: 1.2;
}

.gradient-text {
  background: linear-gradient(45deg, #fff, #e0e7ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.ai-text {
  color: #fbbf24;
  text-shadow: 0 0 20px rgba(251, 191, 36, 0.5);
}

.brand-subtitle {
  font-size: 1.2rem;
  margin-bottom: 40px;
  opacity: 0.9;
}

.feature-list {
  text-align: left;
}

.feature-item {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  font-size: 1rem;
}

.feature-icon {
  font-size: 1.5rem;
  margin-right: 12px;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 右侧表单区域 */
.form-section {
  flex: 1;
  padding: 40px 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.form-container {
  width: 100%;
  max-width: 400px;
}

.form-header {
  text-align: center;
  margin-bottom: 40px;
}

.form-title {
  font-size: 2rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 8px;
}

.form-subtitle {
  color: #6b7280;
  font-size: 1rem;
}

.login-form {
  margin-bottom: 24px;
}

.custom-input {
  border-radius: 12px;
  border: 2px solid #e5e7eb;
  transition: all 0.3s ease;
}

.custom-input:hover,
.custom-input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.input-icon {
  color: #9ca3af;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.forgot-link {
  color: #667eea;
  text-decoration: none;
  transition: color 0.3s ease;
}

.forgot-link:hover {
  color: #5a67d8;
}

.login-button {
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.login-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.form-footer {
  text-align: center;
  color: #6b7280;
}

.register-link {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
  margin-left: 8px;
  transition: color 0.3s ease;
}

.register-link:hover {
  color: #5a67d8;
}

/* 第三方登录 */
.social-login {
  margin-top: 32px;
}

.divider-text {
  color: #9ca3af;
  font-size: 0.875rem;
}

.social-buttons {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.social-btn {
  flex: 1;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.github-btn {
  background: #24292e;
  border-color: #24292e;
  color: white;
}

.github-btn:hover {
  background: #1a1e22;
  border-color: #1a1e22;
  color: white;
  transform: translateY(-2px);
}

.google-btn {
  background: #4285f4;
  border-color: #4285f4;
  color: white;
}

.google-btn:hover {
  background: #3367d6;
  border-color: #3367d6;
  color: white;
  transform: translateY(-2px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .login-container {
    padding: 0;
    align-items: flex-start;
    min-height: 100vh;
  }

  .login-content {
    flex-direction: column;
    margin: 10px;
    min-height: auto;
  }

  .brand-section {
    padding: 30px 20px;
    min-height: auto;
  }

  .form-section {
    padding: 30px 20px;
  }

  .brand-title {
    font-size: 2rem;
  }

  .brand-subtitle {
    margin-bottom: 20px;
  }

  .feature-item {
    margin-bottom: 15px;
  }

  .form-header {
    margin-bottom: 30px;
  }

  .social-buttons {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .login-container {
    padding: 0;
  }

  .login-content {
    border-radius: 12px;
    margin: 5px;
  }

  .brand-section {
    padding: 20px 15px;
  }

  .form-section {
    padding: 20px 15px;
  }

  .brand-title {
    font-size: 1.8rem;
  }

  .form-title {
    font-size: 1.5rem;
  }

  .feature-list {
    display: none;
  }
}

@media (max-height: 700px) {
  .login-container {
    align-items: flex-start;
    padding: 10px;
  }

  .brand-section {
    padding: 20px 30px;
  }

  .form-section {
    padding: 20px 30px;
  }

  .brand-subtitle {
    margin-bottom: 15px;
  }

  .form-header {
    margin-bottom: 20px;
  }

  .feature-item {
    margin-bottom: 10px;
  }
}
</style>
