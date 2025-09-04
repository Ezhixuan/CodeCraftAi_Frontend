import { ref } from 'vue'
import { defineStore } from 'pinia'
import { getLoginUserInfo } from '@/api/userController.ts'

export const useLoginUserStore = defineStore('loginUser', () => {
  // 设置默认值
  const loginUser = ref<API.UserInfoCommonResVo>({
    id: '-1',
    name: '未登录',
    role: 'GUEST',
  })

  // 获取登录用户信息
  async function fetchLoginUserInfo() {
    try {
      const res = await getLoginUserInfo()
      if (res.data.data) {
        loginUser.value = res.data.data
      }
    } catch (error) {
      console.error('获取登录用户信息失败:', error)
      logout()
    }
  }

  // 更新登录用户信息
  function setLoginUser(newLoginUserInfo: API.UserInfoCommonResVo) {
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
