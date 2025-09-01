import { ref } from 'vue'
import { defineStore } from 'pinia'
import { getCodeGenTypeList, getUserRoleList, getUserStatusList } from '@/api/enumController'

export const useEnumStore = defineStore('enumStore', () => {
  // codeGenType 列表
  const codeGenTypeList = ref<API.KeyValueResVo[]>([])

  // codeGenType 列表加载状态
  const codeGenTypeListLoading = ref<boolean>(false)

  // 获取 codeGenType 列表
  const loadCodeGenTypeList = async () => {
    if (codeGenTypeList.value.length > 0) {
      // 如果已经有数据，直接返回
      return codeGenTypeList.value
    }

    codeGenTypeListLoading.value = true
    try {
      const res = await getCodeGenTypeList()
      if (res.data.data?.list) {
        codeGenTypeList.value = res.data.data.list
      }
      return codeGenTypeList.value
    } finally {
      codeGenTypeListLoading.value = false
    }
  }

  // 用户角色列表
  const userRoleList = ref<API.KeyValueResVo[]>([])

  // 用户角色列表加载状态
  const userRoleListLoading = ref<boolean>(false)

  // 获取用户角色列表
  const loadUserRoleList = async () => {
    if (userRoleList.value.length > 0) {
      // 如果已经有数据，直接返回
      return userRoleList.value
    }

    userRoleListLoading.value = true
    try {
      const res = await getUserRoleList()
      if (res.data.data?.list) {
        userRoleList.value = res.data.data.list
      }
      return userRoleList.value
    } finally {
      userRoleListLoading.value = false
    }
  }

  // 用户状态列表
  const userStatusList = ref<API.KeyValueResVo[]>([])

  // 用户状态列表加载状态
  const userStatusListLoading = ref<boolean>(false)

  // 获取用户状态列表
  const loadUserStatusList = async () => {
    if (userStatusList.value.length > 0) {
      // 如果已经有数据，直接返回
      return userStatusList.value
    }

    userStatusListLoading.value = true
    try {
      const res = await getUserStatusList()
      if (res.data.data?.list) {
        userStatusList.value = res.data.data.list
      }
      return userStatusList.value
    } finally {
      userStatusListLoading.value = false
    }
  }

  return {
    codeGenTypeList,
    codeGenTypeListLoading,
    loadCodeGenTypeList,
    
    userRoleList,
    userRoleListLoading,
    loadUserRoleList,
    
    userStatusList,
    userStatusListLoading,
    loadUserStatusList,
  }
})