// @ts-ignore
/* eslint-disable */
import request from '@/request'

/** 获取用户信息 GET /user */
export async function getUserInfo(options?: { [key: string]: any }) {
  return request<API.BaseResponseUserInfoCommonResVo>('/user', {
    method: 'GET',
    ...(options || {}),
  })
}

/** 修改用户信息 POST /user */
export async function updateUserInfo(body: API.UserUpdateReqVo, options?: { [key: string]: any }) {
  return request<API.BaseResponseUserInfoCommonResVo>('/user', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 通过 id 获取用户信息 GET /user/${param0} */
export async function getUserInfoById(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getUserInfoByIdParams,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params
  return request<API.BaseResponseUserInfoCommonResVo>(`/user/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  })
}

/** 获取用户信息(完整) GET /user/${param0}/admin */
export async function adminGetUserInfo(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.adminGetUserInfoParams,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params
  return request<API.BaseResponseUserInfoAdminResVo>(`/user/${param0}/admin`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  })
}

/** 新增用户(支持批量) PUT /user/add */
export async function adminAddByAccount(
  body: API.UserAddReqVo[],
  options?: { [key: string]: any }
) {
  return request<API.PageResponseUserAddResVo>('/user/add', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 新增用户(支持批量) PUT /user/add/${param0} */
export async function adminAddBySize(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.adminAddBySizeParams,
  options?: { [key: string]: any }
) {
  const { size: param0, ...queryParams } = params
  return request<API.PageResponseUserAddResVo>(`/user/add/${param0}`, {
    method: 'PUT',
    params: { ...queryParams },
    ...(options || {}),
  })
}

/** 停用账号 PUT /user/disable/${param0} */
export async function adminDisable(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.adminDisableParams,
  options?: { [key: string]: any }
) {
  const { disableId: param0, ...queryParams } = params
  return request<API.BaseResponseVoid>(`/user/disable/${param0}`, {
    method: 'PUT',
    params: { ...queryParams },
    ...(options || {}),
  })
}

/** 获取用户列表 GET /user/list */
export async function adminGetList(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.adminGetListParams,
  options?: { [key: string]: any }
) {
  return request<API.PageResponseUserInfoAdminResVo>('/user/list', {
    method: 'GET',
    params: {
      ...params,
      queryReqVo: undefined,
      ...params['queryReqVo'],
    },
    ...(options || {}),
  })
}

/** 用户登录 POST /user/login */
export async function doLogin(body: API.UserLoginReqVo, options?: { [key: string]: any }) {
  return request<API.BaseResponseUserInfoCommonResVo>('/user/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 退出登录 POST /user/logout */
export async function doLogout(options?: { [key: string]: any }) {
  return request<API.BaseResponseVoid>('/user/logout', {
    method: 'POST',
    ...(options || {}),
  })
}

/** 用户注册 POST /user/register */
export async function doRegister(body: API.UserRegisterReqVo, options?: { [key: string]: any }) {
  return request<API.BaseResponseLong>('/user/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}
