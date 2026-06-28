import { Outlet, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { LogOut, Menu } from 'lucide-react'
import Sidebar from './Sidebar'
import { supabase } from '../../lib/supabase'
import { getMyProfile } from '../../services/authService'
import type { Profile } from '../../dto/user.dto'

export default function AdminLayout() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    async function fetchProfile() {
      const data = await getMyProfile()
      setProfile(data)
    }

    fetchProfile()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-slate-100 flex overflow-x-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block shrink-0">
        <Sidebar role={profile?.role} />
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <button
          type="button"
          aria-label="Tutup sidebar"
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <div
        className={[
          'fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out lg:hidden',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        <Sidebar
          role={profile?.role}
          onClose={() => setIsSidebarOpen(false)}
          isMobile
        />
      </div>

      <main className="flex-1 min-w-0 min-h-screen overflow-x-hidden">
        <header className="sticky top-0 z-30 min-h-16 bg-white border-b border-slate-200 flex items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200"
              aria-label="Buka menu"
            >
              <Menu size={22} />
            </button>

            <div className="min-w-0">
              <h1 className="text-base sm:text-xl font-bold text-slate-800 truncate">
                Dashboard Admin Warehouse
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 truncate">
                Rakfat SIGAPQ Inventory System
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="shrink-0 flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
          >
            <LogOut size={18} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </header>

        <section className="p-4 sm:p-6 max-w-full overflow-x-hidden">
          <Outlet />
        </section>
      </main>
    </div>
  )
}