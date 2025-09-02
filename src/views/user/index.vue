<template>
  <CommonBackground>
    <div class="user-profile-container">
      <a-card title="个人信息" :bordered="false" class="profile-card">
        <a-spin :spinning="loading">
          <!-- 用户头像区域 -->
          <div class="avatar-section">
            <UserAvatar :size="120" />
            <div class="avatar-info">
              <h2>{{ userInfo.name || '未设置昵称' }}</h2>
              <p class="user-role">{{ getRoleText(userInfo.role) }}</p>
              <p class="user-account">账号：{{ userInfo.account }}</p>
            </div>
          </div>

          <a-divider />

          <!-- 用户信息表单 -->
          <a-form
            ref="formRef"
            :model="formData"
            :rules="rules"
            layout="vertical"
            class="user-form"
          >
            <a-row :gutter="24">
              <a-col :span="12">
                <a-form-item label="昵称" name="name">
                  <a-input
                    v-model:value="formData.name"
                    placeholder="请输入昵称"
                    :disabled="!isEditing"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="邮箱" name="email">
                  <a-input
                    v-model:value="formData.email"
                    placeholder="请输入邮箱"
                    :disabled="!isEditing"
                  />
                </a-form-item>
              </a-col>
            </a-row>

            <a-row :gutter="24">
              <a-col :span="12">
                <a-form-item label="头像链接" name="avatar">
                  <a-input
                    v-model:value="formData.avatar"
                    placeholder="请输入头像链接"
                    :disabled="!isEditing"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="创建时间">
                  <a-input
                    :value="formatDate(userInfo.createTime)"
                    disabled
                    placeholder="暂无数据"
                  />
                </a-form-item>
              </a-col>
            </a-row>

            <a-form-item label="个人简介" name="profile">
              <a-textarea
                v-model:value="formData.profile"
                placeholder="请输入个人简介"
                :rows="4"
                :disabled="!isEditing"
              />
            </a-form-item>

            <!-- 密码修改区域 -->
            <template v-if="isEditing">
              <a-divider>密码修改（可选）</a-divider>
              <a-form-item label="新密码" name="password">
                <a-input-password
                  v-model:value="formData.password"
                  placeholder="如需修改密码请输入新密码"
                />
              </a-form-item>
            </template>
          </a-form>

          <!-- 操作按钮 -->
          <div class="action-buttons">
            <template v-if="!isEditing">
              <a-button type="primary" @click="startEdit">
                <EditOutlined />
                编辑信息
              </a-button>
            </template>
            <template v-else>
              <a-space>
                <a-button @click="cancelEdit">
                  <CloseOutlined />
                  取消
                </a-button>
                <a-button type="primary" :loading="updateLoading" @click="handleUpdate">
                  <SaveOutlined />
                  保存
                </a-button>
              </a-space>
            </template>
          </div>
        </a-spin>
      </a-card>
    </div>
  </CommonBackground>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import type { FormInstance } from 'ant-design-vue'
import { message } from 'ant-design-vue'
import { CloseOutlined, EditOutlined, SaveOutlined } from '@ant-design/icons-vue'
import { getUserInfo, updateUserInfo } from '@/api/userController.ts'
import { useLoginUserStore } from '@/stores/loginUser'
import UserAvatar from '@/components/User/Avatar/index.vue'
import CommonBackground from '@/components/Background/Common/index.vue'

// 状态管理
const loginUserStore = useLoginUserStore()

// 响应式数据
const loading = ref(false)
const updateLoading = ref(false)
const isEditing = ref(false)
const formRef = ref<FormInstance>()

// 用户信息
const userInfo = ref<API.UserInfoCommonResVo>({})

// 表单数据
const formData = reactive<API.UserUpdateReqVo>({
  id: '-1',
  name: '',
  email: '',
  avatar: '',
  profile: '',
  password: '',
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 1, max: 20, message: '昵称长度在 1 到 20 个字符', trigger: 'blur' },
  ],
  email: [{ type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }],
  avatar: [{ type: 'url', message: '请输入正确的URL格式', trigger: 'blur' }],
  profile: [{ max: 200, message: '个人简介不能超过200个字符', trigger: 'blur' }],
  password: [{ min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }],
}

// 计算属性
const getRoleText = computed(() => {
  return (role?: string) => {
    const roleMap: Record<string, string> = {
      ADMIN: '管理员',
      USER: '普通用户',
      GUEST: '游客',
    }
    return roleMap[role || 'GUEST'] || '未知角色'
  }
})

// 格式化日期
const formatDate = (dateString?: string) => {
  if (!dateString) return '暂无数据'
  return new Date(dateString).toLocaleString('zh-CN')
}

// 获取用户信息
const fetchUserInfo = async () => {
  try {
    loading.value = true
    const result = await getUserInfo()
    if (result.data.data) {
      userInfo.value = result.data.data
      const val = result.data.data
      // 更新表单数据
      Object.assign(formData, {
        id: val.id || 0,
        name: val.name || '',
        email: val.email || '',
        avatar: val.avatar || '',
        profile: val.profile || '',
        password: '',
      })
      // 更新全局用户状态
      loginUserStore.setLoginUser(val)
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
  } finally {
    loading.value = false
  }
}

// 开始编辑
const startEdit = () => {
  isEditing.value = true
}

// 取消编辑
const cancelEdit = () => {
  isEditing.value = false
  // 重置表单数据
  Object.assign(formData, {
    id: userInfo.value.id || 0,
    name: userInfo.value.name || '',
    email: userInfo.value.email || '',
    avatar: userInfo.value.avatar || '',
    profile: userInfo.value.profile || '',
    password: '',
  })
  formRef.value?.clearValidate()
}

// 更新用户信息
const handleUpdate = async () => {
  try {
    // 表单验证
    await formRef.value?.validate()

    updateLoading.value = true

    // 构建更新请求数据
    const updateReq: API.UserUpdateReqVo = {
      id: formData.id,
      name: formData.name,
      email: formData.email || undefined,
      avatar: formData.avatar || undefined,
      profile: formData.profile || undefined,
    }

    // 如果输入了新密码，则包含密码字段
    if (formData.password && formData.password.trim()) {
      updateReq.password = formData.password
    }

    // 调用更新接口
    const result = await updateUserInfo(updateReq)
    if (result.data.data) {
      // 更新本地数据
      userInfo.value = result.data.data
      loginUserStore.setLoginUser(result.data.data)

      // 退出编辑模式
      isEditing.value = false
      formData.password = '' // 清空密码字段

      message.success('个人信息更新成功！')
    }
  } catch (error) {
    console.error('更新用户信息失败:', error)
  } finally {
    updateLoading.value = false
  }
}

// 生命周期
onMounted(() => {
  fetchUserInfo()
})
</script>

<style scoped>
.user-profile-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 24px;
}

.user-avatar {
  flex-shrink: 0;
}

.avatar-info h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
}

.user-role {
  color: #1890ff;
  font-weight: 500;
  margin: 0 0 4px 0;
}

.user-account {
  color: #666;
  margin: 0;
}

.user-form {
  margin-top: 24px;
}

.action-buttons {
  margin-top: 32px;
  text-align: center;
}

@media (max-width: 768px) {
  .avatar-section {
    flex-direction: column;
    text-align: center;
  }

  .user-profile-container {
    padding: 16px;
  }
}
</style>
