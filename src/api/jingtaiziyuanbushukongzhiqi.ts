// @ts-ignore
/* eslint-disable */
import request from '@/request'

/** 部署静态资源 GET /deploy/preview */
export async function deployPreview(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.deployPreviewParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseString>('/deploy/preview', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  })
}

/** 通过部署标识重定向到静态资源 GET /deploy/redirect/${param0} */
export async function redirectToStaticResource(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.redirectToStaticResourceParams,
  options?: { [key: string]: any }
) {
  const { deployKey: param0, ...queryParams } = params
  return request<any>(`/deploy/redirect/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  })
}

/** 获取应用部署状态 GET /deploy/status */
export async function getDeployStatus(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getDeployStatusParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseDeployStatusVo>('/deploy/status', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  })
}
