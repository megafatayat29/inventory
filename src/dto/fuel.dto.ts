export type FuelDeposit = {
  id: string
  storage_date: string
  user_unit: string
  fuel_type: string
  volume: number
  photo_path: string | null
  supporting_document_path: string | null
  depositor_name: string
  nipp: string
  jabatan: string
  unit_kerja: string
  reason: string
  created_at: string
}

export type CreateFuelDepositInput = {
  storage_date: string
  user_unit: string
  fuel_type: string
  volume: number
  photo_path: string | null
  supporting_document_path: string | null
  depositor_name: string
  nipp: string
  jabatan: string
  unit_kerja: string
  reason: string
}
