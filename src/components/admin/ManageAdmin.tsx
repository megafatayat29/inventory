import { useEffect, useState } from 'react'
import Swal from 'sweetalert2'
import { RefreshCcw, Shield, UserCog } from 'lucide-react'
import {
  getAdminProfiles,
  updateAdminProfile,
} from '../../services/adminService'
import type { AdminProfile } from '../../dto/user.dto'

export default function ManageAdmins() {
  const [admins, setAdmins] = useState<AdminProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)

  useEffect(() => {
    fetchAdmins()
  }, [])

  async function fetchAdmins() {
    try {
      setLoading(true)
      const data = await getAdminProfiles()
      setAdmins(data)
    } catch (error) {
      console.error(error)
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: 'Gagal mengambil data admin.',
        confirmButtonColor: '#ef4444',
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleSave(admin: AdminProfile) {
    try {
      setSavingId(admin.id)

      await updateAdminProfile({
        id: admin.id,
        name: admin.name,
        is_active: admin.is_active,
      })

      Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: 'Data admin berhasil diperbarui.',
        timer: 1400,
        showConfirmButton: false,
      })

      fetchAdmins()
    } catch (error) {
      console.error(error)
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: 'Data admin gagal diperbarui.',
        confirmButtonColor: '#ef4444',
      })
    } finally {
      setSavingId(null)
    }
  }

  function updateLocalAdmin(id: string, patch: Partial<AdminProfile>) {
    setAdmins((prev) =>
      prev.map((admin) =>
        admin.id === id
          ? {
              ...admin,
              ...patch,
            }
          : admin
      )
    )
  }

  if (loading) {
    return <p className="text-slate-500">Loading admin warehouse...</p>
  }

  const warehouseAdmins = admins.filter((admin) => admin.role === 'warehouse_admin')
  const superAdmins = admins.filter((admin) => admin.role === 'super_admin')

  return (
    <div>
      <div className="mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            Manage Admin Warehouse
          </h2>
          <p className="text-slate-500 mt-1">
            Kelola status aktif dan nama akun admin warehouse.
          </p>
        </div>

        <button
          onClick={fetchAdmins}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
        >
          <RefreshCcw size={18} />
          Refresh
        </button>
      </div>

      <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 mb-5 text-orange-800">
        <p className="font-semibold">Catatan MVP</p>
        <p className="text-sm mt-1">
          Untuk menambah akun baru, buat dulu user di Supabase Authentication.
          Setelah itu insert ke table profiles. UI ini untuk edit nama dan
          aktif/nonaktif akun.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-5">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <Shield className="text-blue-700" />
            <div>
              <p className="text-sm text-slate-500">Super Admin</p>
              <h3 className="text-3xl font-bold text-slate-900">
                {superAdmins.length}
              </h3>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <UserCog className="text-blue-700" />
            <div>
              <p className="text-sm text-slate-500">Admin Warehouse</p>
              <h3 className="text-3xl font-bold text-slate-900">
                {warehouseAdmins.length} / 4
              </h3>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div>
            <p className="text-sm text-slate-500">Admin Aktif</p>
            <h3 className="text-3xl font-bold text-slate-900">
              {admins.filter((admin) => admin.is_active).length}
            </h3>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <th className="text-left px-5 py-4 font-bold uppercase">
                  Nama
                </th>
                <th className="text-left px-5 py-4 font-bold uppercase">
                  Role
                </th>
                <th className="text-left px-5 py-4 font-bold uppercase">
                  Status
                </th>
                <th className="text-right px-5 py-4 font-bold uppercase">
                  Aksi
                </th>
              </tr>
            </thead>

            <tbody>
              {admins.map((admin) => (
                <tr key={admin.id} className="border-b border-slate-100">
                  <td className="px-5 py-4">
                    <input
                      value={admin.name}
                      onChange={(event) =>
                        updateLocalAdmin(admin.id, { name: event.target.value })
                      }
                      className="w-full border border-slate-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={[
                        'px-3 py-1 rounded-full text-xs font-semibold',
                        admin.role === 'super_admin'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-slate-100 text-slate-700',
                      ].join(' ')}
                    >
                      {admin.role === 'super_admin'
                        ? 'Super Admin'
                        : 'Warehouse Admin'}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={admin.is_active}
                        disabled={admin.role === 'super_admin'}
                        onChange={(event) =>
                          updateLocalAdmin(admin.id, {
                            is_active: event.target.checked,
                          })
                        }
                      />
                      <span
                        className={
                          admin.is_active ? 'text-green-700' : 'text-red-600'
                        }
                      >
                        {admin.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </label>
                  </td>

                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => handleSave(admin)}
                      disabled={savingId === admin.id}
                      className="px-4 py-2 rounded-lg bg-orange-500 text-white font-semibold hover:bg-orange-600 disabled:bg-slate-300"
                    >
                      {savingId === admin.id ? 'Menyimpan...' : 'Simpan'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}