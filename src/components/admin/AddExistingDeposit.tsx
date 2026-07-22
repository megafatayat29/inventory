import { useEffect, useState } from 'react'
import Swal from 'sweetalert2'
import { Plus, Trash2, Save, Package, User, Camera } from 'lucide-react'
import { createExistingDeposit } from '../../services/depositService'
import { getEmptyRackLocations } from '../../services/rackService'
import { uploadInventoryPhoto } from '../../services/photoService'
import { formatRackLocation } from '../../utils/formatRackLocation'
import PhotoCapturePicker from '../common/PhotoCapturePicker'
import { supabase } from '../../lib/supabase'

type ExistingItem = {
  id: number
  item_name: string
  quantity: string
  procurement_unit: string
  category: string
}

type RackLocation = {
  id: string
  rack_code: string
  section: 'FULL' | 'LEFT' | 'RIGHT'
  slot_size: 'S'
  display_col_no: number
  medium_col_start: number
  medium_col_span: number
  level_no: number
  row_no: number
  status: string
}

const createEmptyItem = (): ExistingItem => ({
  id: Date.now() + Math.random(),
  item_name: '',
  quantity: '',
  procurement_unit: '',
  category: '',
})

export default function AddExistingDeposit() {
  const getTodayDate = () => {
    const today = new Date()
    const yyyy = today.getFullYear()
    const mm = String(today.getMonth() + 1).padStart(2, '0')
    const dd = String(today.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  }

  const [depositorName, setDepositorName] = useState('')
  const [nipp, setNipp] = useState('')
  const [jabatan, setJabatan] = useState('')
  const [unitKerja, setUnitKerja] = useState('')
  const [entryDate, setEntryDate] = useState('')
  const [rackLocationId, setRackLocationId] = useState('')
  const [items, setItems] = useState<ExistingItem[]>([createEmptyItem()])
  const [locations, setLocations] = useState<RackLocation[]>([])
  const [initialPhotoFile, setInitialPhotoFile] = useState<File | null>(null)
  const [placementPhotoFile, setPlacementPhotoFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchLocations()
  }, [])

  useEffect(() => {
    async function debugCurrentUser() {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()

      if (error) {
        console.error('GET USER ERROR:', error)
        return
      }

      console.log('CURRENT AUTH USER:', {
        id: user?.id,
        email: user?.email,
      })

      const { data: profile, error: profileError } = await supabase.rpc(
        'debug_my_profile'
      )

      console.log('DEBUG PROFILE:', profile, profileError)
    }

    debugCurrentUser()
  }, [])

  async function fetchLocations() {
    try {
      const data = await getEmptyRackLocations()
      setLocations((data ?? []) as RackLocation[])
    } catch (error) {
      console.error(error)
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: 'Gagal mengambil lokasi rak kosong.',
        confirmButtonColor: '#ef4444',
      })
    }
  }

  function handleAddItem() {
    setItems((prev) => [...prev, createEmptyItem()])
  }

  function handleRemoveItem(id: number) {
    if (items.length === 1) {
      Swal.fire({
        icon: 'warning',
        title: 'Tambahkan barang!',
        text: 'Minimal harus ada satu barang existing.',
        confirmButtonColor: '#f97316',
      })
      return
    }

    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  function updateItem(id: number, patch: Partial<ExistingItem>) {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              ...patch,
            }
          : item
      )
    )
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!depositorName || !nipp || !jabatan || !unitKerja || !entryDate) {
      Swal.fire({
        icon: 'warning',
        title: 'Data belum lengkap',
        text: 'Lengkapi identitas barang existing dan tanggal masuk lampau.',
        confirmButtonColor: '#f97316',
      })
      return
    }

    if (!rackLocationId) {
      Swal.fire({
        icon: 'warning',
        title: 'Lokasi rak belum dipilih',
        text: 'Pilih lokasi rak kosong untuk barang existing.',
        confirmButtonColor: '#f97316',
      })
      return
    }

    if (!placementPhotoFile) {
      Swal.fire({
        icon: 'warning',
        title: 'Foto aktual belum diupload',
        text: 'Upload foto kondisi aktual barang di rak.',
        confirmButtonColor: '#f97316',
      })
      return
    }

    const validItems = items.filter(
      (item) =>
        item.item_name.trim() &&
        Number(item.quantity) > 0 &&
        item.procurement_unit.trim()
    )

    if (validItems.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Barang belum diisi',
        text: 'Minimal isi satu barang existing dengan nama, jumlah, dan unit pengadaan.',
        confirmButtonColor: '#f97316',
      })
      return
    }

    try {
      setIsSubmitting(true)

      let initialPhotoPath = ''
      if (initialPhotoFile) {
        initialPhotoPath = await uploadInventoryPhoto(
          initialPhotoFile,
          'existing-initial'
        )
      }

      const placementPhotoPath = await uploadInventoryPhoto(
        placementPhotoFile,
        'existing-placement'
      )

      await createExistingDeposit({
        depositor_name: depositorName,
        nipp,
        jabatan,
        unit_kerja: unitKerja,
        initial_photo_path: initialPhotoPath,
        placement_photo_path: placementPhotoPath,
        rack_location_id: rackLocationId,
        entry_date: entryDate,
        items: validItems.map((item) => ({
          item_name: item.item_name,
          quantity: Number(item.quantity),
          procurement_unit: item.procurement_unit,
          category: item.category || null,
        })),
      })

      await Swal.fire({
        icon: 'success',
        title: 'Barang Existing Berhasil Ditambahkan',
        html: `
          <div style="text-align:center">
            <p>Barang existing berhasil dimasukkan ke data gudang.</p>
            <small>Status langsung tersimpan dan rak langsung terisi.</small>
          </div>
        `,
        confirmButtonColor: '#1e3a8a',
      })

      setDepositorName('')
      setNipp('')
      setJabatan('')
      setUnitKerja('')
      setEntryDate('')
      setRackLocationId('')
      setItems([createEmptyItem()])
      setInitialPhotoFile(null)
      setPlacementPhotoFile(null)
      fetchLocations()
    } catch (error: any) {
      console.error(error)

      const message =
        error?.message ?? 'Terjadi kesalahan saat menyimpan barang existing.'

      Swal.fire({
        icon: 'error',
        title: 'Penyimpanan Gagal',
        text: message,
        confirmButtonColor: '#dc2626',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8 font-sans text-gray-800">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden border-t-8 border-orange-500">
        <div className="bg-[#1e3a8a] px-6 py-5 text-white flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Tambah Barang Existing</h1>
            <p className="text-blue-100 text-sm mt-1">
              Input barang yang sudah ada di gudang dari tanggal lampau
            </p>
          </div>
          <Package className="w-10 h-10 text-orange-400" />
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8">
          <div className="mb-10">
            <h2 className="text-lg font-semibold text-gray-900 border-b-2 border-gray-200 pb-2 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-[#1e3a8a]" />
              Identitas Penitip / Sumber Barang
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputField
                label="Nama"
                required
                value={depositorName}
                onChange={setDepositorName}
                placeholder="Masukkan nama penitip / sumber barang"
              />

              <InputField
                label="NIPP"
                required
                value={nipp}
                onChange={setNipp}
                placeholder="Nomor Induk Pegawai"
              />

              <InputField
                label="Jabatan"
                required
                value={jabatan}
                onChange={setJabatan}
                placeholder="Jabatan"
              />

              <InputField
                label="Unit Kerja"
                required
                value={unitKerja}
                onChange={setUnitKerja}
                placeholder="Contoh: Railway System"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Masuk Lampau <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={entryDate}
                  onChange={(event) => setEntryDate(event.target.value)}
                  max={getTodayDate()}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#1e3a8a] focus:border-[#1e3a8a]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lokasi Rak <span className="text-red-500">*</span>
                </label>
                <select
                  value={rackLocationId}
                  onChange={(event) => setRackLocationId(event.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#1e3a8a] focus:border-[#1e3a8a] bg-white"
                >
                  <option value="">-- Pilih Lokasi Rak Kosong --</option>
                  {locations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {formatRackLocation(location)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="mb-10">
            <div className="flex justify-between items-center border-b-2 border-gray-200 pb-2 mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-[#1e3a8a]" />
                Daftar Barang Existing
              </h2>
            </div>

            <div className="space-y-6">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className="bg-gray-50 p-5 rounded-lg border border-gray-200 relative group"
                >
                  <div className="absolute top-4 right-4">
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors bg-white p-1 rounded-md shadow-sm border border-gray-200"
                        title="Hapus Barang"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="mb-4">
                    <span className="inline-block bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded font-semibold tracking-wide">
                      Barang #{index + 1}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="lg:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nama Barang <span className="text-red-500">*</span>
                      </label>
                      <input
                        value={item.item_name}
                        onChange={(event) =>
                          updateItem(item.id, { item_name: event.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#1e3a8a] focus:border-[#1e3a8a]"
                        placeholder="Nama barang"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Jumlah <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(event) =>
                          updateItem(item.id, { quantity: event.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#1e3a8a] focus:border-[#1e3a8a]"
                        placeholder="Kuantitas"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Unit Pengadaan <span className="text-red-500">*</span>
                      </label>
                      <input
                        value={item.procurement_unit}
                        onChange={(event) =>
                          updateItem(item.id, {
                            procurement_unit: event.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#1e3a8a] focus:border-[#1e3a8a]"
                        placeholder="Asal unit/divisi"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Kategori Barang
                      </label>
                      <select
                        value={item.category}
                        onChange={(event) =>
                          updateItem(item.id, { category: event.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#1e3a8a] focus:border-[#1e3a8a] bg-white"
                      >
                        <option value="">-- Pilih Kategori --</option>
                        <option value="Gampang Pecah">
                          Gampang Pecah (Fragile)
                        </option>
                        <option value="Tidak boleh panas">
                          Tidak boleh panas (Cool)
                        </option>
                        <option value="Normal">Normal / Standar</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAddItem}
              className="mt-4 flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#1e3a8a] bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100"
            >
              <Plus className="w-4 h-4" />
              Tambah Barang Lain
            </button>
          </div>

          <div className="mb-10">
            <h2 className="text-lg font-semibold text-gray-900 border-b-2 border-gray-200 pb-2 mb-4 flex items-center gap-2">
              <Camera className="w-5 h-5 text-[#1e3a8a]" />
              Dokumentasi Barang Existing
            </h2>

            <div className="space-y-8">
              <div>
                <h3 className="text-base font-bold text-slate-800 mb-2">
                  Foto Awal / Dokumen Lama
                  <span className="text-slate-400 font-normal"> (opsional)</span>
                </h3>
                <p className="text-slate-500 mb-4">
                  Upload jika tersedia. Boleh dikosongkan untuk barang lampau.
                </p>

                <PhotoCapturePicker
                  file={initialPhotoFile}
                  onChange={setInitialPhotoFile}
                />
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-800 mb-2">
                  Foto Aktual Barang di Rak <span className="text-red-500">*</span>
                </h3>
                <p className="text-slate-500 mb-4">
                  Wajib upload foto kondisi barang saat ini di lokasi rak yang dipilih.
                </p>

                <PhotoCapturePicker
                  file={placementPhotoFile}
                  onChange={setPlacementPhotoFile}
                  required
                />

                {!placementPhotoFile && (
                  <p className="text-sm text-orange-600 mt-2">
                    * Foto aktual barang di rak wajib diupload sebelum submit.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-10 pt-5 border-t border-gray-200 flex items-center justify-between">
            <button
              type="submit"
              disabled={isSubmitting}
              className="ml-auto flex items-center gap-2 px-6 py-3 bg-[#1e3a8a] text-white font-semibold rounded-md hover:bg-blue-800 shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              {isSubmitting ? 'Menyimpan...' : 'Simpan Barang Existing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  required?: boolean
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#1e3a8a] focus:border-[#1e3a8a] transition-colors"
        placeholder={placeholder}
      />
    </div>
  )
}