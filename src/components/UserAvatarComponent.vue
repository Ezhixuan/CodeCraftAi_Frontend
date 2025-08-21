<template>
  <div class="user-avatar" :class="{ 'is-loading': isLoading }">
    <a-avatar
      v-if="currentUserInfo?.avatar || currentUserInfo?.name"
      :src="currentUserInfo?.avatar"
      :size="props.size"
      :style="{ backgroundColor: '#1890ff' }"
      @error="handleAvatarError"
    >
      {{ currentUserInfo?.name?.charAt(0) || currentUserInfo?.account?.charAt(0) || '?' }}
    </a-avatar>
    <a-avatar v-else :size="props.size" :style="{ backgroundColor: '#d9d9d9' }">
      <span class="login-placeholder">未登录</span>
    </a-avatar>
    <span
      v-if="showName && currentUserInfo?.name"
      class="user-name"
      :style="{ color: nameColor, fontSize: nameFontSize }"
    >
      {{ currentUserInfo.name }}
    </span>
  </div>
</template>

<script setup lang="ts">
/**
 * UserAvatarComponent - 用户头像组件
 *
 * 支持两种使用方式：
 * 1. 传入 userId：组件自动查询用户信息并显示头像
 *    <UserAvatarComponent userId="123" showName />
 *
 * 2. 直接传入 userInfo：跳过查询步骤，直接使用传入的用户信息
 *    <UserAvatarComponent :userInfo="userInfoObject" showName />
 *
 * 优先级：userInfo > userId > 当前登录用户信息
 */
import { onMounted, ref, watch } from 'vue'
import { getUserInfoById } from '@/api/yonghukongzhiqi'
import { useLoginUserStore } from '@/stores/loginUser'

interface Props {
  /** 用户ID，当传入时会自动查询用户信息 */
  userId?: string
  /** 直接传入的用户信息对象，优先级高于 userId */
  userInfo?: API.UserInfoCommonResVo
  /** 是否显示用户名 */
  showName?: boolean
  /** 头像大小 */
  size?: string | number | object
  /** 用户名颜色 */
  nameColor?: string
  /** 用户名字体大小 */
  nameFontSize?: string
}

const props = withDefaults(defineProps<Props>(), {
  showName: false,
  size: 32,
  nameColor: '#000000',
  nameFontSize: '0.875rem',
})

const loginUserStore = useLoginUserStore()
const currentUserInfo = ref<API.UserInfoCommonResVo | null>(null)
const isLoading = ref(false)
const avatarError = ref(false)

/**
 * 处理头像加载错误
 */
const handleAvatarError = () => {
  avatarError.value = true
}

/**
 * 加载用户信息
 * 优先级：props.userInfo > props.userId > loginUserStore.loginUser
 */
const loadUserInfo = async () => {
  // 如果直接传入了 userInfo，优先使用
  if (props.userInfo) {
    currentUserInfo.value = props.userInfo
    return
  }

  // 如果传入了 userId，查询用户信息
  if (props.userId) {
    isLoading.value = true
    try {
      const response = await getUserInfoById({ id: props.userId })
      currentUserInfo.value = response as API.UserInfoCommonResVo
    } catch (error) {
      console.error('获取用户信息失败', error)
      currentUserInfo.value = null
    } finally {
      isLoading.value = false
    }
  } else {
    // 使用当前登录用户信息
    currentUserInfo.value = loginUserStore.loginUser
  }
}

// 监听 userId 和 userInfo 的变化
watch(
  [() => props.userId, () => props.userInfo],
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
