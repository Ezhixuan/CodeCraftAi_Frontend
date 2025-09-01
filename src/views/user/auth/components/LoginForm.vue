<template>
  <div class="login-form-container">
    <div class="form-header">
      <h2 class="form-title">欢迎回来</h2>
      <p class="form-subtitle">登录您的 CodeCraftAI 账户</p>
    </div>

    <a-form
      :model="loginForm"
      :rules="loginRules"
      @finish="handleLogin"
      @finishFailed="handleLoginFailed"
      layout="vertical"
      class="login-form"
    >
      <a-form-item name="account" label="账号">
        <a-input
          v-model:value="loginForm.account"
          size="large"
          placeholder="请输入账号"
          class="custom-input"
        >
          <template #prefix>
            <UserOutlined class="input-icon" />
          </template>
        </a-input>
      </a-form-item>

      <a-form-item name="password" label="密码">
        <a-input-password
          v-model:value="loginForm.password"
          size="large"
          placeholder="请输入密码"
          class="custom-input"
        >
          <template #prefix>
            <LockOutlined class="input-icon" />
          </template>
        </a-input-password>
      </a-form-item>

      <a-form-item>
        <div class="form-options">
          <a-checkbox v-model:checked="loginForm.remember"> 记住我 </a-checkbox>
          <a class="forgot-link" @click="handleForgotPassword"> 忘记密码？ </a>
        </div>
      </a-form-item>

      <a-form-item>
        <a-button
          type="primary"
          html-type="submit"
          size="large"
          :loading="loading"
          class="login-button"
          block
        >
          登录
        </a-button>
      </a-form-item>
    </a-form>

    <div class="form-footer">
      <span>还没有账户？</span>
      <a class="register-link" @click="$emit('switchToRegister')"> 立即注册 </a>
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
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { UserOutlined, LockOutlined, GithubOutlined, GoogleOutlined } from '@ant-design/icons-vue'
import type { Rule } from 'ant-design-vue/es/form'
import { doLogin } from '@/api/userController.ts'
import { useLoginUserStore } from '@/stores/loginUser'

// 定义组件事件
defineEmits<{
  switchToRegister: []
}>()

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
    const response = await doLogin(loginReq)
    if (response.data.data) {
      // 存储用户信息到store
      loginUserStore.setLoginUser(response.data.data)
      message.success('登录成功！')
      // 处理重定向
      const redirect = new URLSearchParams(window.location.search).get('redirect')
      router.push(redirect || '/')
    }
  } catch (error) {
    console.error('登录失败:', error)
  } finally {
    loading.value = false
  }
}

/**
 * 处理登录失败
 */
const handleLoginFailed = (errorInfo: {
  errorFields: Array<{ name: string[]; errors: string[] }>
}) => {
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
.login-form-container {
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
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
}

.custom-input:hover {
  border-color: #667eea;
}

.custom-input:focus-within {
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
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
  font-size: 0.875rem;
  transition: color 0.3s ease;
}

.forgot-link:hover {
  color: #4f46e5;
  text-decoration: underline;
}

.login-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 8px;
  height: 48px;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.login-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.form-footer {
  text-align: center;
  margin-bottom: 24px;
  color: #6b7280;
}

.register-link {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
  margin-left: 4px;
  cursor: pointer;
  transition: color 0.3s ease;
}

.register-link:hover {
  color: #4f46e5;
  text-decoration: underline;
}

.social-login {
  margin-top: 24px;
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
  border-radius: 8px;
  font-weight: 500;
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
  transform: translateY(-2px);
}
</style>
