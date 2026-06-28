import { Camera, ImagePlus, X } from 'lucide-react'

type PhotoCapturePickerProps = {
  title?: string
  file: File | null
  onChange: (file: File | null) => void
  required?: boolean
}

export default function PhotoCapturePicker({
  title,
  file,
  onChange,
  required,
}: PhotoCapturePickerProps) {
  const previewUrl = file ? URL.createObjectURL(file) : null

  return (
    <div>
      {title && (
        <p className="font-semibold text-slate-800 mb-3">
          {title}
          {required && <span className="text-red-500"> *</span>}
        </p>
      )}

      {previewUrl ? (
        <div className="relative rounded-2xl border border-slate-200 overflow-hidden bg-slate-50">
          <img
            src={previewUrl}
            alt="Preview foto"
            className="w-full max-h-[320px] object-cover"
          />

          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white text-red-600 flex items-center justify-center shadow"
          >
            <X size={20} />
          </button>

          <div className="p-4 flex flex-col sm:flex-row gap-3">
            <label className="flex-1 cursor-pointer">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(event) => {
                  const selectedFile = event.target.files?.[0] ?? null
                  onChange(selectedFile)
                }}
              />
              <div className="w-full px-4 py-3 rounded-xl bg-blue-600 text-white font-semibold text-center">
                Ambil Ulang Kamera
              </div>
            </label>

            <label className="flex-1 cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  const selectedFile = event.target.files?.[0] ?? null
                  onChange(selectedFile)
                }}
              />
              <div className="w-full px-4 py-3 rounded-xl bg-orange-500 text-white font-semibold text-center">
                Upload Ulang
              </div>
            </label>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <label className="min-h-[190px] rounded-2xl border-2 border-dashed border-blue-300 bg-slate-50 hover:bg-blue-50 transition cursor-pointer flex items-center justify-center">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(event) => {
                const selectedFile = event.target.files?.[0] ?? null
                onChange(selectedFile)
              }}
            />

            <div className="text-center text-slate-700">
              <Camera size={48} className="mx-auto text-slate-400 mb-4" />
              <p className="text-xl font-bold">Kamera</p>
              <p className="text-sm text-slate-500 mt-1">
                Di HP akan membuka kamera
              </p>
            </div>
          </label>

          <label className="min-h-[190px] rounded-2xl border-2 border-dashed border-blue-300 bg-slate-50 hover:bg-blue-50 transition cursor-pointer flex items-center justify-center">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                const selectedFile = event.target.files?.[0] ?? null
                onChange(selectedFile)
              }}
            />

            <div className="text-center text-slate-700">
              <ImagePlus size={48} className="mx-auto text-orange-400 mb-4" />
              <p className="text-xl font-bold">Upload Gambar</p>
              <p className="text-sm text-slate-500 mt-1">
                Pilih gambar dari perangkat
              </p>
            </div>
          </label>
        </div>
      )}
    </div>
  )
}