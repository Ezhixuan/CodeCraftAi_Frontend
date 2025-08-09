import { message } from 'ant-design-vue'
import router from './router'
import { useLoginUserStore } from './stores/loginUser'

let firstLoading = true

router.beforeEach(async (to, from, next) => {
  const toUrl = to.fullPath
  console.log('firstLoading', firstLoading)
  console.log('toUrl', toUrl, to)
  if (toUrl.startsWith('/admin')) {
    const loginUserStore = useLoginUserStore()
    if (firstLoading) {
      await loginUserStore.fetchLoginUserInfo()
      firstLoading = false
    }
    const userInfo = loginUserStore.loginUser
    if (userInfo.role != 'ADMIN') {
      message.error('没有权限')
      console.log('toUrl', toUrl, to)
      next(`/login?redirect=${toUrl}`)
      return
    }
  }
  next()
})
