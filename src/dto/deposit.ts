import type { Item, ReturnRecord } from "./item.dto";
import type { Placement } from "./placement.dto";

export type DepositItemInput = {
  item_name: string;
  quantity: number;
  procurement_unit: string;
  category?: string;
  entry_date: string;
};

export type DepositRequestInput = {
  depositor_name: string;
  nipp: string;
  jabatan: string;
  unit_kerja: string;
  initial_photo_path: string;
  items: DepositItemInput[];
};

export type DepositItemForm = {
  id: number;
  namaBarang: string;
  unitPengadaan: string;
  jumlah: string;
  kategori: string;
  tanggalMasuk: string;
};

export type DepositUserForm = {
  nama: string;
  nipp: string;
  jabatan: string;
  unitKerja: string;
};

export type DepositRequest = {
  id: string
  depositor_name: string
  nipp: string
  jabatan: string
  unit_kerja: string
  initial_photo_path: string
  status: string
  created_at: string
  items: DepositItem[]
  placements: Placement[] | Placement | null
}

export type DepositItem = {
  id: string
  item_name: string
  quantity: number
  remaining_quantity: number
  procurement_unit: string
  category: string | null
  entry_date: string
  status: string
}

export type ReturnItemPayload = {
  deposit_request_id: string
  returned_by_name: string
  returned_by_nipp?: string
  returned_by_unit?: string
  notes?: string
  return_date: string
  taken_photo_path?: string | null
  remaining_photo_path?: string | null
  items: {
    item_id: string
    returned_quantity: number
  }[]
}

export type DepositDetail = {
  id: string
  depositor_name: string
  nipp: string
  jabatan: string
  unit_kerja: string
  status: string
  created_at: string
  items: Item[]
  placements: Placement[] | Placement | null
  return_records?: ReturnRecord[]
  initial_photo_path: string
}