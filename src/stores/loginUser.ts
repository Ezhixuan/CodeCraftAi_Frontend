import { ref } from 'vue'
import { defineStore } from 'pinia'
import { getUserInfo } from '@/api/yonghukongzhiqi'
import type { UserInfoCommonResVo } from '@/api/typings.d.ts'

export const useLoginUserStore = defineStore('loginUser', () => {
  // 设置默认值
  const loginUser = ref<UserInfoCommonResVo>({
    id: '-1',
    name: '未登录',
    role: 'GUEST',
  })

  // 获取登录用户信息
  async function fetchLoginUserInfo() {
    try {
      const res = await getUserInfo()
      if (res.data.code === 0 && res.data.data) {
        loginUser.value = res.data.data
      } else {
        throw new Error(res.data.message || '获取用户信息失败')
      }
    } catch (error) {
      console.error('获取登录用户信息失败:', error)
      // 保持默认的未登录状态
    }
  }

  // 更新登录用户信息
  function setLoginUser(newLoginUserInfo: UserInfoCommonResVo) {
    loginUser.value = newLoginUserInfo
  }

  // 用户退出
  function logout() {
    loginUser.value = {
      id: '-1',
      name: '未登录',
      role: 'GUEST',
    }
  }

  function isLogin() {
    return loginUser.value.id !== undefined && loginUser.value.id !== '-1'
  }

  function getRoleText(role?: string): string {
    const roleSwitch = role || loginUser.value.role
    switch (roleSwitch) {
      case 'USER':
        return '普通用户'
      case 'ADMIN':
        return '管理员'
      case 'GUEST':
        return '游客'
      default:
        return '未知'
    }
  }

  return { loginUser, fetchLoginUserInfo, setLoginUser, logout, isLogin, getRoleText }
})