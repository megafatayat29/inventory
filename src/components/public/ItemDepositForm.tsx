import React, { useState } from 'react';
import { Plus, Trash2, Save, Package, User, FileText } from 'lucide-react';
import { createDepositRequest } from '../../services/depositService';
import type { DepositUserForm, DepositItemForm } from '../../dto/deposit.dto';
import Swal from "sweetalert2";
import PhotoCapturePicker from '../common/PhotoCapturePicker';
import kaiLogo from '../../assets/kai.png';
import lrtLogo from '../../assets/lrt.png';
import { uploadInventoryPhoto, uploadInventoryDocument } from '../../services/photoService';

export default function ItemDepositForm() {
  // Fungsi untuk mendapatkan tanggal hari ini dalam format YYYY-MM-DD
  const getTodayDate = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  // State untuk Identitas User
  const [user, setUser] = useState<DepositUserForm>({
    nama: '',
    nipp: '',
    jabatan: '',
    unitKerja: ''
  });

  // State untuk Daftar Barang
  const [items, setItems] = useState<DepositItemForm[]>([
    {
      id: Date.now(),
      namaBarang: '',
      unitPengadaan: '',
      jumlah: '',
      kategori: '',
      tanggalMasuk: getTodayDate()
    }
  ]);

  const [initialPhotoFile, setInitialPhotoFile] = useState<File | null>(null)
  const [supportingDocFile, setSupportingDocFile] = useState<File | null>(null)

  const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024 // 10MB

  const handleSupportingDocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    setSupportingDocFile(file)
  }

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handler perubahan input user
  const handleUserChange = (e: { target: { name: any; value: any; }; }) => {
    const { name, value } = e.target;
    setUser(prev => ({ ...prev, [name]: value }));
  };

  // Handler perubahan input barang
  const handleItemChange = (id: number, e: React.ChangeEvent<HTMLInputElement, HTMLInputElement> | React.ChangeEvent<HTMLSelectElement, HTMLSelectElement>) => {
    const { name, value } = e.target;
    setItems(prevItems => 
      prevItems.map(item => 
        item.id === id ? { ...item, [name]: value } : item
      )
    );
  };

  // Tambah baris barang baru
  const handleAddItem = () => {
    setItems(prev => [
      ...prev, 
      {
        id: Date.now(),
        namaBarang: '',
        unitPengadaan: '',
        jumlah: '',
        kategori: '',
        tanggalMasuk: getTodayDate()
      }
    ]);
  };

  // Hapus baris barang
  const handleRemoveItem = (id: number) => {
    if (items.length > 1) {
      setItems(prev => prev.filter(item => item.id !== id));
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Tambahkan barang!',
        text: 'Minimal harus ada satu barang yang dititipkan.',
        confirmButtonText: 'Oke',
        confirmButtonColor: '#f97316',
      })
    }
  };

  // Handler Submit
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!initialPhotoFile) {
        Swal.fire({
          icon: 'warning',
          title: 'Foto awal belum diupload',
          text: 'Silakan upload atau ambil foto kondisi awal barang terlebih dahulu.',
          confirmButtonText: 'Oke',
          confirmButtonColor: '#f97316',
        })
        return
      }

      const initialPhotoPath = await uploadInventoryPhoto(
        initialPhotoFile,
        'deposit-initial'
      )

      let supportingDocumentPath = ''
      if (supportingDocFile) {
        supportingDocumentPath = await uploadInventoryDocument(
          supportingDocFile,
          'deposit-documents'
        )
      }

      await createDepositRequest({
        depositor_name: user.nama,
        nipp: user.nipp,
        jabatan: user.jabatan,
        unit_kerja: user.unitKerja,
        initial_photo_path: initialPhotoPath,
        supporting_document_path: supportingDocumentPath,
        items: items.map((item) => ({
          item_name: item.namaBarang,
          quantity: Number(item.jumlah),
          procurement_unit: item.unitPengadaan,
          category: item.kategori,
          entry_date: item.tanggalMasuk,
        })),
      });

      await Swal.fire({
        icon: "success",
        title: "Penitipan Berhasil",
        html: `
          <div style="text-align:center">
            <p>Data penitipan barang berhasil dikirim.</p>
            <small>Silakan menunggu proses plotting oleh admin gudang.</small>
          </div>
        `,
        confirmButtonText: "OK",
        confirmButtonColor: "#1e3a8a",
      });
      window.location.reload();
    } catch (error: any) {
      console.error(error);

      const message =
        error?.response?.data?.message ??
        error?.message ??
        "Terjadi kesalahan saat mengirim data.";

      await Swal.fire({
        icon: "error",
        title: "Pengiriman Gagal",
        text: message,
        confirmButtonText: "Tutup",
        confirmButtonColor: "#dc2626",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8 font-sans text-gray-800">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden border-t-8 border-orange-500">
        {/* Header */}
        <div className="bg-[#1e3a8a] px-6 py-5 text-white flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold">Form Penitipan Barang</h1>
            <p className="text-blue-100 text-sm mt-1">Gudang Logistik Unit Kerja</p>
          </div>
          <div className="flex items-center gap-3 bg-white rounded-lg px-3 py-2 shadow-sm shrink-0">
            <img src={kaiLogo} alt="Logo KAI" className="h-9 w-auto object-contain" />
            <div className="w-px h-8 bg-gray-300" />
            <img src={lrtLogo} alt="Logo LRT Jabodebek" className="h-9 w-auto object-contain" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8">
          
          {/* Bagian 1: Identitas User */}
          <div className="mb-10">
            <h2 className="text-lg font-semibold text-gray-900 border-b-2 border-gray-200 pb-2 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-[#1e3a8a]" />
              Identitas Penitip
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nama"
                  value={user.nama}
                  onChange={handleUserChange}
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
                  value={user.nipp}
                  onChange={handleUserChange}
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
                  value={user.jabatan}
                  onChange={handleUserChange}
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
                  name="unitKerja"
                  value={user.unitKerja}
                  onChange={handleUserChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#1e3a8a] focus:border-[#1e3a8a] transition-colors"
                  placeholder="Contoh: Railway system"
                />
              </div>
            </div>
          </div>

          {/* Bagian 2: Daftar Barang */}
          <div>
            <div className="flex justify-between items-center border-b-2 border-gray-200 pb-2 mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-[#1e3a8a]" />
                Daftar Barang yang Dititipkan
              </h2>
            </div>

            <div className="space-y-6">
              {items.map((item, index) => (
                <div key={item.id} className="bg-gray-50 p-5 rounded-lg border border-gray-200 relative group">
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

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nama Barang <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="namaBarang"
                        value={item.namaBarang}
                        onChange={(e) => handleItemChange(item.id, e)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#1e3a8a] focus:border-[#1e3a8a]"
                        placeholder="Deskripsi nama barang"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Jumlah <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        name="jumlah"
                        value={item.jumlah}
                        onChange={(e) => handleItemChange(item.id, e)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#1e3a8a] focus:border-[#1e3a8a]"
                        placeholder="Kuantitas"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Unit Pengadaan <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="unitPengadaan"
                        value={item.unitPengadaan}
                        onChange={(e) => handleItemChange(item.id, e)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#1e3a8a] focus:border-[#1e3a8a]"
                        placeholder="Asal unit/divisi"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Kategori Barang
                      </label>
                      <select
                        name="kategori"
                        value={item.kategori}
                        onChange={(e) => handleItemChange(item.id, e)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#1e3a8a] focus:border-[#1e3a8a] bg-white"
                      >
                        <option value="">-- Pilih Kategori --</option>
                        <option value="Gampang Pecah">Gampang Pecah (Fragile)</option>
                        <option value="Tidak boleh panas">Tidak boleh panas (Cool)</option>
                        <option value="Normal">Normal / Standar</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center justify-between">
                        <span>Tanggal Masuk <span className="text-red-500">*</span></span>
                      </label>
                      <div className="relative">
                         <input
                           type="date"
                           name="tanggalMasuk"
                           value={item.tanggalMasuk}
                           onChange={(e) => handleItemChange(item.id, e)}
                           required
                           max={getTodayDate()}
                           className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#1e3a8a] focus:border-[#1e3a8a]"
                         />
                      </div>
                      {/* <div className="mt-2 text-sm flex items-center text-blue-700 font-medium bg-blue-50 p-1.5 rounded">
                        <CalendarClock className="w-4 h-4 mr-1.5" />
                        Lama di gudang: <span className="ml-1 text-orange-600 font-bold text-base">{hitungLamaHari(item.tanggalMasuk)}</span> hari
                      </div> */}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAddItem}
              className="mt-4 flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#1e3a8a] bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1e3a8a]"
            >
              <Plus className="w-4 h-4" />
              Tambah Barang Lain
            </button>
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-bold text-slate-800 mb-2">
              Foto Awal Barang
            </h3>
            <p className="text-slate-500 mb-4">
              Upload atau ambil foto kondisi barang saat diserahkan.
            </p>

            <PhotoCapturePicker
              file={initialPhotoFile}
              onChange={setInitialPhotoFile}
              required
            />
            {!initialPhotoFile && (
              <p className="text-sm text-orange-600 mt-2">
                * Foto awal barang wajib diupload sebelum submit.
              </p>
            )}
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-bold text-slate-800 mb-2">
              Dokumen Pendukung
            </h3>
            <p className="text-slate-500 mb-4">
              Upload dokumen pendukung dalam format PDF (opsional, maksimal 10MB).
            </p>

            <label
              htmlFor="supporting-document"
              className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-blue-300 rounded-lg p-8 cursor-pointer hover:bg-blue-50 transition-colors"
            >
              <FileText className="w-10 h-10 text-blue-800" />
              <span className="font-semibold text-slate-800">
                {supportingDocFile ? supportingDocFile.name : 'Pilih File PDF'}
              </span>
              <span className="text-sm text-slate-500">
                {supportingDocFile
                  ? `${(supportingDocFile.size / (1024 * 1024)).toFixed(2)} MB`
                  : 'Klik untuk pilih dokumen dari perangkat'}
              </span>
              <input
                id="supporting-document"
                type="file"
                accept="application/pdf"
                onChange={handleSupportingDocChange}
                className="hidden"
              />
            </label>
          </div>

          {/* Footer / Submit */}
          <div className="mt-10 pt-5 border-t border-gray-200 flex items-center justify-between">
            <button
              type="submit"
              disabled={isSubmitting}
              className="ml-auto flex items-center gap-2 px-6 py-3 bg-[#1e3a8a] text-white font-semibold rounded-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1e3a8a] shadow-md transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              {isSubmitting ? 'Mengirim...' : 'Simpan Data Penitipan'}
            </button>
          </div>
          
        </form>
      </div>
    </div>
  );
}