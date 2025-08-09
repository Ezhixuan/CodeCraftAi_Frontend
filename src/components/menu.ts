// 菜单项类型定义
export interface MenuItem {
  /** 菜单唯一标识 */
  key: string
  /** 菜单显示名称 */
  label: string
  /** 菜单标题 */
  title: string
  /** 路由路径 */
  path: string | '/'
  /** 菜单图标 */
  icon?: string
  /** 是否禁用 */
  disabled?: boolean
  /** 子菜单 */
  children?: MenuItem[]
  /** 权限角色列表，为空表示所有用户都可访问 */
  roles?: UserRole[]
  /** 是否在菜单中隐藏 */
  hidden?: boolean
  /** 排序权重，数字越小越靠前 */
  order?: number
  /** 菜单类型 */
  type?: 'menu' | 'button' | 'link'
  /** 外部链接地址 */
  url?: string
  /** 是否在新窗口打开 */
  target?: '_blank' | '_self'
}

// 用户角色枚举
export type UserRole = 'USER' | 'ADMIN' | 'GUEST'

// 菜单配置接口
export interface MenuConfig {
  /** 菜单列表 */
  menus: MenuItem[]
  /** 默认选中的菜单 */
  defaultSelectedKeys?: string[]
  /** 默认展开的菜单 */
  defaultOpenKeys?: string[]
}

// 菜单权限检查函数类型
export type MenuPermissionChecker = (menuItem: MenuItem, userRole: UserRole) => boolean
