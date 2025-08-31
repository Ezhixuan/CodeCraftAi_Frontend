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
export async function deleteUsingDelete(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.deleteUsingDELETEParams,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params
  return request<API.BaseResponseVoid>(`/app/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  })
}

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

/** 应用预览 GET /app/preview/${param0} */
export async function doPreview(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.doPreviewParams,
  options?: { [key: string]: any }
) {
  const { appId: param0, ...queryParams } = params
  return request<any>(`/app/preview/${param0}`, {
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
