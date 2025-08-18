<template>
  <div class="user-avatar" :class="{ 'is-loading': isLoading }">
    <a-avatar
      v-if="userInfo?.avatar || userInfo?.name"
      :src="userInfo?.avatar"
      :size="props.size"
      :style="{ backgroundColor: '#1890ff' }"
      @error="handleAvatarError"
    >
      {{ userInfo?.name?.charAt(0) || userInfo?.account?.charAt(0) || '?' }}
    </a-avatar>
    <a-avatar v-else :size="props.size" :style="{ backgroundColor: '#d9d9d9' }">
      <span class="login-placeholder">未登录</span>
    </a-avatar>
    <span
      v-if="showName && userInfo?.name"
      class="user-name"
      :style="{ color: nameColor, fontSize: nameFontSize }"
    >
      {{ userInfo.name }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { getUserInfoById } from '@/api/yonghukongzhiqi'
import { useLoginUserStore } from '@/stores/loginUser'

interface Props {
  userId?: string
  showName?: boolean
  size?: string | number | object
  nameColor?: string
  nameFontSize?: string
}

const props = withDefaults(defineProps<Props>(), {
  showName: false,
  size: 32,
  nameColor: '#000000',
  nameFontSize: '0.875rem',
})

const loginUserStore = useLoginUserStore()
const userInfo = ref<API.UserInfoCommonResVo | null>(null)
const isLoading = ref(false)
const avatarError = ref(false)

const handleAvatarError = () => {
  avatarError.value = true
}

const loadUserInfo = async () => {
  if (props.userId) {
    isLoading.value = true
    try {
      const response = await getUserInfoById({ id: props.userId })
      if (response.data?.data) {
        userInfo.value = response.data.data
      }
    } catch (error) {
      console.error('获取用户信息失败', error)
      userInfo.value = null
    } finally {
      isLoading.value = false
    }
  } else {
    // 使用当前登录用户信息
    userInfo.value = loginUserStore.loginUser
  }
}

watch(
  () => props.userId,
  () => {
    loadUserInfo()
  },
  { immediate: true },
)

onMounted(() => {
  loadUserInfo()
})
</script>

<style scoped>
.user-avatar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.user-avatar.is-loading {
  opacity: 0.6;
  pointer-events: none;
}

.user-name {
  margin-left: 0.5rem;
}

.login-placeholder {
  font-size: 0.75rem;
  color: #8c8c8c;
}
</style>
