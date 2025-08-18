<template>
  <div class="register-form-container">
    <div class="form-header">
      <h2 class="form-title">加入 CodeCraftAI</h2>
      <p class="form-subtitle">开启您的 AI 代码生成之旅</p>
    </div>

    <a-form
      :model="registerForm"
      :rules="registerRules"
      @finish="handleRegister"
      @finishFailed="handleRegisterFailed"
      layout="vertical"
      class="register-form"
    >
      <a-form-item name="account" label="账号">
        <a-input
          v-model:value="registerForm.account"
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
          v-model:value="registerForm.password"
          size="large"
          placeholder="请输入密码"
          class="custom-input"
        >
          <template #prefix>
            <LockOutlined class="input-icon" />
          </template>
        </a-input-password>
      </a-form-item>

      <a-form-item name="confirmPassword" label="确认密码">
        <a-input-password
          v-model:value="registerForm.confirmPassword"
          size="large"
          placeholder="请再次输入密码"
          class="custom-input"
        >
          <template #prefix>
            <SafetyOutlined class="input-icon" />
          </template>
        </a-input-password>
      </a-form-item>

      <a-form-item name="agreement">
        <a-checkbox v-model:checked="registerForm.agreement">
          我已阅读并同意
          <a class="agreement-link" @click="showTerms"> 《用户协议》 </a>
          和
          <a class="agreement-link" @click="showPrivacy"> 《隐私政策》 </a>
        </a-checkbox>
      </a-form-item>

      <a-form-item>
        <a-button
          type="primary"
          html-type="submit"
          size="large"
          :loading="loading"
          class="register-button"
          block
        >
          创建账户
        </a-button>
      </a-form-item>
    </a-form>

    <div class="form-footer">
      <span>已有账户？</span>
      <a class="login-link" @click="$emit('switchToLogin')"> 立即登录 </a>
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
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
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

// 定义组件事件
const emit = defineEmits<{
  switchToLogin: []
}>()

// 表单数据
const registerForm = reactive({
  account: '',
  password: '',
  confirmPassword: '',
  agreement: false,
})

// 加载状态
const loading = ref(false)

// 表单验证规则
const registerRules: Record<string, Rule[]> = {
  account: [
    { required: true, message: '请输入账号', trigger: 'blur' },
    { min: 4, max: 20, message: '账号长度为 4-20 个字符', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '账号只能包含字母、数字和下划线', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于 6 个字符', trigger: 'blur' },
    {
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/,
      message: '密码必须包含大小写字母和数字',
      trigger: 'blur',
    },
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (_rule: Rule, value: string) => {
        if (value && value !== registerForm.password) {
          return Promise.reject('两次输入的密码不一致')
        }
        return Promise.resolve()
      },
      trigger: 'blur',
    },
  ],
  agreement: [
    {
      validator: (_rule: Rule, value: boolean) => {
        if (!value) {
          return Promise.reject('请阅读并同意用户协议和隐私政策')
        }
        return Promise.resolve()
      },
      trigger: 'change',
    },
  ],
}

/**
 * 处理注册提交
 */
const handleRegister = async () => {
  try {
    loading.value = true

    const userRegisterReqVo: API.UserRegisterReqVo = {
      account: registerForm.account,
      password: registerForm.password,
      confirmPassword: registerForm.confirmPassword,
    }
    const response = await doRegister(userRegisterReqVo)
    if (response.data.data) {
      // 清空表单信息
      cleanForm()
      message.success('注册成功！请登录您的账户')
      // 切换到登录表单
      emit('switchToLogin')
    }
  } catch (error) {
    console.error('注册失败:', error)
    message.error('注册失败，请重试')
  } finally {
    loading.value = false
  }
}

/**
 * 处理注册失败
 */
const handleRegisterFailed = (errorInfo: {
  errorFields: Array<{ name: string[]; errors: string[] }>
}) => {
  console.log('表单验证失败:', errorInfo)
}

/**
 * 显示用户协议
 */
const showTerms = () => {
  message.info('用户协议功能开发中...')
}

/**
 * 显示隐私政策
 */
const showPrivacy = () => {
  message.info('隐私政策功能开发中...')
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
function cleanForm() {
  registerForm.account = ''
  registerForm.password = ''
  registerForm.confirmPassword = ''
  registerForm.agreement = false
}
</script>

<style scoped>
.register-form-container {
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

.agreement-link {
  color: #667eea;
  text-decoration: none;
  transition: color 0.3s ease;
}

.agreement-link:hover {
  color: #4f46e5;
  text-decoration: underline;
}

.register-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 8px;
  height: 48px;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.register-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.form-footer {
  text-align: center;
  margin-bottom: 24px;
  color: #6b7280;
}

.login-link {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
  margin-left: 4px;
  cursor: pointer;
  transition: color 0.3s ease;
}

.login-link:hover {
  color: #4f46e5;
  text-decoration: underline;
}

.social-register {
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
