import { createClient } from '@supabase/supabase-js';
import type { StoreData, Action, VisitLog, KPISnapshot, StoreForm, KPIUpdateForm } from '../types';

// ─── Client ───────────────────────────────────────────────────────────────────
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://nbzktfignblwxuyeajci.supabase.co';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5iemt0ZmlnbmJsd3h1eWVhamNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4OTQzMzEsImV4cCI6MjA5MDQ3MDMzMX0.hQqd2WpE0YZuZ50PB3VDW8uZ0Z2mFt3J6On_5jq5KRM';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── Type mappers (DB snake_case → App camelCase) ─────────────────────────────
function mapStore(row: Record<string, unknown>): StoreData {
  return {
    id: row.id as string,
    code: row.code as string,
    name: row.name as string,
    segment: row.segment as string,
    region: row.region as StoreData['region'],
    status: row.status as StoreData['status'],
    ciroGerc: Number(row.ciro_gerc),
    upt: Number(row.upt),
    conversion: Number(row.conversion),
    yds: Number(row.yds),
    stockAccuracy: Number(row.stock_accuracy),
    visitFrequency: Number(row.visit_frequency),
    personnelEfficiency: (row.personnel_efficiency as string) || '₺4.0k / saat',
    managerNote: (row.manager_note as string) || '',
    isActive: row.is_active as boolean,
  };
}

function mapAction(row: Record<string, unknown>): Action {
  return {
    id: row.id as string,
    storeId: row.store_id as string,
    title: row.title as string,
    responsible: row.responsible as string,
    problemArea: row.problem_area as string,
    status: row.status as Action['status'],
    deadline: row.deadline as string,
    closedAt: row.closed_at as string | undefined,
    createdAt: row.created_at as string,
  };
}

function mapVisitLog(row: Record<string, unknown>): VisitLog {
  return {
    id: row.id as string,
    storeId: row.store_id as string,
    date: row.visit_date as string,
    type: row.visit_type as VisitLog['type'],
    notes: row.notes as string,
    findings: (row.findings as string) || '',
    nextVisit: (row.next_visit as string) || '',
    createdAt: row.created_at as string,
  };
}

function mapSnapshot(row: Record<string, unknown>): KPISnapshot {
  return {
    id: row.id as string,
    storeId: row.store_id as string,
    date: row.snapshot_date as string,
    ciroGerc: Number(row.ciro_gerc),
    upt: Number(row.upt),
    conversion: Number(row.conversion),
    yds: Number(row.yds),
    stockAccuracy: Number(row.stock_accuracy),
    note: (row.note as string) || '',
  };
}

// ─── Stores ───────────────────────────────────────────────────────────────────
export async function fetchStores(): Promise<StoreData[]> {
  const { data, error } = await supabase
    .from('pfks_stores')
    .select('*')
    .order('code');
  if (error) throw error;
  return (data || []).map(mapStore);
}

export async function insertStore(form: StoreForm): Promise<StoreData> {
  const { data, error } = await supabase
    .from('pfks_stores')
    .insert({
      code: form.code,
      name: form.name,
      segment: form.segment,
      region: form.region,
      ciro_gerc: form.ciroGerc,
      upt: form.upt,
      conversion: form.conversion,
      yds: form.yds,
      stock_accuracy: form.stockAccuracy,
      visit_frequency: form.visitFrequency,
      personnel_efficiency: form.personnelEfficiency,
      manager_note: form.managerNote,
      is_active: true,
    })
    .select()
    .single();
  if (error) throw error;
  return mapStore(data);
}

export async function updateStoreDB(id: string, fields: Partial<StoreData>): Promise<void> {
  const dbFields: Record<string, unknown> = {};
  if (fields.name !== undefined) dbFields.name = fields.name;
  if (fields.code !== undefined) dbFields.code = fields.code;
  if (fields.segment !== undefined) dbFields.segment = fields.segment;
  if (fields.region !== undefined) dbFields.region = fields.region;
  if (fields.status !== undefined) dbFields.status = fields.status;
  if (fields.ciroGerc !== undefined) dbFields.ciro_gerc = fields.ciroGerc;
  if (fields.upt !== undefined) dbFields.upt = fields.upt;
  if (fields.conversion !== undefined) dbFields.conversion = fields.conversion;
  if (fields.yds !== undefined) dbFields.yds = fields.yds;
  if (fields.stockAccuracy !== undefined) dbFields.stock_accuracy = fields.stockAccuracy;
  if (fields.visitFrequency !== undefined) dbFields.visit_frequency = fields.visitFrequency;
  if (fields.personnelEfficiency !== undefined) dbFields.personnel_efficiency = fields.personnelEfficiency;
  if (fields.managerNote !== undefined) dbFields.manager_note = fields.managerNote;
  if (fields.isActive !== undefined) dbFields.is_active = fields.isActive;

  const { error } = await supabase.from('pfks_stores').update(dbFields).eq('id', id);
  if (error) throw error;
}

