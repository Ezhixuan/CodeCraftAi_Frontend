import axios from 'axios'
import { message } from 'ant-design-vue'
import { apiConfig } from './config/apiConfig'

// 创建 Axios 实例
const myAxios = axios.create({
  baseURL: apiConfig.baseURL,
  timeout: apiConfig.timeout,
  withCredentials: apiConfig.withCredentials,
})

// 全局请求拦截器
myAxios.interceptors.request.use(
  function (config) {
    // Do something before request is sent
    return config
  },
  function (error) {
    // Do something with request error
    return Promise.reject(error)
  },
)

// 全局响应拦截器
myAxios.interceptors.response.use(
  function (response) {
    const { data } = response

    // 统一处理业务响应
    if (data && typeof data.code !== 'undefined') {
      // 请求成功，返回data内容
      if (data.code === 0) {
        return response
      }

      // 未登录
      if (data.code === 40100) {
        // 不是获取用户信息的请求，并且用户目前不是已经在用户登录页面，则跳转到登录页面
        message.warning(data.message || '未登录')
        if (
          !response.request.responseURL.includes('/auth/login') &&
          !window.location.pathname.includes('/auth/login')
        ) {
          window.location.href = `/auth/login?redirect=${window.location.href}`
        }
        return Promise.reject(new Error(data.message || '未登录'))
      }

      // 其他业务错误
      const errorMessage = data.message || '请求失败'
      message.error(errorMessage)
      return Promise.reject(new Error(errorMessage))
    }

    // 非标准响应格式，直接返回
    return response
  },
  function (error) {
    // 网络错误或其他错误
    const errorMessage = error.response?.data?.message || error.message || '网络错误'
    message.error(errorMessage)
    return Promise.reject(error)
  },
)

export default myAxios
