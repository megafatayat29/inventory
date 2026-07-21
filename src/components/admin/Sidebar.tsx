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
  X,
  Trash2,
  Fuel,
  Recycle,
} from 'lucide-react'
import kaiLogo from '../../assets/kai.png'
import lrtLogo from '../../assets/lrt.png'

type UserRole = 'super_admin' | 'warehouse_admin'

type SidebarProps = {
  role?: UserRole
  onClose?: () => void
  isMobile?: boolean
}

function getRoleLabel(role?: UserRole) {
  if (role === 'super_admin') return 'Super Admin'
  if (role === 'warehouse_admin') return 'Warehouse Admin'
  return 'Loading Role...'
}

export default function Sidebar({ role, onClose, isMobile }: SidebarProps) {
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
      label: 'List Limbah',
      path: '/admin/waste',
      icon: Trash2,
    },
    {
      label: 'List Barang Bekas',
      path: '/admin/used-goods',
      icon: Recycle,
    },
    {
      label: 'List BBM dan Pelumas',
      path: '/admin/fuel',
      icon: Fuel,
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
    <aside className="w-72 shrink-0 min-h-screen h-full bg-[#173A8A] text-white flex flex-col">
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-2xl font-bold leading-tight">
              RakFat SIGAPQ
            </h2>

            <p className="text-sm text-blue-100 mt-2">Role login:</p>

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

          {isMobile && (
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20"
              aria-label="Tutup menu"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {menus.map((menu) => {
          const Icon = menu.icon

          return (
            <NavLink
              key={menu.path}
              to={menu.path}
              onClick={onClose}
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 px-4 py-3 rounded-xl transition',
                  'text-sm font-semibold',
                  isActive
                    ? 'bg-orange-500 text-white shadow'
                    : 'text-blue-100 hover:bg-white/10 hover:text-white',
                ].join(' ')
              }
            >
              <Icon size={20} className="shrink-0" />
              <span className="leading-snug">{menu.label}</span>
            </NavLink>
          )
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <div className="flex items-center justify-center gap-3 bg-white rounded-lg px-3 py-2 mb-3">
          <img src={kaiLogo} alt="Logo KAI" className="h-7 w-auto object-contain" />
          <div className="w-px h-6 bg-gray-300" />
          <img src={lrtLogo} alt="Logo LRT Jabodebek" className="h-7 w-auto object-contain" />
        </div>
        <p className="text-xs text-blue-100 text-center">
          Rakfat SIGAPQ Inventory System
        </p>
      </div>
    </aside>
  )
}