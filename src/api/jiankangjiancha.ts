// @ts-ignore
/* eslint-disable */
import request from '@/request'

/** 健康检查 GET /health */
export async function isOk(options?: { [key: string]: any }) {
  return request<API.BaseResponseString>('/health', {
    method: 'GET',
    ...(options || {}),
  })
}

/** 列表 GET /list */
export async function list(options?: { [key: string]: any }) {
  return request<API.PageResponseString>('/list', {
    method: 'GET',
    ...(options || {}),
  })
}
