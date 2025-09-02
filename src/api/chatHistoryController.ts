// @ts-ignore
/* eslint-disable */
import request from '@/request'

/** 删除对话记录 DELETE /chat/history/${param0} */
export async function deleteUsingDelete(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.deleteUsingDELETEParams,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params
  return request<API.BaseResponseVoid>(`/chat/history/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  })
}

/** 获取对话历史列表 (管理员) GET /chat/history/admin/list */
export async function adminList(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.adminListParams,
  options?: { [key: string]: any }
) {
  return request<API.PageResponseChatInfoResVo>('/chat/history/admin/list', {
    method: 'GET',
    params: {
      ...params,
      reqVo: undefined,
      ...params['reqVo'],
    },
    ...(options || {}),
  })
}

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
