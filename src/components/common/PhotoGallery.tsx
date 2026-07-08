import { useState } from 'react'
import { X } from 'lucide-react'

export interface GalleryPhoto {
  title: string
  image: string
  subtitle?: string
}

interface Props {
  photos: GalleryPhoto[]
}

export default function PhotoGallery({ photos }: Props) {
  const [selected, setSelected] = useState<GalleryPhoto | null>(null)

  if (photos.length === 0) return null

  return (
    <>
      <div className="mt-8">
        <h3 className="text-xl font-bold text-slate-800 mb-4">
          📸 Dokumentasi Batch
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {photos.map((photo, index) => (
            <button
              key={index}
              onClick={() => setSelected(photo)}
              className="group"
            >
              <img
                src={photo.image}
                alt={photo.title}
                className="w-full aspect-square rounded-xl object-cover border border-slate-200 shadow-sm group-hover:opacity-90"
              />

              <div className="mt-2 text-left">
                <p className="font-semibold text-sm">
                  {photo.title}
                </p>

                {photo.subtitle && (
                  <p className="text-xs text-slate-500">
                    {photo.subtitle}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6">
          <div className="relative max-w-5xl w-full">

            <button
              className="
                absolute
                top-3
                right-3
                w-11
                h-11
                rounded-full
                text-white
                backdrop-blur
              "
              onClick={() => setSelected(null)}
            >
              <X size={32} />
            </button>

            <img
              src={selected.image}
              className="rounded-xl max-h-[85vh] mx-auto"
            />

            <div className="text-center mt-4 text-white">
              <h3 className="font-semibold">
                {selected.title}
              </h3>

              {selected.subtitle && (
                <p className="text-sm opacity-80">
                  {selected.subtitle}
                </p>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  )
}
