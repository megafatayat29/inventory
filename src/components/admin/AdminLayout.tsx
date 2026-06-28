import { Outlet, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Sidebar from './Sidebar'
import { supabase } from '../../lib/supabase'
import { LogOut } from 'lucide-react'
import { getMyProfile } from '../../services/authService'
import type { Profile } from '../../dto/user.dto'

export default function AdminLayout() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState<Profile | null>(null)

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
      <Sidebar role={profile?.role} />

      <main className="flex-1 min-w-0 min-h-screen overflow-x-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
          <div>
            <h1 className="text-xl font-bold text-slate-800">
              Dashboard Admin Warehouse
            </h1>
            <p className="text-sm text-slate-500">
              Rakfat SIGAPQ Inventory System
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
          >
            <LogOut size={18} />
            Logout
          </button>
        </header>

        <section className="p-6">
          <Outlet />
        </section>
      </main>
    </div>
  )
}