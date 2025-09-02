// @ts-ignore
/* eslint-disable */
import request from '@/request'

/** 获取应用详情 GET /admin/app/${param0} */
export async function getInfo1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getInfo1Params,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params
  return request<API.BaseResponseAppInfoAdminResVo>(`/admin/app/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  })
}

/** 获取用户应用列表 GET /admin/app/list */
export async function getList1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getList1Params,
  options?: { [key: string]: any }
) {
  return request<API.PageResponseAppInfoAdminResVo>('/admin/app/list', {
    method: 'GET',
    params: {
      ...params,
      queryReqVo: undefined,
      ...params['queryReqVo'],
    },
    ...(options || {}),
  })
}

/** 更新应用信息 POST /admin/app/update */
export async function update1(body: API.AppUpdateAdminReqVo, options?: { [key: string]: any }) {
  return request<API.BaseResponseVoid>('/admin/app/update', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}
