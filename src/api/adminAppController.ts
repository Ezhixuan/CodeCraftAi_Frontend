// @ts-ignore
/* eslint-disable */
import request from '@/request'

/** 获取应用详情 GET /app/admin/${param0} */
export async function adminGetInfo(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.adminGetInfoParams,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params
  return request<API.BaseResponseAppInfoAdminResVo>(`/app/admin/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  })
}

/** 获取用户应用列表 GET /app/admin/list */
export async function adminGetList1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.adminGetList1Params,
  options?: { [key: string]: any }
) {
  return request<API.PageResponseAppInfoAdminResVo>('/app/admin/list', {
    method: 'GET',
    params: {
      ...params,
      queryReqVo: undefined,
      ...params['queryReqVo'],
    },
    ...(options || {}),
  })
}

/** 更新应用信息 POST /app/admin/update */
export async function adminUpdate(body: API.AppUpdateAdminReqVo, options?: { [key: string]: any }) {
  return request<API.BaseResponseVoid>('/app/admin/update', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}
