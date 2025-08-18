import { ref } from 'vue'
import { defineStore } from 'pinia'
import { getUserInfo } from '@/api/yonghukongzhiqi'

export const useLoginUserStore = defineStore('loginUser', () => {
  // 设置默认值
  const loginUser = ref<API.UserInfoCommonResVo>({
    id: '-1',
    name: '未登录',
    role: 'GUEST',
  })

  // 获取登录用户信息
  async function fetchLoginUserInfo() {
    const res = await getUserInfo()
    if (res.data.data) {
      loginUser.value = res.data.data
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

  return { loginUser, fetchLoginUserInfo, setLoginUser, logout, isLogin }
})
