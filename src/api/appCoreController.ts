// @ts-ignore
/* eslint-disable */
import request from '@/request'

/** 应用部署 PUT /app/deploy/${param0} */
export async function putAppDeploy(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.putAppDeployParams,
  options?: { [key: string]: any }
) {
  const { appId: param0, ...queryParams } = params
  return request<API.BaseResponseString>(`/app/deploy/${param0}`, {
    method: 'PUT',
    params: { ...queryParams },
    ...(options || {}),
  })
}

/** 应用下载 GET /app/download/${param0} */
export async function getAppDownloadZip(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getAppDownloadZipParams,
  options?: { [key: string]: any }
) {
  const { appId: param0, ...queryParams } = params
  return request<any>(`/app/download/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  })
}

/** 通过用户输入生成应用记录 POST /app/generate */
export async function postAppInfo(body: API.AppGenerateReqVo, options?: { [key: string]: any }) {
  return request<API.BaseResponseLong>('/app/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 代码生成 GET /app/generate/code */
export async function sseAppGenerateCode(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.sseAppGenerateCodeParams,
  options?: { [key: string]: any }
) {
  return request<API.ServerSentEventString[]>('/app/generate/code', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  })
}

/** 应用预览 GET /app/preview/${param0} */
export async function getAppPreviewUrl(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getAppPreviewUrlParams,
  options?: { [key: string]: any }
) {
  const { appId: param0, ...queryParams } = params
  return request<API.BaseResponseString>(`/app/preview/${param0}`, {
    method: 'GET',
    params: {
      ...queryParams,
    },
    ...(options || {}),
  })
}

/** 获取应用状态 GET /app/status/${param0} */
export async function getAppStatus(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getAppStatusParams,
  options?: { [key: string]: any }
) {
  const { appId: param0, ...queryParams } = params
  return request<API.BaseResponseAppStatusResVo>(`/app/status/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  })
}
