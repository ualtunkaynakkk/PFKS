import { useState, useMemo } from 'react';
import type { StoreData, Action, RegionFilter, NewActionForm } from '../types';
import { STORES as INITIAL_STORES, INITIAL_ACTIONS, calcIndex } from '../data/stores';

export function useStores(regionFilter: RegionFilter) {
  const [stores] = useState<StoreData[]>(INITIAL_STORES);

  const filteredStores = useMemo(() => {
    if (regionFilter === 'Tümü') return stores;
    return stores.filter(s => s.region === regionFilter);
  }, [stores, regionFilter]);

  const regionSummary = useMemo(() => {
    const danger = stores.filter(s => s.status === 'danger').length;
    const warning = stores.filter(s => s.status === 'warning').length;
    const success = stores.filter(s => s.status === 'success').length;
    const avgCiro = Math.round(stores.reduce((a, s) => a + s.ciroGerc, 0) / stores.length);
    const avgConversion = (stores.reduce((a, s) => a + s.conversion, 0) / stores.length).toFixed(1);
    const avgUpt = (stores.reduce((a, s) => a + s.upt, 0) / stores.length).toFixed(2);
    return { danger, warning, success, avgCiro, avgConversion, avgUpt };
  }, [stores]);

  return { stores, filteredStores, regionSummary, calcIndex };
}

export function useActions(selectedStoreId: string) {
  const [actions, setActions] = useState<Action[]>(INITIAL_ACTIONS);

  const storeActions = useMemo(
    () => actions.filter(a => a.storeId === selectedStoreId),
    [actions, selectedStoreId]
  );

  const openCount = useMemo(
    () => actions.filter(a => a.status === 'Açık' || a.status === 'Gecikmiş').length,
    [actions]
  );

  const closureRate = useMemo(() => {
    const closed = actions.filter(a => a.status === 'Kapatıldı').length;
    return actions.length > 0 ? Math.round((closed / actions.length) * 100) : 0;
  }, [actions]);

  const addAction = (form: NewActionForm, storeId: string) => {
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
  };

  const closeAction = (id: string) => {
    setActions(prev => prev.map(a => a.id === id ? { ...a, status: 'Kapatıldı' } : a));
  };

  return { storeActions, allActions: actions, openCount, closureRate, addAction, closeAction };
}
