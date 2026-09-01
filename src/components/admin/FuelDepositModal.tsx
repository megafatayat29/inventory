import { useEffect, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { X, Save, Fuel as FuelIcon, User, FileText } from 'lucide-react'
import Swal from 'sweetalert2'
import { createFuelDeposit, updateFuelDeposit } from '../../services/fuelService'
import {
  uploadInventoryPhoto,
  uploadInventoryDocument,
} from '../../services/photoService'
import PhotoCapturePicker from '../common/PhotoCapturePicker'
import type { CreateFuelDepositInput, FuelDeposit } from '../../dto/fuel.dto'

type FuelDepositModalProps = {
  isOpen: boolean
  onClose: () => void
  onSaved: () => void
  /** Kalau diisi, modal jalan dalam mode Edit untuk record ini. Kosongkan untuk mode Tambah. */
  fuel?: FuelDeposit | null
}

type FuelFormFields = Omit<
  CreateFuelDepositInput,
  'photo_path' | 'supporting_document_path' | 'volume'
> & {
  volume: string
}

const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024 // 10MB

function getTodayDate() {
  const today = new Date()
  const yyyy = today.getFullYear()
  const mm = String(today.getMonth() + 1).padStart(2, '0')
  const dd = String(today.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function buildInitialForm(): FuelFormFields {
  return {
    storage_date: getTodayDate(),
    user_unit: '',
    fuel_type: '',
    volume: '',
    depositor_name: '',
    nipp: '',
    jabatan: '',
    unit_kerja: '',
    reason: '',
  }
}

function buildFormFromFuel(fuel: FuelDeposit): FuelFormFields {
  return {
    storage_date: fuel.storage_date,
    user_unit: fuel.user_unit,
    fuel_type: fuel.fuel_type,
    volume: String(fuel.volume),
    depositor_name: fuel.depositor_name,
    nipp: fuel.nipp,
    jabatan: fuel.jabatan,
    unit_kerja: fuel.unit_kerja,
    reason: fuel.reason,
  }
}

export default function FuelDepositModal({
  isOpen,
  onClose,
  onSaved,
  fuel = null,
}: FuelDepositModalProps) {
  const isEdit = Boolean(fuel)

  const [form, setForm] = useState<FuelFormFields>(buildInitialForm)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [docFile, setDocFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    setForm(fuel ? buildFormFromFuel(fuel) : buildInitialForm())
    setPhotoFile(null)
    setDocFile(null)
  }, [isOpen, fuel])

  if (!isOpen) return null

  function handleChange(
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function handleDocChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      Swal.fire({
        icon: 'warning',
        title: 'Format Tidak Didukung',
        text: 'Dokumen pendukung harus berformat PDF.',
        confirmButtonColor: '#f97316',
      })
      e.target.value = ''
      return
    }

    if (file.size > MAX_DOCUMENT_SIZE) {
      Swal.fire({
        icon: 'warning',
        title: 'Ukuran File Terlalu Besar',
        text: 'Ukuran dokumen maksimal 10MB.',
        confirmButtonColor: '#f97316',
      })
      e.target.value = ''
      return
    }

    setDocFile(file)
  }

  function resetAndClose() {
    setPhotoFile(null)
    setDocFile(null)
    onClose()
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!isEdit && !photoFile) {
      Swal.fire({
        icon: 'warning',
        title: 'Foto belum diupload',
        text: 'Silakan upload atau ambil foto penitipan BBM/Pelumas terlebih dahulu.',
        confirmButtonText: 'Oke',
        confirmButtonColor: '#f97316',
      })
      return
    }

    const volumeNumber = Number(form.volume)
    if (!form.volume || Number.isNaN(volumeNumber) || volumeNumber <= 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Volume Tidak Valid',
        text: 'Masukkan volume lebih besar dari 0.',
        confirmButtonText: 'Oke',
        confirmButtonColor: '#f97316',
      })
      return
    }

    setIsSubmitting(true)

    try {
      let photoPath = fuel?.photo_path ?? null
      if (photoFile) {
        photoPath = await uploadInventoryPhoto(photoFile, 'fuel-deposit')
      }

      let documentPath = fuel?.supporting_document_path ?? null
      if (docFile) {
        documentPath = await uploadInventoryDocument(docFile, 'fuel-deposit')
      }

      const payload: CreateFuelDepositInput = {
        storage_date: form.storage_date,
        user_unit: form.user_unit,
        fuel_type: form.fuel_type,
        volume: volumeNumber,
        depositor_name: form.depositor_name,
        nipp: form.nipp,
        jabatan: form.jabatan,
        unit_kerja: form.unit_kerja,
        reason: form.reason,
        photo_path: photoPath,
        supporting_document_path: documentPath,
      }

      if (isEdit && fuel) {
        await updateFuelDeposit(fuel.id, payload)
      } else {
        await createFuelDeposit(payload)
      }

      await Swal.fire({
        icon: 'success',
        title: isEdit ? 'Perubahan Disimpan' : 'BBM/Pelumas Tercatat',
        text: isEdit
          ? 'Data BBM/Pelumas berhasil diperbarui.'
          : 'Data BBM/Pelumas berhasil ditambahkan.',
        confirmButtonText: 'OK',
        confirmButtonColor: '#1e3a8a',
      })

      onSaved()
      resetAndClose()
    } catch (error: any) {
      console.error(error)

      const message =
        error?.message ?? 'Terjadi kesalahan saat menyimpan data BBM/Pelumas.'

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
            <FuelIcon className="w-5 h-5" />
            <h2 className="text-lg font-bold">
              {isEdit ? 'Edit BBM/Pelumas' : 'Tambah Penyimpanan BBM'}
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

          {/* Detail BBM/Pelumas */}
          <div>
            <h3 className="text-base font-semibold text-gray-900 border-b-2 border-gray-200 pb-2 mb-4 flex items-center gap-2">
              <FuelIcon className="w-5 h-5 text-[#1e3a8a]" />
              Detail BBM/Pelumas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unit Pengguna <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="user_unit"
                  value={form.user_unit}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#1e3a8a] focus:border-[#1e3a8a] transition-colors"
                  placeholder="Contoh: Railway System"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jenis BBM <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="fuel_type"
                  value={form.fuel_type}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#1e3a8a] focus:border-[#1e3a8a] transition-colors"
                  placeholder="Contoh: Solar, Pertamax"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Volume (Liter) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="volume"
                  value={form.volume}
                  onChange={handleChange}
                  required
                  min="0.01"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#1e3a8a] focus:border-[#1e3a8a] transition-colors"
                  placeholder="Contoh: 50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Penyimpanan <span className="text-red-500">*</span>
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
                  placeholder="Jelaskan alasan penitipan BBM/Pelumas ini"
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
                : 'Upload atau ambil foto kondisi BBM/Pelumas saat dititipkan.'}
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

          {/* Dokumen Pendukung */}
          <div>
            <h3 className="text-base font-semibold text-gray-900 border-b-2 border-gray-200 pb-2 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#1e3a8a]" />
              Dokumen Pendukung
            </h3>
            <p className="text-slate-500 mb-4 text-sm">
              Upload dokumen pendukung dalam format PDF (opsional, maksimal 10MB).
              {isEdit && ' Dokumen lama tetap dipakai kalau tidak diganti.'}
            </p>

            <label
              htmlFor="fuel-supporting-document"
              className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-blue-300 rounded-lg p-8 cursor-pointer hover:bg-blue-50 transition-colors"
            >
              <FileText className="w-10 h-10 text-blue-800" />
              <span className="font-semibold text-slate-800">
                {docFile ? docFile.name : 'Pilih File PDF'}
              </span>
              <span className="text-sm text-slate-500">
                {docFile
                  ? `${(docFile.size / (1024 * 1024)).toFixed(2)} MB`
                  : 'Klik untuk pilih dokumen dari perangkat'}
              </span>
              <input
                id="fuel-supporting-document"
                type="file"
                accept="application/pdf"
                onChange={handleDocChange}
                className="hidden"
              />
            </label>
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
