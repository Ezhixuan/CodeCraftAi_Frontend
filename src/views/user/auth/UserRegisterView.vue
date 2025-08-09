<template>
  <div class="register-container">
    <!-- 背景动画效果 -->
    <div class="background-animation">
      <div class="floating-shapes">
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
        <div class="shape shape-4"></div>
        <div class="shape shape-5"></div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="register-content">
      <!-- 左侧表单区域 -->
      <div class="form-section">
        <div class="form-container">
          <div class="form-header">
            <h2 class="form-title">加入 CodeCraftAI</h2>
            <p class="form-subtitle">开启您的 AI 代码生成之旅</p>
          </div>

          <a-form :model="registerForm" :rules="registerRules" @finish="handleRegister"
            @finishFailed="handleRegisterFailed" layout="vertical" class="register-form">
            <a-form-item name="account" label="账号">
              <a-input v-model:value="registerForm.account" size="large" placeholder="请输入账号" class="custom-input">
                <template #prefix>
                  <UserOutlined class="input-icon" />
                </template>
              </a-input>
            </a-form-item>

            <a-form-item name="password" label="密码">
              <a-input-password v-model:value="registerForm.password" size="large" placeholder="请输入密码"
                class="custom-input">
                <template #prefix>
                  <LockOutlined class="input-icon" />
                </template>
              </a-input-password>
            </a-form-item>

            <a-form-item name="confirmPassword" label="确认密码">
              <a-input-password v-model:value="registerForm.confirmPassword" size="large" placeholder="请再次输入密码"
                class="custom-input">
                <template #prefix>
                  <SafetyOutlined class="input-icon" />
                </template>
              </a-input-password>
            </a-form-item>

            <a-form-item name="agreement">
              <a-checkbox v-model:checked="registerForm.agreement">
                我已阅读并同意
                <a class="agreement-link" @click="showTerms">
                  《用户协议》
                </a>
                和
                <a class="agreement-link" @click="showPrivacy">
                  《隐私政策》
                </a>
              </a-checkbox>
            </a-form-item>

            <a-form-item>
              <a-button type="primary" html-type="submit" size="large" :loading="loading" class="register-button" block>
                创建账户
              </a-button>
            </a-form-item>
          </a-form>

          <div class="form-footer">
            <span>已有账户？</span>
            <router-link to="/login" class="login-link">
              立即登录
            </router-link>
          </div>

          <!-- 第三方注册 -->
          <div class="social-register">
            <a-divider>
              <span class="divider-text">或使用以下方式注册</span>
            </a-divider>
            <div class="social-buttons">
              <a-button class="social-btn github-btn" @click="handleGithubRegister">
                <GithubOutlined />
                GitHub
              </a-button>
              <a-button class="social-btn google-btn" @click="handleGoogleRegister">
                <GoogleOutlined />
                Google
              </a-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧品牌区域 -->
      <div class="brand-section">
        <div class="brand-content">
          <h1 class="brand-title">
            <span class="gradient-text">CodeCraft</span>
            <span class="ai-text">AI</span>
          </h1>
          <p class="brand-subtitle">下一代智能开发平台</p>

          <!-- <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-number">10K+</div>
              <div class="stat-label">开发者</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">50K+</div>
              <div class="stat-label">生成项目</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">99%</div>
              <div class="stat-label">满意度</div>
            </div>
          </div> -->

          <!-- <div class="testimonial">
            <div class="testimonial-content">
              "CodeCraftAI 彻底改变了我的开发方式，让我能够专注于创意而不是重复的代码编写。"
            </div>
            <div class="testimonial-author">
              - 张开发者，全栈工程师
            </div>
          </div> -->
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
  SafetyOutlined,
  GithubOutlined,
  GoogleOutlined,
} from '@ant-design/icons-vue'
import type { Rule } from 'ant-design-vue/es/form'
import { doRegister } from '@/api/yonghukongzhiqi'

// 路由实例
const router = useRouter()

// 表单数据 - 使用API定义的字段名
const registerForm = reactive({
  account: '',
  password: '',
  confirmPassword: '',
  agreement: false,
})

// 加载状态
const loading = ref(false)

// 自定义验证函数
const validatePassword = (_rule: Rule, value: string) => {
  if (!value) {
    return Promise.reject(new Error('请输入密码'))
  }
  if (value.length < 6) {
    return Promise.reject(new Error('密码长度至少为 6 个字符'))
  }
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
    return Promise.reject(new Error('密码必须包含大小写字母和数字'))
  }
  return Promise.resolve()
}

const validateConfirmPassword = (_rule: Rule, value: string) => {
  if (!value) {
    return Promise.reject(new Error('请确认密码'))
  }
  if (value !== registerForm.password) {
    return Promise.reject(new Error('两次输入的密码不一致'))
  }
  return Promise.resolve()
}

const validateAgreement = (_rule: Rule, value: boolean) => {
  if (!value) {
    return Promise.reject(new Error('请同意用户协议和隐私政策'))
  }
  return Promise.resolve()
}

// 表单验证规则
const registerRules: Record<string, Rule[]> = {
  account: [
    { required: true, message: '请输入账号', trigger: 'blur' },
    { min: 3, max: 20, message: '账号长度为 3-20 个字符', trigger: 'blur' },
    {
      pattern: /^[a-zA-Z0-9_]+$/,
      message: '账号只能包含字母、数字和下划线',
      trigger: 'blur',
    },
  ],
  password: [
    { validator: validatePassword, trigger: 'blur' },
  ],
  confirmPassword: [
    { validator: validateConfirmPassword, trigger: 'blur' },
  ],
  agreement: [
    { validator: validateAgreement, trigger: 'change' },
  ],
}

