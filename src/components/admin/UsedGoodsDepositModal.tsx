import { useEffect, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { X, Save, Boxes, User, FileText } from 'lucide-react'
import Swal from 'sweetalert2'
import {
  createUsedGoodsDeposit,
  updateUsedGoodsDeposit,
} from '../../services/usedGoodsService'
import { uploadInventoryPhoto } from '../../services/photoService'
import PhotoCapturePicker from '../common/PhotoCapturePicker'
import type {
  CreateUsedGoodsDepositInput,
  UsedGoodsDeposit,
} from '../../dto/usedGoods.dto'

type UsedGoodsDepositModalProps = {
  isOpen: boolean
  onClose: () => void
  onSaved: () => void
  /** Kalau diisi, modal jalan dalam mode Edit untuk record ini. Kosongkan untuk mode Tambah. */
  usedGoods?: UsedGoodsDeposit | null
}

type UsedGoodsFormFields = Omit<CreateUsedGoodsDepositInput, 'photo_path'>

function getTodayDate() {
  const today = new Date()
  const yyyy = today.getFullYear()
  const mm = String(today.getMonth() + 1).padStart(2, '0')
  const dd = String(today.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function buildInitialForm(): UsedGoodsFormFields {
  return {
    entry_date: getTodayDate(),
    producing_unit: '',
    depositor_name: '',
    nipp: '',
    jabatan: '',
    unit_kerja: '',
    reason: '',
  }
}

function buildFormFromUsedGoods(item: UsedGoodsDeposit): UsedGoodsFormFields {
  return {
    entry_date: item.entry_date,
    producing_unit: item.producing_unit,
    depositor_name: item.depositor_name,
    nipp: item.nipp,
    jabatan: item.jabatan,
    unit_kerja: item.unit_kerja,
    reason: item.reason,
  }
}

export default function UsedGoodsDepositModal({
  isOpen,
  onClose,
  onSaved,
  usedGoods = null,
}: UsedGoodsDepositModalProps) {
  const isEdit = Boolean(usedGoods)

  const [form, setForm] = useState<UsedGoodsFormFields>(buildInitialForm)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    setForm(usedGoods ? buildFormFromUsedGoods(usedGoods) : buildInitialForm())
    setPhotoFile(null)
  }, [isOpen, usedGoods])

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
        text: 'Silakan upload atau ambil foto penitipan barang bekas terlebih dahulu.',
        confirmButtonText: 'Oke',
        confirmButtonColor: '#f97316',
      })
      return
    }

    setIsSubmitting(true)

    try {
      let photoPath = usedGoods?.photo_path ?? null
      if (photoFile) {
        photoPath = await uploadInventoryPhoto(photoFile, 'used-goods-deposit')
      }

      if (isEdit && usedGoods) {
        await updateUsedGoodsDeposit(usedGoods.id, {
          ...form,
          photo_path: photoPath,
        })
      } else {
        await createUsedGoodsDeposit({ ...form, photo_path: photoPath })
      }

      await Swal.fire({
        icon: 'success',
        title: isEdit ? 'Perubahan Disimpan' : 'Barang Bekas Tercatat',
        text: isEdit
          ? 'Data barang bekas berhasil diperbarui.'
          : 'Data barang bekas berhasil ditambahkan.',
        confirmButtonText: 'OK',
        confirmButtonColor: '#1e3a8a',
      })

      onSaved()
      resetAndClose()
    } catch (error: any) {
      console.error(error)

      const message =
        error?.message ?? 'Terjadi kesalahan saat menyimpan data barang bekas.'

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
            <Boxes className="w-5 h-5" />
            <h2 className="text-lg font-bold">
              {isEdit ? 'Edit Barang Bekas' : 'Tambah Penyimpanan Barang Bekas'}
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

          {/* Detail Barang Bekas */}
          <div>
            <h3 className="text-base font-semibold text-gray-900 border-b-2 border-gray-200 pb-2 mb-4 flex items-center gap-2">
              <Boxes className="w-5 h-5 text-[#1e3a8a]" />
              Detail Barang Bekas
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
                  Tanggal Masuk <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="entry_date"
                  value={form.entry_date}
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
                  placeholder="Jelaskan alasan penitipan barang bekas ini"
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
                : 'Upload atau ambil foto kondisi barang bekas saat dititipkan.'}
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
