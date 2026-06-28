export type UserRole = 'super_admin' | 'warehouse_admin'

export type Profile = {
  id: string
  name: string
  role: UserRole
  is_active: boolean
}

export type AdminProfile = {
  id: string
  name: string
  role: 'super_admin' | 'warehouse_admin'
  is_active: boolean
  created_at: string
}
