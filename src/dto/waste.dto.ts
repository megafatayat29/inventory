export type WasteDeposit = {
  id: string
  storage_date: string
  producing_unit: string
  waste_type: string
  depositor_name: string
  nipp: string
  jabatan: string
  unit_kerja: string
  reason: string
  photo_path: string | null
  created_at: string
}

export type CreateWasteDepositInput = {
  storage_date: string
  producing_unit: string
  waste_type: string
  depositor_name: string
  nipp: string
  jabatan: string
  unit_kerja: string
  reason: string
  photo_path: string | null
}
