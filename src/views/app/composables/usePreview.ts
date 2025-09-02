import { ref } from 'vue'
import { message } from 'ant-design-vue'
import { getAppPreviewUrl } from '@/api/appCoreController.ts'

/**
 * 预览功能管理 composable
 */
export function usePreview() {
  const url = ref('')
  const isLoading = ref(false)
  const preview = ref(false)
  const progressText = ref('')

  /**
   * 处理预览
   */
  const handlePreview = async (previewAppId: string, reBuild: boolean) => {
    isLoading.value = true
    try {
      const response = await getAppPreviewUrl({ appId: previewAppId, reBuild: reBuild })
      if (response.data.data) {
        url.value = response.data.data
        preview.value = true
        message.success('预览生成成功！')
      }
      console.log(preview.value)
    } catch (error) {
      console.error('预览生成失败:', error)
      message.error(`预览生成失败: ${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      isLoading.value = false
    }
  }

  return {
    url,
    isLoading,
    preview,
    progressText,
    handlePreview,
  }
}
