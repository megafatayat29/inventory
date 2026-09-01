export type UsedGoodsDeposit = {
  id: string
  entry_date: string
  producing_unit: string
  depositor_name: string
  nipp: string
  jabatan: string
  unit_kerja: string
  reason: string
  photo_path: string | null
  created_at: string
}

export type CreateUsedGoodsDepositInput = {
  entry_date: string
  producing_unit: string
  depositor_name: string
  nipp: string
  jabatan: string
  unit_kerja: string
  reason: string
  photo_path: string | null
}
