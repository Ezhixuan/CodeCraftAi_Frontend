import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
    },
    // 代码生成和预览页面
    {
      path: '/app/code-message',
      name: 'CodeMessage',
      component: () => import('@/views/app/CodeMessageView.vue'),
      meta: {
        hideLayout: true,
        keepAlive: false,
      },
    },
    {
      path: '/auth/login',
      name: 'auth-login',
      component: () => import('@/views/user/auth/UserAuthView.vue'),
    },
    {
      path: '/auth/register',
      name: 'auth-register',
      component: () => import('@/views/user/auth/UserAuthView.vue'),
    },
    // 用户个人信息页面
    {
      path: '/user/profile',
      name: 'user-profile',
      component: () => import('@/views/user/UserProfileView.vue'),
      meta: {
        requiresAuth: true,
      },
    },
    // 管理员用户管理页面
    {
      path: '/admin/users',
      name: 'admin-users',
      component: () => import('@/views/user/admin/UserManagerView.vue'),
      meta: {
        requiresAuth: true,
        requiresAdmin: true,
      },
    },
    // 管理员应用管理页面
    {
      path: '/admin/apps',
      name: 'admin-apps',
      component: () => import('@/views/app/admin/AppManagerView.vue'),
      meta: {
        requiresAuth: true,
        requiresAdmin: true,
      },
    },
    // 管理员聊天记录管理页面
    {
      path: '/admin/chat-history',
      name: 'admin-chat-history',
      component: () => import('@/views/chat/admin/ChatHistoryManagerView.vue'),
      meta: {
        requiresAuth: true,
        requiresAdmin: true,
      },
    },
    // 按钮样式测试页面
    {
      path: '/test/button-styles',
      name: 'button-style-test',
      component: () => import('@/views/ButtonStyleTest.vue'),
    },
  ],
})

export default router
