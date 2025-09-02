// @ts-ignore
/* eslint-disable */
import request from '@/request'

/** 获取应用详情 GET /app/${param0} */
export async function getInfo(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getInfoParams,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params
  return request<API.BaseResponseAppInfoCommonResVo>(`/app/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  })
}

/** 删除应用 DELETE /app/${param0} */
export async function delete1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.delete1Params,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params
  return request<API.BaseResponseVoid>(`/app/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  })
}

/** 获取用户应用列表 GET /app/list */
export async function getList(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getListParams,
  options?: { [key: string]: any }
) {
  return request<API.PageResponseAppInfoCommonResVo>('/app/list', {
    method: 'GET',
    params: {
      ...params,
      queryReqVo: undefined,
      ...params['queryReqVo'],
    },
    ...(options || {}),
  })
}

/** 获取精选应用列表 GET /app/list/featured */
export async function getFeaturedList(options?: { [key: string]: any }) {
  return request<API.PageResponseAppInfoCommonResVo>('/app/list/featured', {
    method: 'GET',
    ...(options || {}),
  })
}

/** 更新应用信息 POST /app/update */
export async function update(body: API.AppUpdateCommonReqVo, options?: { [key: string]: any }) {
  return request<API.BaseResponseVoid>('/app/update', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}
