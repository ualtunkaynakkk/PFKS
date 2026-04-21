export type StoreStatus = 'success' | 'warning' | 'danger' | 'stable';
export type ActionStatus = 'Açık' | 'Kapatıldı' | 'Gecikmiş';
export type ModalType = 
  | 'none' 
  | 'new_action' 
  | 'intervention' 
  | 'print_preview'
  | 'edit_store'
  | 'add_store'
  | 'delete_store'
  | 'visit_log'
  | 'kpi_update';
export type TabType = 'overview' | 'daily';
export type RegionFilter = 'Tümü' | 'Merkez' | 'Asya' | 'Anadolu';
export type AppView = 'dashboard' | 'stores' | 'tracking' | 'users';

export interface Action {
  id: string;
  storeId: string;
  title: string;
  responsible: string;
  problemArea: string;
  status: ActionStatus;
  deadline: string;
  createdAt: string;
  closedAt?: string;
}

export interface VisitLog {
  id: string;
  storeId: string;
  date: string;
  type: 'Rutin' | 'Acil' | 'Denetim' | 'Eğitim';
  notes: string;
  findings: string;
  nextVisit: string;
  createdAt: string;
}

export interface KPISnapshot {
  id: string;
  storeId: string;
  date: string;
  ciroGerc: number;
  upt: number;
  conversion: number;
  yds: number;
  stockAccuracy: number;
  note: string;
}

export interface StoreData {
  id: string;
  name: string;
  code: string;
  segment: string;
  region: RegionFilter;
  status: StoreStatus;
  ciroGerc: number;
  upt: number;
  conversion: number;
  yds: number;
  personnelEfficiency: string;
  stockAccuracy: number;
  visitFrequency: number;
  managerNote: string;
  isActive: boolean;
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

export interface StoreForm {
  name: string;
  code: string;
  segment: string;
  region: RegionFilter;
  ciroGerc: number;
  upt: number;
  conversion: number;
  yds: number;
  stockAccuracy: number;
  visitFrequency: number;
  personnelEfficiency: string;
  managerNote: string;
}

export interface KPIUpdateForm {
  ciroGerc: number;
  upt: number;
  conversion: number;
  yds: number;
  stockAccuracy: number;
  note: string;
}
