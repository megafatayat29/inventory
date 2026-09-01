import { useEffect, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { X, Save, Recycle, User, FileText } from 'lucide-react'
import Swal from 'sweetalert2'
import { createWasteDeposit, updateWasteDeposit } from '../../services/wasteService'
import { uploadInventoryPhoto } from '../../services/photoService'
import PhotoCapturePicker from '../common/PhotoCapturePicker'
import type { CreateWasteDepositInput, WasteDeposit } from '../../dto/waste.dto'

type WasteDepositModalProps = {
  isOpen: boolean
  onClose: () => void
  onSaved: () => void
  /** Kalau diisi, modal jalan dalam mode Edit untuk record ini. Kosongkan untuk mode Tambah. */
  waste?: WasteDeposit | null
}

type WasteFormFields = Omit<CreateWasteDepositInput, 'photo_path'>

function getTodayDate() {
  const today = new Date()
  const yyyy = today.getFullYear()
  const mm = String(today.getMonth() + 1).padStart(2, '0')
  const dd = String(today.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function buildInitialForm(): WasteFormFields {
  return {
    storage_date: getTodayDate(),
    producing_unit: '',
    waste_type: '',
    depositor_name: '',
    nipp: '',
    jabatan: '',
    unit_kerja: '',
    reason: '',
  }
}

function buildFormFromWaste(waste: WasteDeposit): WasteFormFields {
  return {
    storage_date: waste.storage_date,
    producing_unit: waste.producing_unit,
    waste_type: waste.waste_type,
    depositor_name: waste.depositor_name,
    nipp: waste.nipp,
    jabatan: waste.jabatan,
    unit_kerja: waste.unit_kerja,
    reason: waste.reason,
  }
}

export default function WasteDepositModal({
  isOpen,
  onClose,
  onSaved,
  waste = null,
}: WasteDepositModalProps) {
  const isEdit = Boolean(waste)

  const [form, setForm] = useState<WasteFormFields>(buildInitialForm)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Reset form tiap kali modal dibuka: isi dari record kalau edit, kosong kalau tambah.
  useEffect(() => {
    if (!isOpen) return
    setForm(waste ? buildFormFromWaste(waste) : buildInitialForm())
    setPhotoFile(null)
  }, [isOpen, waste])

  if (!isOpen) return null

  function handleChange(
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function resetAndClose() {
    setPhotoFile(null)
    onClose()
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!isEdit && !photoFile) {
      Swal.fire({
        icon: 'warning',
        title: 'Foto belum diupload',
        text: 'Silakan upload atau ambil foto penitipan limbah terlebih dahulu.',
        confirmButtonText: 'Oke',
        confirmButtonColor: '#f97316',
      })
      return
    }

    setIsSubmitting(true)

    try {
      let photoPath = waste?.photo_path ?? null
      if (photoFile) {
        photoPath = await uploadInventoryPhoto(photoFile, 'waste-deposit')
      }

      if (isEdit && waste) {
        await updateWasteDeposit(waste.id, { ...form, photo_path: photoPath })
      } else {
        await createWasteDeposit({ ...form, photo_path: photoPath })
      }

      await Swal.fire({
        icon: 'success',
        title: isEdit ? 'Perubahan Disimpan' : 'Limbah Tercatat',
        text: isEdit
          ? 'Data limbah berhasil diperbarui.'
          : 'Data limbah berhasil ditambahkan.',
        confirmButtonText: 'OK',
        confirmButtonColor: '#1e3a8a',
      })

      onSaved()
      resetAndClose()
    } catch (error: any) {
      console.error(error)

      const message =
        error?.message ?? 'Terjadi kesalahan saat menyimpan data limbah.'

      await Swal.fire({
        icon: 'error',
        title: 'Gagal Menyimpan',
        text: message,
        confirmButtonText: 'Tutup',
        confirmButtonColor: '#dc2626',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-8 overflow-y-auto">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg overflow-hidden border-t-8 border-orange-500 my-auto">
        <div className="bg-[#1e3a8a] px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Recycle className="w-5 h-5" />
            <h2 className="text-lg font-bold">
              {isEdit ? 'Edit Limbah' : 'Tambah Limbah'}
            </h2>
          </div>
          <button
            type="button"
            onClick={resetAndClose}
            className="text-blue-100 hover:text-white transition-colors"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Identitas Penitip */}
          <div>
            <h3 className="text-base font-semibold text-gray-900 border-b-2 border-gray-200 pb-2 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-[#1e3a8a]" />
              Identitas Penitip
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="depositor_name"
                  value={form.depositor_name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#1e3a8a] focus:border-[#1e3a8a] transition-colors"
                  placeholder="Masukkan Nama Lengkap"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  NIPP <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nipp"
                  value={form.nipp}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#1e3a8a] focus:border-[#1e3a8a] transition-colors"
                  placeholder="Nomor Induk Pegawai"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jabatan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="jabatan"
                  value={form.jabatan}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#1e3a8a] focus:border-[#1e3a8a] transition-colors"
                  placeholder="Jabatan Saat Ini"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unit Kerja <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="unit_kerja"
                  value={form.unit_kerja}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#1e3a8a] focus:border-[#1e3a8a] transition-colors"
                  placeholder="Contoh: Railway System"
                />
              </div>
            </div>
          </div>

          {/* Detail Limbah */}
          <div>
            <h3 className="text-base font-semibold text-gray-900 border-b-2 border-gray-200 pb-2 mb-4 flex items-center gap-2">
              <Recycle className="w-5 h-5 text-[#1e3a8a]" />
              Detail Limbah
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unit Penghasil <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="producing_unit"
                  value={form.producing_unit}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#1e3a8a] focus:border-[#1e3a8a] transition-colors"
                  placeholder="Contoh: Railway System"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jenis Limbah <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="waste_type"
                  value={form.waste_type}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#1e3a8a] focus:border-[#1e3a8a] transition-colors"
                  placeholder="Contoh: Limbah B3, Oli Bekas"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Masuk <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="storage_date"
                  value={form.storage_date}
                  onChange={handleChange}
                  required
                  max={getTodayDate()}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#1e3a8a] focus:border-[#1e3a8a] transition-colors"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alasan Titip <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="reason"
                  value={form.reason}
                  onChange={handleChange}
                  required
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#1e3a8a] focus:border-[#1e3a8a] transition-colors resize-none"
                  placeholder="Jelaskan alasan penitipan limbah ini"
                />
              </div>
            </div>
          </div>

          {/* Foto Penitipan */}
          <div>
            <h3 className="text-base font-semibold text-gray-900 border-b-2 border-gray-200 pb-2 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#1e3a8a]" />
              Foto Penitipan
            </h3>
            <p className="text-slate-500 mb-4 text-sm">
              {isEdit
                ? 'Foto lama tetap dipakai kalau tidak diganti. Upload foto baru di bawah ini untuk menggantinya.'
                : 'Upload atau ambil foto kondisi limbah saat dititipkan.'}
            </p>

            <PhotoCapturePicker
              file={photoFile}
              onChange={setPhotoFile}
              required={!isEdit}
            />
            {!isEdit && !photoFile && (
              <p className="text-sm text-orange-600 mt-2">
                * Foto penitipan wajib diupload sebelum submit.
              </p>
            )}
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-200">
            <button
              type="button"
              onClick={resetAndClose}
              className="px-4 py-2 rounded-md text-sm font-semibold text-gray-600 hover:bg-gray-100 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 bg-[#1e3a8a] text-white font-semibold rounded-md hover:bg-blue-800 shadow-md transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {isSubmitting
                ? 'Menyimpan...'
                : isEdit
                  ? 'Simpan Perubahan'
                  : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
