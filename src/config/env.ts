/**
 * API 配置文件
 * 用于集中管理所有API相关的配置
 */

export interface Env {
  baseURL: string
  timeout: number
  withCredentials: boolean
}

// 根据环境设置不同的基础URL
const getBaseURL = (): string => {
  // 生产环境
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_API_BASE_URL_PROD || 'https://api.example.com'
  }

  // 开发环境
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:8911/api'
}

export const apiConfig: Env = {
  baseURL: getBaseURL(),
  timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 60000,
  withCredentials: import.meta.env.VITE_API_WITH_CREDENTIALS === 'true',
}

// 导出基础URL用于非axios请求
export const getBaseUrl = (): string => apiConfig.baseURL