import { ref } from 'vue'
import { defineStore } from 'pinia'
import { getCodeGenTypeList } from '@/api/enumController'

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

  return {
    codeGenTypeList,
    codeGenTypeListLoading,
    loadCodeGenTypeList,
  }
})