export async function updateKPIDB(id: string, form: KPIUpdateForm): Promise<void> {
  const { error } = await supabase.from('pfks_stores').update({
    ciro_gerc: form.ciroGerc,
    upt: form.upt,
    conversion: form.conversion,
    yds: form.yds,
    stock_accuracy: form.stockAccuracy,
    manager_note: form.note || undefined,
  }).eq('id', id);
  if (error) throw error;
}

// ─── Actions ──────────────────────────────────────────────────────────────────
export async function fetchActions(): Promise<Action[]> {
  const { data, error } = await supabase
    .from('pfks_actions')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(mapAction);
}

export async function insertAction(action: Omit<Action, 'id' | 'createdAt'>): Promise<Action> {
  const { data, error } = await supabase
    .from('pfks_actions')
    .insert({
      store_id: action.storeId,
      title: action.title,
      responsible: action.responsible,
      problem_area: action.problemArea,
      status: action.status,
      deadline: action.deadline,
    })
    .select()
    .single();
  if (error) throw error;
  return mapAction(data);
}

export async function updateActionStatus(id: string, status: Action['status']): Promise<void> {
  const update: Record<string, unknown> = { status };
  if (status === 'Kapatıldı') update.closed_at = new Date().toISOString().split('T')[0];
  const { error } = await supabase.from('pfks_actions').update(update).eq('id', id);
  if (error) throw error;
}

export async function deleteActionDB(id: string): Promise<void> {
  const { error } = await supabase.from('pfks_actions').delete().eq('id', id);
  if (error) throw error;
}

// ─── Visit Logs ───────────────────────────────────────────────────────────────
export async function fetchVisitLogs(): Promise<VisitLog[]> {
  const { data, error } = await supabase
    .from('pfks_visit_logs')
    .select('*')
    .order('visit_date', { ascending: false });
  if (error) throw error;
  return (data || []).map(mapVisitLog);
}

export async function insertVisitLog(log: Omit<VisitLog, 'id' | 'createdAt'>): Promise<VisitLog> {
  const { data, error } = await supabase
    .from('pfks_visit_logs')
    .insert({
      store_id: log.storeId,
      visit_date: log.date,
      visit_type: log.type,
      notes: log.notes,
      findings: log.findings,
      next_visit: log.nextVisit || null,
    })
    .select()
    .single();
  if (error) throw error;
  return mapVisitLog(data);
}

// ─── KPI Snapshots ────────────────────────────────────────────────────────────
export async function fetchKPISnapshots(): Promise<KPISnapshot[]> {
  const { data, error } = await supabase
    .from('pfks_kpi_snapshots')
    .select('*')
    .order('snapshot_date');
  if (error) throw error;
  return (data || []).map(mapSnapshot);
}

export async function insertKPISnapshot(snap: Omit<KPISnapshot, 'id'>): Promise<KPISnapshot> {
  const { data, error } = await supabase
    .from('pfks_kpi_snapshots')
    .insert({
      store_id: snap.storeId,
      snapshot_date: snap.date,
      ciro_gerc: snap.ciroGerc,
      upt: snap.upt,
      conversion: snap.conversion,
      yds: snap.yds,
      stock_accuracy: snap.stockAccuracy,
      note: snap.note,
    })
    .select()
    .single();
  if (error) throw error;
  return mapSnapshot(data);
}

// ─── Realtime subscriptions ───────────────────────────────────────────────────
export function subscribeToStores(onUpdate: () => void) {
  return supabase
    .channel('pfks_stores_changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'pfks_stores' }, onUpdate)
    .subscribe();
}

export function subscribeToActions(onUpdate: () => void) {
  return supabase
    .channel('pfks_actions_changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'pfks_actions' }, onUpdate)
    .subscribe();
}
