declare namespace API {
  type BaseResponseString = {
    message?: string
    code?: number
    data?: string
  }

  type PageResponseString = {
    message?: string
    code?: number
    data?: string[]
    total?: number
    current?: number
    size?: number
    pages?: number
  }
}
