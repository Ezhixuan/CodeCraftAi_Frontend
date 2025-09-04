// @ts-ignore
/* eslint-disable */
import request from '@/request'

/** 获取用户信息(完整) GET /admin/user/${param0} */
export async function getUserInfoAdmin(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getUserInfoAdminParams,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params
  return request<API.BaseResponseUserInfoAdminResVo>(`/admin/user/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  })
}

/** 新增用户(支持批量) POST /admin/user/add */
export async function postUserAddAdmin(body: API.UserAddReqVo[], options?: { [key: string]: any }) {
  return request<API.PageResponseUserAddResVo>('/admin/user/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 新增用户(支持批量) POST /admin/user/add/${param0} */
export async function postUserAddBySizeAdmin(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.postUserAddBySizeAdminParams,
  options?: { [key: string]: any }
) {
  const { size: param0, ...queryParams } = params
  return request<API.PageResponseUserAddResVo>(`/admin/user/add/${param0}`, {
    method: 'POST',
    params: { ...queryParams },
    ...(options || {}),
  })
}

/** 停用账号 PUT /admin/user/disable/${param0} */
export async function putUserDisabledAdmin(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.putUserDisabledAdminParams,
  options?: { [key: string]: any }
) {
  const { disableId: param0, ...queryParams } = params
  return request<API.BaseResponseVoid>(`/admin/user/disable/${param0}`, {
    method: 'PUT',
    params: { ...queryParams },
    ...(options || {}),
  })
}

/** 获取用户列表 GET /admin/user/list */
export async function getUserListAdmin(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getUserListAdminParams,
  options?: { [key: string]: any }
) {
  return request<API.PageResponseUserInfoAdminResVo>('/admin/user/list', {
    method: 'GET',
    params: {
      ...params,
      queryReqVo: undefined,
      ...params['queryReqVo'],
    },
    ...(options || {}),
  })
}