/**
 * 处理注册提交
 */
const handleRegister = async (values: typeof registerForm) => {
  try {
    loading.value = true

    // 调用真实的注册API
    const registerReq: API.UserRegisterReqVo = {
      account: values.account,
      password: values.password,
      confirmPassword: values.confirmPassword
    }

    await doRegister(registerReq)

    message.success('注册成功！请登录')

    // 跳转到登录页面
    router.push('/login')
  } catch (error) {
    // 错误已在request拦截器中处理，这里不需要额外处理
    console.error('注册失败:', error)
  } finally {
    loading.value = false
  }
}

/**
 * 处理注册失败
 */
const handleRegisterFailed = (errorInfo: { errorFields: Array<{ name: string[]; errors: string[] }> }) => {
  console.log('表单验证失败:', errorInfo)
}

/**
 * 显示用户协议
 */
const showTerms = () => {
  message.info('用户协议页面开发中...')
}

/**
 * 显示隐私政策
 */
const showPrivacy = () => {
  message.info('隐私政策页面开发中...')
}

/**
 * 处理 GitHub 注册
 */
const handleGithubRegister = () => {
  message.info('GitHub 注册功能开发中...')
}

/**
 * 处理 Google 注册
 */
const handleGoogleRegister = () => {
  message.info('Google 注册功能开发中...')
}
</script>

<style scoped>
.register-container {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
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
  background: rgba(255, 255, 255, 0.08);
  border-radius: 50%;
  animation: float 8s ease-in-out infinite;
}

.shape-1 {
  width: 100px;
  height: 100px;
  top: 15%;
  left: 15%;
  animation-delay: 0s;
}

.shape-2 {
  width: 80px;
  height: 80px;
  top: 70%;
  right: 20%;
  animation-delay: 2s;
}

.shape-3 {
  width: 120px;
  height: 120px;
  bottom: 15%;
  left: 25%;
  animation-delay: 4s;
}

.shape-4 {
  width: 90px;
  height: 90px;
  top: 25%;
  right: 15%;
  animation-delay: 1s;
}

.shape-5 {
  width: 70px;
  height: 70px;
  top: 50%;
  left: 5%;
  animation-delay: 3s;
}

@keyframes float {

  0%,
  100% {
    transform: translateY(0px) rotate(0deg) scale(1);
  }

  33% {
    transform: translateY(-15px) rotate(120deg) scale(1.1);
  }

  66% {
    transform: translateY(10px) rotate(240deg) scale(0.9);
  }
}

/* 主要内容区域 */
.register-content {
  display: flex;
  width: 100%;
  max-width: 1200px;
  margin: 20px auto;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
  overflow: hidden;
  min-height: 550px;
}

/* 左侧表单区域 */
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

.register-form {
  margin-bottom: 24px;
}

.custom-input {
  border-radius: 12px;
  border: 2px solid #e5e7eb;
  transition: all 0.3s ease;
}

.custom-input:hover,
.custom-input:focus {
  border-color: #764ba2;
  box-shadow: 0 0 0 3px rgba(118, 75, 162, 0.1);
}

.input-icon {
  color: #9ca3af;
}

.agreement-link {
  color: #764ba2;
  text-decoration: none;
  transition: color 0.3s ease;
}

.agreement-link:hover {
  color: #5a4b8a;
}

.register-button {
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
  border: none;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.register-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(118, 75, 162, 0.3);
}

.form-footer {
  text-align: center;
  color: #6b7280;
}

.login-link {
  color: #764ba2;
  text-decoration: none;
  font-weight: 600;
  margin-left: 8px;
  transition: color 0.3s ease;
}

.login-link:hover {
  color: #5a4b8a;
}

/* 第三方注册 */
.social-register {
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

/* 右侧品牌区域 */
.brand-section {
  flex: 1;
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
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

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 40px;
}

.stat-item {
  text-align: center;
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.stat-number {
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 4px;
  color: #fbbf24;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.8;
}

.testimonial {
  background: rgba(255, 255, 255, 0.1);
  padding: 24px;
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.testimonial-content {
  font-style: italic;
  margin-bottom: 12px;
  line-height: 1.6;
}

.testimonial-author {
  font-size: 0.9rem;
  opacity: 0.8;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .register-container {
    padding: 0;
  }

  .register-content {
    flex-direction: column-reverse;
    min-height: auto;
    margin: 10px;
  }

  .form-section {
    padding: 30px 20px;
  }

  .brand-section {
    padding: 30px 20px;
  }

  .brand-title {
    font-size: 2rem;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .social-buttons {
    flex-direction: column;
  }

  .form-header {
    margin-bottom: 30px;
  }

  .form-title {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .register-container {
    padding: 0;
  }

  .register-content {
    margin: 5px;
  }

  .form-section {
    padding: 20px 15px;
  }

  .brand-section {
    padding: 20px 15px;
  }

  .form-container {
    max-width: 100%;
  }

  .form-title {
    font-size: 1.3rem;
  }

  .brand-title {
    font-size: 1.5rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .register-button {
    height: 44px;
  }
}

@media (max-height: 700px) {
  .register-container {
    align-items: flex-start;
    padding: 10px;
  }

  .form-section {
    padding: 20px 30px;
  }

  .brand-section {
    padding: 20px 30px;
  }

  .form-header {
    margin-bottom: 20px;
  }

  .stats-grid {
    margin-bottom: 20px;
  }

  .testimonial {
    display: none;
  }
}

@media (max-height: 600px) {
  .brand-section {
    padding: 15px 30px;
  }

  .form-section {
    padding: 15px 30px;
  }

  .brand-subtitle {
    margin-bottom: 15px;
  }

  .stats-grid {
    display: none;
  }
}
</style>
