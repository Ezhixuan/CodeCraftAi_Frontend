import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    // 新的统一认证页面
    {
      path: '/auth',
      redirect: '/auth/login',
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
  ],
})

export default router
