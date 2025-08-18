/**
 * API 配置文件
 * 用于集中管理所有API相关的配置
 */

export interface ApiConfig {
  baseURL: string
  timeout: number
  withCredentials: boolean
}

export const apiConfig: ApiConfig = {
  baseURL: 'http://localhost:8911/api',
  timeout: 60000,
  withCredentials: true,
}

// 导出基础URL用于非axios请求
export const BASE_URL = apiConfig.baseURL
