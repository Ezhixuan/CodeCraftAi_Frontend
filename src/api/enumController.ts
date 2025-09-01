// @ts-ignore
/* eslint-disable */
import request from '@/request'

/** 获取代码生成模式列表 GET /enums/codeGenType */
export async function getCodeGenTypeList(options?: { [key: string]: any }) {
  return request<API.PageResponseKeyValueResVo>('/enums/codeGenType', {
    method: 'GET',
    ...(options || {}),
  })
}

/** 获取用户角色列表 GET /enums/user/role */
export async function getUserRoleList(options?: { [key: string]: any }) {
  return request<API.PageResponseKeyValueResVo>('/enums/user/role', {
    method: 'GET',
    ...(options || {}),
  })
}

/** 获取用户状态列表 GET /enums/user/status */
export async function getUserStatusList(options?: { [key: string]: any }) {
  return request<API.PageResponseKeyValueResVo>('/enums/user/status', {
    method: 'GET',
    ...(options || {}),
  })
}
