export type StoreStatus = 'success' | 'warning' | 'danger' | 'stable';
export type ActionStatus = 'Açık' | 'Kapatıldı' | 'Gecikmiş';
export type ModalType = 'none' | 'new_action' | 'intervention' | 'print_preview';
export type TabType = 'overview' | 'daily';
export type RegionFilter = 'Tümü' | 'Merkez' | 'Asya' | 'Anadolu';

export interface Action {
  id: string;
  storeId: string;
  title: string;
  responsible: string;
  problemArea: string;
  status: ActionStatus;
  deadline: string;
  createdAt: string;
}

export interface StoreData {
  id: string;
  name: string;
  code: string;
  segment: string;
  region: RegionFilter;
  status: StoreStatus;
  ciroGerc: number;       // Ciro gerçekleşme %
  upt: number;             // FBA - Fatura başına adet
  conversion: number;      // Dönüşüm oranı %
  yds: number;             // Yönetim disiplin skoru /10
  personnelEfficiency: string;
  stockAccuracy: number;
  visitFrequency: number;
  managerNote: string;
}

export interface KPIWeights {
  ciro: number;
  conversion: number;
  upt: number;
  yds: number;
  stockAccuracy: number;
  visitFrequency: number;
}

export interface DailySlot {
  time: string;
  actual: number | null;
  target: number;
}

export interface NewActionForm {
  title: string;
  deadline: string;
  responsible: string;
  problemArea: string;
}
