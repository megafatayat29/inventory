import { supabase } from "../lib/supabase"
export const STORAGE_BUCKET = "inventory-photos"

export function getPublicImage(path?: string) {
  if (!path) return ''

  const { data } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(path)

  return data.publicUrl
}