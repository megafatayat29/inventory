type SidebarProps = {
  role?: 'super_admin' | 'warehouse_admin'
}

export function getRoleLabel(role?: SidebarProps['role']) {
  if (role === 'super_admin') return 'Super Admin'
  if (role === 'warehouse_admin') return 'Warehouse Admin'
  return 'Loading Role...'
}
