// @ts-ignore
/* eslint-disable */
import request from '@/request'

/** 获取对话历史列表 GET /chat/history/list */
export async function list1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.list1Params,
  options?: { [key: string]: any }
) {
  return request<API.PageResponseChatInfoResVo>('/chat/history/list', {
    method: 'GET',
    params: {
      ...params,
      reqVo: undefined,
      ...params['reqVo'],
    },
    ...(options || {}),
  })
}
