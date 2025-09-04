import { getUserInfoById } from '@/api/userController'

import { ref } from 'vue'

export function useUserInfo() {
  const userInfo = ref<API.UserInfoCommonResVo>()
  const userInfoLoading = ref(false)

  const fetchUserInfo = async (userId: string) => {
    userInfoLoading.value = true
    try {
      const response = await getUserInfoById({ id: userId })
      if (response.data.data) {
        userInfo.value = response.data.data
      }
    } catch (error) {
      console.log(error)
    } finally {
      userInfoLoading.value = false
    }
  }

  return {
    userInfo,
    userInfoLoading,
    fetchUserInfo,
  }
}
