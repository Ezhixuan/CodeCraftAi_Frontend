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
