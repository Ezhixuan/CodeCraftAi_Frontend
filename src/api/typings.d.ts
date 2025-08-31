declare namespace API {
  type adminAddBySizeParams = {
    size: number
  }

  type adminDisableParams = {
    disableId: string
  }

  type adminGetInfoParams = {
    id: string
  }

  type adminGetList1Params = {
    queryReqVo: AppQueryReqVo
  }

  type adminGetListParams = {
    queryReqVo: UserQueryReqVo
  }

  type adminGetUserInfoParams = {
    id: string
  }

  type adminListParams = {
    reqVo: ChatQueryReqVo
  }

  type AppGenerateReqVo = {
    /** 初始化提示 */
    initPrompt: string
    /** 代码生成类型 */
    codeGenType: string
  }

  type AppInfoAdminResVo = {
    /** 应用ID */
    id?: string
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
    userId?: string
    /**  创建时间 */
    createTime?: string
    /** 更新时间 */
    updateTime?: string
    userInfo?: UserInfoAdminResVo
  }

  type AppInfoCommonResVo = {
    /** 应用ID */
    id?: string
    /** 应用名称 */
    name?: string
    /** 应用封面 */
    cover?: string
    /** 部署时间 */
    deployTime?: string
    /** 用户 id */
    userId?: string
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
    id?: string
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
    userId?: string
    /** 开始时间 */
    startTime?: string
    /** 结束时间 */
    endTime?: string
    /** 最大 id */
    maxId?: string
  }

  type AppStatusResVo = {
    /** 预览状态 */
    previewStatus?: 'LOADING' | 'LOADED' | 'ERROR'
    /** 部署状态 */
    deployStatus?: 'LOADING' | 'LOADED' | 'ERROR'
    /** 原始目录状态 */
    originalDirStatus?: 'LOADING' | 'LOADED' | 'ERROR'
  }

  type AppUpdateAdminReqVo = {
    /** 应用ID */
    id: string
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
    id: string
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

  type BaseResponseAppStatusResVo = {
    message?: string
    code?: number
    data?: AppStatusResVo
  }

  type BaseResponseLong = {
    message?: string
    code?: number
    data?: string
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

  type ChatInfoResVo = {
    /** 对话 id */
    id?: string
    /** 对话内容 */
    message?: string
    /** 对话类型 */
    messageType?: string
    /** 应用 id */
    appId?: string
    /** 用户 id */
    userId?: string
    /** 创建时间 */
    createTime?: string
  }

  type ChatQueryReqVo = {
    /** 页码，从 1 开始 */
    pageNo: number
    /** 每页条数，最大值为 100 */
    pageSize: number
    /** 排序方式 */
    orderBy?: string
    /** 对话 id */
    id?: string
    /** 应用ID */
    appId: string
    /** 用户 id */
    userId?: string
    /** 消息类型 */
    messageType?: string
    /** 创建时间 */
    startTime?: string
    /** 结束时间 */
    endTime?: string
  }

  type deleteUsingDELETEParams = {
    id: string
  }

  type doDeployParams = {
    appId: string
  }

  type doPreviewParams = {
    appId: string
    reBuild: boolean
  }

  type generateCodeParams = {
    message: string
    appId: string
  }

  type getInfoParams = {
    id: string
  }

  type getListParams = {
    queryReqVo: AppQueryReqVo
  }

  type getStatusParams = {
    appId: string
  }

  type getUserInfoByIdParams = {
    id: string
  }

  type list1Params = {
    reqVo: ChatQueryReqVo
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

  type PageResponseChatInfoResVo = {
    message?: string
    code?: number
    data?: PageResVoChatInfoResVo
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
    totalRow?: string
    list?: AppInfoAdminResVo[]
    totalPage?: string
  }

  type PageResVoAppInfoCommonResVo = {
    totalRow?: string
    list?: AppInfoCommonResVo[]
    totalPage?: string
  }

  type PageResVoChatInfoResVo = {
    totalRow?: string
    list?: ChatInfoResVo[]
    totalPage?: string
  }

  type PageResVoString = {
    totalRow?: string
    list?: string[]
    totalPage?: string
  }

  type PageResVoUserAddResVo = {
    totalRow?: string
    list?: UserAddResVo[]
    totalPage?: string
  }

  type PageResVoUserInfoAdminResVo = {
    totalRow?: string
    list?: UserInfoAdminResVo[]
    totalPage?: string
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
    id?: string
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
    id?: string
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
    id?: string
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
    id: string
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
