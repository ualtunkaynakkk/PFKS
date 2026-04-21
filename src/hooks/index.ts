import { useState, useMemo, useCallback, useEffect } from 'react';
import type {
  StoreData, Action, RegionFilter, NewActionForm,
  StoreForm, KPIUpdateForm, VisitLog, KPISnapshot
} from '../types';
import { calcIndex, deriveStatus } from '../data/stores';
import {
  fetchStores, insertStore, updateStoreDB, updateKPIDB,
  fetchActions, insertAction, updateActionStatus, deleteActionDB,
  fetchVisitLogs, insertVisitLog,
  fetchKPISnapshots, insertKPISnapshot,
  subscribeToStores, subscribeToActions,
} from '../services/supabase';

// ─── useStores ────────────────────────────────────────────────────────────────
export function useStores(regionFilter: RegionFilter) {
  const [stores, setStores] = useState<StoreData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await fetchStores();
      setStores(data);
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const sub = subscribeToStores(load);
    return () => { sub.unsubscribe(); };
  }, [load]);

  const filteredStores = useMemo(() => {
    const active = stores.filter(s => s.isActive);
    if (regionFilter === 'Tümü') return active;
    return active.filter(s => s.region === regionFilter);
  }, [stores, regionFilter]);

  const regionSummary = useMemo(() => {
    const active = stores.filter(s => s.isActive);
    if (active.length === 0) return { danger: 0, warning: 0, success: 0, avgCiro: 0, avgConversion: '0', avgUpt: '0', total: 0 };
    return {
      danger: active.filter(s => s.status === 'danger').length,
      warning: active.filter(s => s.status === 'warning').length,
      success: active.filter(s => s.status === 'success').length,
      avgCiro: Math.round(active.reduce((a, s) => a + s.ciroGerc, 0) / active.length),
      avgConversion: (active.reduce((a, s) => a + s.conversion, 0) / active.length).toFixed(1),
      avgUpt: (active.reduce((a, s) => a + s.upt, 0) / active.length).toFixed(2),
      total: active.length,
    };
  }, [stores]);

  const addStore = useCallback(async (form: StoreForm) => {
    const newStore = await insertStore(form);
    setStores(prev => [...prev, newStore]);
    return newStore;
  }, []);

  const updateStore = useCallback(async (id: string, fields: Partial<StoreData>) => {
    await updateStoreDB(id, fields);
    setStores(prev => prev.map(s => {
      if (s.id !== id) return s;
      const updated = { ...s, ...fields };
      return { ...updated, status: deriveStatus(updated.ciroGerc, updated.yds, updated.conversion) };
    }));
  }, []);

  const updateKPI = useCallback(async (id: string, form: KPIUpdateForm) => {
    await updateKPIDB(id, form);
    setStores(prev => prev.map(s => {
      if (s.id !== id) return s;
      const updated = { ...s, ciroGerc: form.ciroGerc, upt: form.upt, conversion: form.conversion, yds: form.yds, stockAccuracy: form.stockAccuracy };
      return { ...updated, status: deriveStatus(updated.ciroGerc, updated.yds, updated.conversion) };
    }));
  }, []);

  const removeStore = useCallback(async (id: string) => {
    await updateStoreDB(id, { isActive: false });
    setStores(prev => prev.map(s => s.id === id ? { ...s, isActive: false } : s));
  }, []);

  const restoreStore = useCallback(async (id: string) => {
    await updateStoreDB(id, { isActive: true });
    setStores(prev => prev.map(s => s.id === id ? { ...s, isActive: true } : s));
  }, []);

  return { stores, filteredStores, regionSummary, loading, error, calcIndex, addStore, updateStore, updateKPI, removeStore, restoreStore };
}

// ─── useActions ────────────────────────────────────────────────────────────────
export function useActions(selectedStoreId: string) {
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await fetchActions();
      setActions(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const sub = subscribeToActions(load);
    return () => { sub.unsubscribe(); };
  }, [load]);

  const storeActions = useMemo(
    () => selectedStoreId ? actions.filter(a => a.storeId === selectedStoreId) : [],
    [actions, selectedStoreId]
  );

  const allOpenActions = useMemo(
    () => actions.filter(a => a.status === 'Açık' || a.status === 'Gecikmiş'),
    [actions]
  );

  const closureRate = useMemo(() => {
    const closed = actions.filter(a => a.status === 'Kapatıldı').length;
    return actions.length > 0 ? Math.round((closed / actions.length) * 100) : 0;
  }, [actions]);

  const addAction = useCallback(async (form: NewActionForm, storeId: string) => {
    const newAction = await insertAction({
      storeId, title: form.title, deadline: form.deadline,
      responsible: form.responsible, problemArea: form.problemArea, status: 'Açık',
    });
    setActions(prev => [newAction, ...prev]);
    return newAction;
  }, []);

  const closeAction = useCallback(async (id: string) => {
    await updateActionStatus(id, 'Kapatıldı');
    setActions(prev => prev.map(a =>
      a.id === id ? { ...a, status: 'Kapatıldı', closedAt: new Date().toISOString().split('T')[0] } : a
    ));
  }, []);

  const deleteAction = useCallback(async (id: string) => {
    await deleteActionDB(id);
    setActions(prev => prev.filter(a => a.id !== id));
  }, []);

  return {
    storeActions, allActions: actions, allOpenActions,
    openCount: allOpenActions.length, closureRate, loading,
    addAction, closeAction, deleteAction,
  };
}

// ─── useVisitLogs ─────────────────────────────────────────────────────────────
export function useVisitLogs() {
  const [visitLogs, setVisitLogs] = useState<VisitLog[]>([]);
  const [kpiSnapshots, setKpiSnapshots] = useState<KPISnapshot[]>([]);

  useEffect(() => {
    fetchVisitLogs().then(setVisitLogs).catch(console.error);
    fetchKPISnapshots().then(setKpiSnapshots).catch(console.error);
  }, []);

  const getStoreLogs = useCallback((storeId: string) =>
    visitLogs.filter(v => v.storeId === storeId).sort((a, b) => b.date.localeCompare(a.date)),
  [visitLogs]);

  const getStoreSnapshots = useCallback((storeId: string) =>
    kpiSnapshots.filter(k => k.storeId === storeId).sort((a, b) => a.date.localeCompare(b.date)),
  [kpiSnapshots]);

  const addVisitLog = useCallback(async (log: Omit<VisitLog, 'id' | 'createdAt'>) => {
    const newLog = await insertVisitLog(log);
    setVisitLogs(prev => [newLog, ...prev]);
    return newLog;
  }, []);

  const addKpiSnapshot = useCallback(async (snap: Omit<KPISnapshot, 'id'>) => {
    const newSnap = await insertKPISnapshot(snap);
    setKpiSnapshots(prev => [...prev, newSnap]);
    return newSnap;
  }, []);

  const allLogs = useMemo(() =>
    [...visitLogs].sort((a, b) => b.date.localeCompare(a.date)),
  [visitLogs]);

  return { visitLogs, kpiSnapshots, allLogs, getStoreLogs, getStoreSnapshots, addVisitLog, addKpiSnapshot };
}
