// @ts-ignore
/* eslint-disable */
import request from '@/request'

/** 应用部署 PUT /app/deploy/${param0} */
export async function doDeploy(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.doDeployParams,
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
export async function doDownload(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.doDownloadParams,
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
export async function doGenerate(body: API.AppGenerateReqVo, options?: { [key: string]: any }) {
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
export async function generateCode(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.generateCodeParams,
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
export async function doPreview(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.doPreviewParams,
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
export async function getStatus(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getStatusParams,
  options?: { [key: string]: any }
) {
  const { appId: param0, ...queryParams } = params
  return request<API.BaseResponseAppStatusResVo>(`/app/status/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  })
}
