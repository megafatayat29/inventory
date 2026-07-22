import { supabase } from '../lib/supabase'

const BUCKET_NAME = 'inventory-photos'

export async function uploadInventoryPhoto(file: File, folder: string) {
  const fileExt = file.name.split('.').pop()
  const fileName = `${crypto.randomUUID()}.${fileExt}`
  const filePath = `${folder}/${fileName}`

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) throw error

  return filePath
}

export function getInventoryPhotoUrl(path?: string | null) {
  if (!path) return null

  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(path)

  return data.publicUrl
}

const DOCUMENT_BUCKET_NAME = 'inventory-documents'

export async function uploadInventoryDocument(file: File, folder: string) {
  const fileExt = file.name.split('.').pop()
  const fileName = `${crypto.randomUUID()}.${fileExt}`
  const filePath = `${folder}/${fileName}`

  const { error } = await supabase.storage
    .from(DOCUMENT_BUCKET_NAME)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) throw error

  return filePath
}

export function getInventoryDocumentUrl(path?: string | null) {
  if (!path) return null

  const { data } = supabase.storage
    .from(DOCUMENT_BUCKET_NAME)
    .getPublicUrl(path)

  return data.publicUrl
}