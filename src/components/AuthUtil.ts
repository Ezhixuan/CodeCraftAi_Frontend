import type { MenuPermissionChecker } from './menu'

export const checkMenuPermission: MenuPermissionChecker = (menuItem, userRole) => {
  if (!menuItem.roles) {
    return true
  }
  return menuItem.roles.includes(userRole)
}
