import { useState, useMemo, useCallback } from 'react';
import type { 
  StoreData, Action, RegionFilter, NewActionForm, 
  StoreForm, KPIUpdateForm, VisitLog, KPISnapshot 
} from '../types';
import { STORES as INITIAL_STORES, INITIAL_ACTIONS, calcIndex, deriveStatus } from '../data/stores';

// ─── useStores ────────────────────────────────────────────────────────────────
export function useStores(regionFilter: RegionFilter) {
  const [stores, setStores] = useState<StoreData[]>(INITIAL_STORES);

  const filteredStores = useMemo(() => {
    const active = stores.filter(s => s.isActive);
    if (regionFilter === 'Tümü') return active;
    return active.filter(s => s.region === regionFilter);
  }, [stores, regionFilter]);

  const regionSummary = useMemo(() => {
    const active = stores.filter(s => s.isActive);
    const danger = active.filter(s => s.status === 'danger').length;
    const warning = active.filter(s => s.status === 'warning').length;
    const success = active.filter(s => s.status === 'success').length;
    const avgCiro = active.length > 0 ? Math.round(active.reduce((a, s) => a + s.ciroGerc, 0) / active.length) : 0;
    const avgConversion = active.length > 0 ? (active.reduce((a, s) => a + s.conversion, 0) / active.length).toFixed(1) : '0';
    const avgUpt = active.length > 0 ? (active.reduce((a, s) => a + s.upt, 0) / active.length).toFixed(2) : '0';
    return { danger, warning, success, avgCiro, avgConversion, avgUpt, total: active.length };
  }, [stores]);

  const addStore = useCallback((form: StoreForm) => {
    const newStore: StoreData = {
      id: `s${Date.now()}`,
      ...form,
      status: deriveStatus(form.ciroGerc, form.yds, form.conversion),
      isActive: true,
    };
    setStores(prev => [...prev, newStore]);
    return newStore;
  }, []);

  const updateStore = useCallback((id: string, form: Partial<StoreData>) => {
    setStores(prev => prev.map(s => {
      if (s.id !== id) return s;
      const updated = { ...s, ...form };
      return { ...updated, status: deriveStatus(updated.ciroGerc, updated.yds, updated.conversion) };
    }));
  }, []);

  const updateKPI = useCallback((id: string, form: KPIUpdateForm) => {
    setStores(prev => prev.map(s => {
      if (s.id !== id) return s;
      const updated = {
        ...s,
        ciroGerc: form.ciroGerc,
        upt: form.upt,
        conversion: form.conversion,
        yds: form.yds,
        stockAccuracy: form.stockAccuracy,
      };
      return { ...updated, status: deriveStatus(updated.ciroGerc, updated.yds, updated.conversion) };
    }));
  }, []);

  const removeStore = useCallback((id: string) => {
    setStores(prev => prev.map(s => s.id === id ? { ...s, isActive: false } : s));
  }, []);

  const restoreStore = useCallback((id: string) => {
    setStores(prev => prev.map(s => s.id === id ? { ...s, isActive: true } : s));
  }, []);

  return { stores, filteredStores, regionSummary, calcIndex, addStore, updateStore, updateKPI, removeStore, restoreStore };
}

// ─── useActions ────────────────────────────────────────────────────────────────
export function useActions(selectedStoreId: string) {
  const [actions, setActions] = useState<Action[]>(INITIAL_ACTIONS);

  const storeActions = useMemo(
    () => actions.filter(a => a.storeId === selectedStoreId),
    [actions, selectedStoreId]
  );

  const allOpenActions = useMemo(
    () => actions.filter(a => a.status === 'Açık' || a.status === 'Gecikmiş'),
    [actions]
  );

  const openCount = allOpenActions.length;

  const closureRate = useMemo(() => {
    const closed = actions.filter(a => a.status === 'Kapatıldı').length;
    return actions.length > 0 ? Math.round((closed / actions.length) * 100) : 0;
  }, [actions]);

  const addAction = useCallback((form: NewActionForm, storeId: string) => {
    const newAction: Action = {
      id: `a${Date.now()}`,
      storeId,
      title: form.title,
      deadline: form.deadline,
      responsible: form.responsible,
      problemArea: form.problemArea,
      status: 'Açık',
      createdAt: new Date().toISOString().split('T')[0],
    };
    setActions(prev => [...prev, newAction]);
    return newAction;
  }, []);

  const closeAction = useCallback((id: string) => {
    setActions(prev => prev.map(a => 
      a.id === id ? { ...a, status: 'Kapatıldı', closedAt: new Date().toISOString().split('T')[0] } : a
    ));
  }, []);

  const deleteAction = useCallback((id: string) => {
    setActions(prev => prev.filter(a => a.id !== id));
  }, []);

  return { storeActions, allActions: actions, allOpenActions, openCount, closureRate, addAction, closeAction, deleteAction };
}

