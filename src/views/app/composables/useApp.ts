import { reactive } from 'vue'
import { message } from 'ant-design-vue'
import { getAppInfo } from '@/api/appController.ts'
import { getAppStatus } from '@/api/appCoreController.ts'
import { useLoginUserStore } from '@/stores/loginUser.ts'

export interface App {
  id: string | undefined
  data: API.AppInfoCommonResVo | undefined
  isOwner: boolean
  isLoading: boolean
}

export type AppStatusType = 'LOADING' | 'LOADED' | 'ERROR' | ''

export interface AppStatus {
  deployStatus: AppStatusType
  previewStatus: AppStatusType
  originalDirStatus: AppStatusType
  loading: boolean
}

/**
 * 应用状态管理 composable
 */
export function useApp() {
  const loginUserStore = useLoginUserStore()

  const app = reactive<App>({
    id: '',
    data: undefined,
    isOwner: false,
    isLoading: false,
  })

  const appStatus = reactive<AppStatus>({
    deployStatus: '',
    previewStatus: '',
    originalDirStatus: '',
    loading: false,
  })

  /**
   * 获取应用信息
   */
  const getAppInfoById = async (currentAppId: string) => {
    app.isLoading = true
    try {
      const response = await getAppInfo({ id: currentAppId })
      if (response.data.data) {
        const appInfo = response.data.data
        app.id = appInfo.id
        app.data = appInfo
        app.isOwner = appInfo.userId === loginUserStore.loginUser.id
        console.log('应用信息:', appInfo)
      }
    } catch (error) {
      console.error('获取应用信息失败:', error)
      message.error(`获取应用信息失败: ${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      app.isLoading = false
    }
  }

  /**
   * 获取应用状态
   */
  const getAppStatusById = async (currentAppId: string) => {
    appStatus.loading = true
    try {
      const response = await getAppStatus({ appId: currentAppId })
      if (response.data.data) {
        const statusData = response.data.data
        appStatus.deployStatus = statusData.deployStatus || ''
        appStatus.previewStatus = statusData.previewStatus || ''
        appStatus.originalDirStatus = statusData.originalDirStatus || ''
      }
    } catch (error) {
      console.error('获取应用状态失败:', error)
      message.error(`获取应用状态失败: ${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      appStatus.loading = false
    }
  }

  /**
   * 初始化应用数据
   */
  const initByAppId = async (currentAppId: string) => {
    await getAppInfoById(currentAppId)
    await getAppStatusById(currentAppId)
  }

  return {
    app,
    appStatus,
    getAppInfoById,
    getAppStatusById,
    initByAppId,
  }
}
