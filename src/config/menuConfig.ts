import type { MenuItem } from '@/config/menu'
import router from '@/router'

/**
 * 全局导航菜单配置
 * 支持基于角色的权限控制
 */
export const menuConfig: MenuItem[] = [
  {
    key: '/',
    label: '首页',
    title: '首页',
    path: '/',
    order: 1,
  },
  {
    key: '/about',
    label: '关于',
    title: '关于',
    path: '/about',
    order: 2,
  },
  {
    key: '/features',
    label: '功能',
    title: '功能',
    path: '/features',
    order: 3,
  },
  {
    key: '/contact',
    label: '联系我们',
    title: '联系我们',
    path: '/contact',
    order: 4,
  },
  {
    key: '/admin',
    label: '管理员',
    title: '管理员',
    path: '/admin',
    roles: ['ADMIN'], // 仅管理员可见
    order: 5,
    children: [
      {
        key: '/admin/users',
        label: '用户管理',
        title: '用户管理',
        path: '/admin/users',
        roles: ['ADMIN'], // 仅管理员可见
        order: 1,
      },
      {
        key: '/admin/apps',
        label: '应用管理',
        title: '应用管理',
        path: '/admin/apps',
        roles: ['ADMIN'], // 仅管理员可见
        order: 2,
      },
      {
        key: '/admin/chat-history',
        label: '对话历史管理',
        title: '对话历史管理',
        path: '/admin/chat-history',
        roles: ['ADMIN'], // 仅管理员可见
        order: 3,
      },
    ],
  },
]

/**
 * 获取菜单配置
 * @returns 菜单配置数组
 */
export const getMenuConfig = (): MenuItem[] => {
  return menuConfig.sort((a, b) => (a.order || 0) - (b.order || 0))
}

/**
 * 根据路径获取菜单项
 * @param path 路径
 * @returns 菜单项或undefined
 */
export const getMenuItemByPath = (path: string): MenuItem | undefined => {
  return menuConfig.find((item) => item.path === path)
}

/**
 * 递归查找菜单项（支持子菜单）
 * @param items 菜单项数组
 * @param key 菜单key
 * @returns 菜单项或undefined
 */
const findMenuItemByKey = (items: MenuItem[], key: string): MenuItem | undefined => {
  for (const item of items) {
    if (item.key === key) {
      return item
    }
    if (item.children && item.children.length > 0) {
      const found = findMenuItemByKey(item.children, key)
      if (found) {
        return found
      }
    }
  }
  return undefined
}

/**
 * 根据key获取菜单项（支持子菜单）
 * @param key 菜单key
 * @returns 菜单项或undefined
 */
export const getMenuItemByKey = (key: string): MenuItem | undefined => {
  return findMenuItemByKey(menuConfig, key)
}

/**
 * 跳转菜单
 * @param key 菜单key
 */
export const doJump = (key: string): void => {
  const item = getMenuItemByKey(key)
  if (item) {
    router.push(item.path)
  }
}
