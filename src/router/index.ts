import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
    },
    // 代码生成和预览页面
    {
      path: '/App/code-message',
      name: 'code-message',
      component: () => import('@/views/app/AppChatView.vue'),
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
      component: () => import('@/views/user/UserInfoView.vue'),
      meta: {
        requiresAuth: true,
      },
    },
    // 管理员用户管理页面
    {
      path: '/admin/users',
      name: 'admin-users',
      component: () => import('@/views/user/admin/UserInfoManagementView.vue'),
      meta: {
        requiresAuth: true,
        requiresAdmin: true,
      },
    },
    // 管理员应用管理页面
    {
      path: '/admin/apps',
      name: 'admin-apps',
      component: () => import('@/views/app/admin/info/AppInfoManagementView.vue'),
      meta: {
        requiresAuth: true,
        requiresAdmin: true,
      },
    },
    // 管理员对话历史管理页面
    {
      path: '/admin/chat-history',
      name: 'admin-chat-history',
      component: () => import('@/views/app/admin/chat/AppChatManagementView.vue'),
      meta: {
        requiresAuth: true,
        requiresAdmin: true,
      },
    },
  ],
})

export default router
