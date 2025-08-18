import type { MenuPermissionChecker } from '../config/menu'

export const checkMenuPermission: MenuPermissionChecker = (menuItem, userRole) => {
  if (!menuItem.roles) {
    return true
  }
  return menuItem.roles.includes(userRole)
}
