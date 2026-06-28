import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Inbox,
  Boxes,
  Warehouse,
  QrCode,
  PackageCheck,
  UserCog,
  PlusSquare,
} from 'lucide-react'
import { getRoleLabel } from '../../utils/getRoleLabel'

type SidebarProps = {
  role?: 'super_admin' | 'warehouse_admin'
}

export default function Sidebar({ role }: SidebarProps) {
  const menus = [
    {
      label: 'Dashboard',
      path: '/admin/dashboard',
      icon: LayoutDashboard,
    },
    {
      label: 'Incoming Barang',
      path: '/admin/incoming',
      icon: Inbox,
    },
    {
      label: 'List All Barang',
      path: '/admin/deposits',
      icon: Boxes,
    },
    {
      label: 'Dashboard Rak',
      path: '/admin/racks',
      icon: Warehouse,
    },
    {
      label: 'Cetak QR Rak',
      path: '/admin/print-rack-qr',
      icon: QrCode,
    },
    {
      label: 'Pengambilan Barang',
      path: '/admin/return',
      icon: PackageCheck,
    },
    {
      label: 'QR Form Penitipan',
      path: '/admin/public-form-qr',
      icon: QrCode,
    },
    ...(role === 'super_admin'
      ? [
          {
            label: 'Manage Admin',
            path: '/admin/manage-admins',
            icon: UserCog,
          },
          {
            label: 'Tambah Existing',
            path: '/admin/add-existing',
            icon: PlusSquare,
          },
        ]
      : []),
  ]

  return (
    <aside className="w-72 min-h-screen bg-[#173A8A] text-white">
      <div className="h-24 px-6 flex items-center border-b border-white/10">
        <div>
          <h2 className="text-2xl font-bold">RakFat SIGAPQ</h2>
          <h4>Role login: </h4>
          <span
            className={[
              'inline-flex mt-2 px-3 py-1 rounded-full text-xs font-semibold',
              role === 'super_admin'
                ? 'bg-orange-500 text-white'
                : 'bg-blue-100 text-blue-900',
            ].join(' ')}
          >
            {getRoleLabel(role)}
          </span>
        </div>
      </div>

      <nav className="p-4 space-y-2">
        {menus.map((menu) => {
          const Icon = menu.icon

          return (
            <NavLink
              key={menu.path}
              to={menu.path}
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 px-4 py-3 rounded-xl transition',
                  isActive
                    ? 'bg-orange-500 text-white shadow'
                    : 'text-blue-100 hover:bg-white/10 hover:text-white',
                ].join(' ')
              }
            >
              <Icon size={20} />
              <span className="font-medium">{menu.label}</span>
            </NavLink>
          )
        })}
      </nav>
    </aside>
  )
}