import type { MenuPermissionChecker } from '../config/menu.ts'

export const checkMenuPermission: MenuPermissionChecker = (menuItem, userRole) => {
  if (!menuItem.roles) {
    return true
  }
  return menuItem.roles.includes(userRole)
}
