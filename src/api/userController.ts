// @ts-ignore
/* eslint-disable */
import request from '@/request'

/** 获取用户信息 GET /user */
export async function getLoginUserInfo(options?: { [key: string]: any }) {
  return request<API.BaseResponseUserInfoCommonResVo>('/user', {
    method: 'GET',
    ...(options || {}),
  })
}

/** 修改用户信息 PUT /user */
export async function putUserUpdate(body: API.UserUpdateReqVo, options?: { [key: string]: any }) {
  return request<API.BaseResponseUserInfoCommonResVo>('/user', {
    method: 'PUT',
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

/** 用户登录 POST /user/login */
export async function postUserLogin(body: API.UserLoginReqVo, options?: { [key: string]: any }) {
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
export async function postUserLogout(options?: { [key: string]: any }) {
  return request<API.BaseResponseVoid>('/user/logout', {
    method: 'POST',
    ...(options || {}),
  })
}

/** 用户注册 POST /user/register */
export async function postUserRegister(
  body: API.UserRegisterReqVo,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseLong>('/user/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}