// ─── useVisitLogs ─────────────────────────────────────────────────────────────
export function useVisitLogs() {
  const [visitLogs, setVisitLogs] = useState<VisitLog[]>([
    {
      id: 'v1', storeId: '4', date: '2026-04-15', type: 'Acil',
      notes: 'Dönüşüm oranı kritik seviyede. Karşılama disiplini yerinde kontrol edildi.',
      findings: 'Personel girişte pasif kalıyor. Vitrin düzensiz.',
      nextVisit: '2026-04-22', createdAt: '2026-04-15',
    },
    {
      id: 'v2', storeId: '1', date: '2026-04-16', type: 'Rutin',
      notes: 'Haftalık rutin ziyaret. Performans takibi yapıldı.',
      findings: 'Ekip motivasyonu yüksek. Yeni sezon yerleşimi başarılı.',
      nextVisit: '2026-04-23', createdAt: '2026-04-16',
    },
    {
      id: 'v3', storeId: '3', date: '2026-04-14', type: 'Denetim',
      notes: 'Cross-sell eğitimi öncesi ön değerlendirme yapıldı.',
      findings: 'Kasa bölgesi fırsat ürünleri eksik. Sepet ortalaması artırılabilir.',
      nextVisit: '2026-04-21', createdAt: '2026-04-14',
    },
  ]);

  const [kpiSnapshots, setKpiSnapshots] = useState<KPISnapshot[]>([
    { id: 'k1', storeId: '4', date: '2026-04-01', ciroGerc: 78, upt: 1.75, conversion: 13.5, yds: 6.0, stockAccuracy: 93.0, note: 'Nisan başı verisi' },
    { id: 'k2', storeId: '4', date: '2026-04-08', ciroGerc: 80, upt: 1.78, conversion: 14.0, yds: 6.1, stockAccuracy: 93.8, note: 'Hafta 2' },
    { id: 'k3', storeId: '4', date: '2026-04-15', ciroGerc: 81, upt: 1.82, conversion: 14.8, yds: 6.2, stockAccuracy: 94.2, note: 'Hafta 3' },
    { id: 'k4', storeId: '1', date: '2026-04-01', ciroGerc: 108, upt: 2.38, conversion: 21.0, yds: 9.0, stockAccuracy: 97.5, note: 'Nisan başı' },
    { id: 'k5', storeId: '1', date: '2026-04-08', ciroGerc: 110, upt: 2.42, conversion: 21.8, yds: 9.1, stockAccuracy: 98.0, note: 'Hafta 2' },
    { id: 'k6', storeId: '1', date: '2026-04-15', ciroGerc: 112, upt: 2.45, conversion: 22.1, yds: 9.2, stockAccuracy: 98.5, note: 'Hafta 3' },
  ]);

  const getStoreLogs = useCallback((storeId: string) => 
    visitLogs.filter(v => v.storeId === storeId).sort((a, b) => b.date.localeCompare(a.date)), 
  [visitLogs]);

  const getStoreSnapshots = useCallback((storeId: string) =>
    kpiSnapshots.filter(k => k.storeId === storeId).sort((a, b) => a.date.localeCompare(b.date)),
  [kpiSnapshots]);

  const addVisitLog = useCallback((log: Omit<VisitLog, 'id' | 'createdAt'>) => {
    const newLog: VisitLog = {
      ...log,
      id: `v${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setVisitLogs(prev => [newLog, ...prev]);
    return newLog;
  }, []);

  const addKpiSnapshot = useCallback((snap: Omit<KPISnapshot, 'id'>) => {
    const newSnap: KPISnapshot = { ...snap, id: `k${Date.now()}` };
    setKpiSnapshots(prev => [...prev, newSnap]);
    return newSnap;
  }, []);

  const allLogs = useMemo(() => 
    [...visitLogs].sort((a, b) => b.date.localeCompare(a.date)),
  [visitLogs]);

  return { visitLogs, kpiSnapshots, allLogs, getStoreLogs, getStoreSnapshots, addVisitLog, addKpiSnapshot };
}
