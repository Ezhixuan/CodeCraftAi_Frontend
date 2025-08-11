declare namespace API {
  type adminAddBySizeParams = {
    size: number
  }

  type adminDisableParams = {
    disableId: number
  }

  type adminGetInfoParams = {
    id: number
  }

  type adminGetList1Params = {
    queryReqVo: AppQueryReqVo
  }

  type adminGetListParams = {
    queryReqVo: UserQueryReqVo
  }

  type adminGetUserInfoParams = {
    id: number
  }

  type AppGenerateReqVo = {
    /** 初始化提示 */
    initPrompt: string
  }

  type AppInfoAdminResVo = {
    /** 应用ID */
    id?: number
    /** 应用名称 */
    name?: string
    /** 应用封面 */
    cover?: string
    /** 初始提示 */
    initPrompt?: string
    /** 代码生成类型 */
    codeGenType?: string
    /** 部署密钥 */
    deployKey?: string
    /** 部署时间 */
    deployTime?: string
    /** 优先级 */
    priority?: number
    /** 用户 id */
    userId?: number
    /**  创建时间 */
    createTime?: string
    /** 更新时间 */
    updateTime?: string
    userInfo?: UserInfoAdminResVo
  }

  type AppInfoCommonResVo = {
    /** 应用ID */
    id?: number
    /** 应用名称 */
    name?: string
    /** 应用封面 */
    cover?: string
    /** 部署时间 */
    deployTime?: string
    /** 用户 id */
    userId?: number
    /**  创建时间 */
    createTime?: string
    /** 更新时间 */
    updateTime?: string
    userInfo?: UserInfoCommonResVo
  }

  type AppQueryReqVo = {
    /** 页码，从 1 开始 */
    pageNo: number
    /** 每页条数，最大值为 100 */
    pageSize: number
    /** 排序方式 */
    orderBy?: string
    /** 应用ID */
    id?: number
    /** 应用名称 */
    name?: string
    /** 代码生成类型 */
    codeGenType?: string
    /** 部署密钥 */
    deployKey?: string
    /** 部署时间 */
    deployTime?: string
    /** 优先级 */
    priority?: number
    /** 用户 id */
    userId?: number
    /** 开始时间 */
    startTime?: string
    /** 结束时间 */
    endTime?: string
  }

  type AppUpdateAdminReqVo = {
    /** 应用ID */
    id: number
    /** 应用名称 */
    name?: string
    /** 应用封面 */
    cover?: string
    /** 部署密钥 */
    deployKey?: string
    /** 优先级 */
    priority?: number
  }

  type AppUpdateCommonReqVo = {
    /** 应用ID */
    id: number
    /** 应用名称 */
    name?: string
  }

  type BaseResponseAppInfoAdminResVo = {
    message?: string
    code?: number
    data?: AppInfoAdminResVo
  }

  type BaseResponseAppInfoCommonResVo = {
    message?: string
    code?: number
    data?: AppInfoCommonResVo
  }

  type BaseResponseDeployStatusVo = {
    message?: string
    code?: number
    data?: DeployStatusVo
  }

  type BaseResponseLong = {
    message?: string
    code?: number
    data?: number
  }

  type BaseResponseString = {
    message?: string
    code?: number
    data?: string
  }

  type BaseResponseUserInfoAdminResVo = {
    message?: string
    code?: number
    data?: UserInfoAdminResVo
  }

  type BaseResponseUserInfoCommonResVo = {
    message?: string
    code?: number
    data?: UserInfoCommonResVo
  }

  type BaseResponseVoid = {
    message?: string
    code?: number
    data?: Record<string, any>
  }

  type deleteUsingDELETEParams = {
    id: number
  }

  type deployPreviewParams = {
    appId: number
  }

  type DeployStatusVo = {
    /** 应用ID */
    appId?: number
    /** 部署标识 */
    deployKey?: string
    /** 部署时间 */
    deployTime?: string
    /** 临时文件是否存在 */
    tempFileExists?: boolean
    /** 部署文件是否存在 */
    deployFileExists?: boolean
  }

  type generateCodeParams = {
    message: string
    appId: number
  }

  type getDeployStatusParams = {
    appId: number
  }

  type getInfoParams = {
    id: number
  }

  type getListParams = {
    queryReqVo: AppQueryReqVo
  }

  type PageResponseAppInfoAdminResVo = {
    message?: string
    code?: number
    data?: PageResVoAppInfoAdminResVo
  }

  type PageResponseAppInfoCommonResVo = {
    message?: string
    code?: number
    data?: PageResVoAppInfoCommonResVo
  }

  type PageResponseString = {
    message?: string
    code?: number
    data?: PageResVoString
  }

  type PageResponseUserAddResVo = {
    message?: string
    code?: number
    data?: PageResVoUserAddResVo
  }

  type PageResponseUserInfoAdminResVo = {
    message?: string
    code?: number
    data?: PageResVoUserInfoAdminResVo
  }

  type PageResVoAppInfoAdminResVo = {
    totalRow?: number
    list?: AppInfoAdminResVo[]
    totalPage?: number
  }

  type PageResVoAppInfoCommonResVo = {
    totalRow?: number
    list?: AppInfoCommonResVo[]
    totalPage?: number
  }

  type PageResVoString = {
    totalRow?: number
    list?: string[]
    totalPage?: number
  }

  type PageResVoUserAddResVo = {
    totalRow?: number
    list?: UserAddResVo[]
    totalPage?: number
  }

  type PageResVoUserInfoAdminResVo = {
    totalRow?: number
    list?: UserInfoAdminResVo[]
    totalPage?: number
  }

  type redirectToStaticResourceParams = {
    deployKey: string
  }

  type ServerSentEventString = true

  type UserAddReqVo = {
    /** 用户账号 */
    account?: string
    /** 用户昵称 */
    name?: string
  }

  type UserAddResVo = {
    /** 用户账户 */
    account?: string
    /** 密码 */
    password?: string
  }

  type UserInfoAdminResVo = {
    /** 用户id */
    id?: number
    /** 用户账号 */
    account?: string
    /** 用户昵称 */
    name?: string
    /** 用户头像 */
    avatar?: string
    /** 用户简介 */
    profile?: string
    /** 用户邮箱 */
    email?: string
    /** 用户状态 */
    status?: number
    /** 创建时间 */
    createTime?: string
    /** 更新时间 */
    updateTime?: string
    /** 用户角色 */
    role?: string
  }

  type UserInfoCommonResVo = {
    /** 用户id */
    id?: number
    /** 用户账号 */
    account?: string
    /** 用户昵称 */
    name?: string
    /** 用户头像 */
    avatar?: string
    /** 用户简介 */
    profile?: string
    /** 用户邮箱 */
    email?: string
    /** 创建时间 */
    createTime?: string
    /** 更新时间 */
    updateTime?: string
    /** 用户角色 */
    role?: string
  }

  type UserLoginReqVo = {
    /** 用户账号 */
    account: string
    /** 密码 */
    password: string
  }

  type UserQueryReqVo = {
    /** 页码，从 1 开始 */
    pageNo: number
    /** 每页条数，最大值为 100 */
    pageSize: number
    /** 排序方式 */
    orderBy?: string
    /** 用户id */
    id?: number
    /** 用户账号 */
    account?: string
    /** 用户昵称 */
    name?: string
    /** 邮箱 */
    email?: string
    /** 状态 */
    status?: number
    /** 创建时间 */
    createTime?: string
    /** 用户角色 */
    role?: string
  }

  type UserRegisterReqVo = {
    /** 用户账号 */
    account: string
    /** 密码 */
    password: string
    /** 核对密码 */
    confirmPassword: string
  }

  type UserUpdateReqVo = {
    /** 用户id */
    id: number
    /** 用户密码 */
    password?: string
    /** 用户昵称 */
    name?: string
    /** 用户头像 */
    avatar?: string
    /** 用户简介 */
    profile?: string
    /** 用户邮箱 */
    email?: string
  }
}
