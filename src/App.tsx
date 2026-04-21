import { useState, useMemo, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Activity, LayoutDashboard, Store, BarChart2, Loader2 } from 'lucide-react';

import type { RegionFilter, TabType, ModalType, NewActionForm, AppView, KPIUpdateForm } from './types';
import { getDailySlots } from './data/stores';
import { useStores, useActions, useVisitLogs } from './hooks';

import { KPIBar } from './components/KPIBar';
import { StoreTable } from './components/StoreTable';
import { StoreDrillDown } from './components/StoreDrillDown';
import { AlarmTicker } from './components/AlarmTicker';
import { NewActionModal, InterventionModal, PrintPreviewModal } from './components/modals';
import { StoreManagement } from './components/StoreManagement';
import { KPIUpdateModal } from './components/KPIUpdateModal';
import { TrackingModule } from './components/TrackingModule';

export default function App() {
  const [view, setView] = useState<AppView>('dashboard');
  const [selectedStoreId, setSelectedStoreId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [activeModal, setActiveModal] = useState<ModalType>('none');
  const [regionFilter, setRegionFilter] = useState<RegionFilter>('Tümü');
  const [toast, setToast] = useState<string | null>(null);

  // ── Data hooks ──────────────────────────────────────────────────────────────
  const {
    stores, filteredStores, regionSummary,
    loading: storesLoading, error: storesError,
    calcIndex, addStore, updateStore, updateKPI, removeStore, restoreStore,
  } = useStores(regionFilter);

  const activeStores = useMemo(() => stores.filter(s => s.isActive), [stores]);

  // Stores yüklenince ilk mağazayı (tercihen M402) seç
  useEffect(() => {
    if (activeStores.length > 0 && !selectedStoreId) {
      const zorlu = activeStores.find(s => s.code === 'M402');
      setSelectedStoreId(zorlu?.id ?? activeStores[0].id);
    }
  }, [activeStores.length]); // eslint-disable-line

  const selectedStore = useMemo(
    () => activeStores.find(s => s.id === selectedStoreId) ?? activeStores[0] ?? null,
    [activeStores, selectedStoreId]
  );

  const { storeActions, allActions, openCount, closureRate, addAction, closeAction } = useActions(selectedStoreId);
  const { allLogs, kpiSnapshots, getStoreLogs, getStoreSnapshots, addVisitLog, addKpiSnapshot } = useVisitLogs();

  const selectedIndex = useMemo(
    () => (selectedStore ? calcIndex(selectedStore) : 0),
    [selectedStore, calcIndex]
  );
  const dailySlots = useMemo(() => getDailySlots(selectedStoreId || ''), [selectedStoreId]);

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleSaveAction = async (form: NewActionForm) => {
    if (!selectedStore) return;
    await addAction(form, selectedStoreId);
    setActiveModal('none');
    showToast(`Aksiyon kaydedildi — ${selectedStore.name}`);
  };

  const handleIntervention = (note: string) => {
    setActiveModal('none');
    showToast(`Müdahale talimatı gönderildi${note ? ` — ${note.slice(0, 50)}` : ''}`);
  };

  const handleCloseAction = async (id: string) => {
    await closeAction(id);
    showToast('Aksiyon kapatıldı.');
  };

  const handleKPIUpdate = async (form: KPIUpdateForm) => {
    if (!selectedStore) return;
    await updateKPI(selectedStoreId, form);
    await addKpiSnapshot({
      storeId: selectedStoreId,
      date: new Date().toISOString().split('T')[0],
      ...form,
    });
    setActiveModal('none');
    showToast(`${selectedStore.name} KPI güncellendi.`);
  };

  // ── Loading / Error ─────────────────────────────────────────────────────────
  if (storesLoading) {
    return (
      <div className="flex flex-col h-screen bg-bg">
        <header className="h-[50px] bg-ink text-white flex items-center px-5 border-b-2 border-accent shrink-0">
          <Activity className="w-5 h-5 text-accent mr-3" />
          <h1 className="text-sm font-bold tracking-widest uppercase">PFKS</h1>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-8 h-8 text-accent animate-spin" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Veriler yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (storesError) {
    return (
      <div className="flex flex-col h-screen bg-bg">
        <header className="h-[50px] bg-ink text-white flex items-center px-5 border-b-2 border-accent shrink-0">
          <Activity className="w-5 h-5 text-accent mr-3" />
          <h1 className="text-sm font-bold tracking-widest uppercase">PFKS</h1>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6 text-center">
          <p className="text-sm font-bold text-danger">Bağlantı hatası</p>
          <p className="text-xs text-slate-400">{storesError}</p>
          <button onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-accent text-white text-xs font-bold rounded uppercase">
            Yeniden Dene
          </button>
        </div>
      </div>
    );
  }

  // Stores yüklendi ama selectedStore henüz seçilmedi (useEffect henüz çalışmadı)
  if (!selectedStore) {
    return (
      <div className="flex flex-col h-screen bg-bg">
        <header className="h-[50px] bg-ink text-white flex items-center px-5 border-b-2 border-accent shrink-0">
          <Activity className="w-5 h-5 text-accent mr-3" />
          <h1 className="text-sm font-bold tracking-widest uppercase">PFKS</h1>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-8 h-8 text-accent animate-spin" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Hazırlanıyor...</p>
        </div>
      </div>
    );
  }

  // ── Nav ─────────────────────────────────────────────────────────────────────
  const NAV_ITEMS = [
    { id: 'dashboard' as AppView, label: 'Dashboard',        icon: LayoutDashboard },
    { id: 'stores'   as AppView, label: 'Mağazalar',         icon: Store           },
    { id: 'tracking' as AppView, label: 'Takip & Geçmiş',   icon: BarChart2       },
  ];

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-screen overflow-hidden relative">

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -40 }} animate={{ opacity: 1, y: 20 }} exit={{ opacity: 0, y: -40 }}
            className="fixed top-0 left-1/2 -translate-x-1/2 z-[150] bg-ink text-white px-5 py-2.5 rounded-full shadow-2xl border border-accent font-bold text-xs flex items-center gap-2 max-w-[90vw]"
          >
            <Activity className="w-3.5 h-3.5 text-accent shrink-0" />
            <span className="truncate">{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {activeModal === 'new_action' && (
          <NewActionModal store={selectedStore} onClose={() => setActiveModal('none')} onSave={handleSaveAction} />
        )}
        {activeModal === 'intervention' && (
          <InterventionModal store={selectedStore} onClose={() => setActiveModal('none')} onSend={handleIntervention} />
        )}
        {activeModal === 'print_preview' && (
          <PrintPreviewModal store={selectedStore} index={selectedIndex} onClose={() => setActiveModal('none')} />
        )}
        {activeModal === 'kpi_update' && (
          <KPIUpdateModal store={selectedStore} onClose={() => setActiveModal('none')} onSave={handleKPIUpdate} />
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="h-[50px] bg-ink text-white flex items-center justify-between px-4 border-b-2 border-accent shrink-0">
        <div className="flex items-center gap-2.5">
          <Activity className="w-4 h-4 text-accent" />
          <h1 className="text-sm font-bold tracking-widest uppercase">
            PFKS
            <span className="text-accent opacity-40 mx-1.5">//</span>
            <span className="font-normal opacity-70 text-[11px] hidden sm:inline">Penti Bölge Paneli</span>
          </h1>
        </div>

        {/* Navigasyon */}
        <nav className="flex items-center gap-0.5">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setView(id)} title={label}
              className={`flex items-center gap-1.5 px-3 py-2 rounded text-[10px] font-bold uppercase transition-all ${
                view === id ? 'bg-accent text-white' : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}>
              <Icon className="w-4 h-4" />
              <span className="hidden lg:inline">{label}</span>
            </button>
          ))}
        </nav>

        <div className="text-[9px] font-mono opacity-50 hidden xl:flex items-center gap-2 uppercase">
          <span>{new Date().toLocaleDateString('tr-TR')}</span>
          <span className="text-accent">|</span>
          <span>{regionSummary.total} Mağaza</span>
          <span className="text-accent">|</span>
          <span className={openCount > 0 ? 'text-warning font-black' : 'text-success font-black'}>
            {openCount} Açık Aksiyon
          </span>
        </div>
      </header>

      {/* KPI Bar — sadece dashboard */}
      {view === 'dashboard' && (
        <KPIBar
          avgCiro={regionSummary.avgCiro}
          avgConversion={regionSummary.avgConversion}
          avgUpt={regionSummary.avgUpt}
          openCount={openCount}
          closureRate={closureRate}
        />
      )}

      {/* Ana İçerik */}
      <main className="flex-1 overflow-hidden flex">
        {view === 'dashboard' && (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_380px] xl:grid-cols-[600px_1fr] bg-border gap-[1px] overflow-hidden">
            <StoreTable
              stores={filteredStores}
              selectedId={selectedStoreId}
              calcIndex={calcIndex}
              onSelect={setSelectedStoreId}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              regionFilter={regionFilter}
              onRegionChange={setRegionFilter}
              selectedStore={selectedStore}
              dailySlots={dailySlots}
              onIntervention={() => setActiveModal('intervention')}
            />
            <StoreDrillDown
              store={selectedStore}
              index={selectedIndex}
              actions={storeActions}
              onNewAction={() => setActiveModal('new_action')}
              onPrint={() => setActiveModal('print_preview')}
              onCloseAction={handleCloseAction}
              onKPIUpdate={() => setActiveModal('kpi_update')}
            />
          </div>
        )}

        {view === 'stores' && (
          <StoreManagement
            stores={stores}
            onAdd={addStore}
            onEdit={updateStore}
            onRemove={removeStore}
            onRestore={restoreStore}
            showToast={showToast}
          />
        )}

        {view === 'tracking' && (
          <TrackingModule
            stores={stores}
            allActions={allActions}
            allLogs={allLogs}
            kpiSnapshots={kpiSnapshots}
            getStoreLogs={getStoreLogs}
            getStoreSnapshots={getStoreSnapshots}
            onAddVisit={addVisitLog}
            showToast={showToast}
          />
        )}
      </main>

      <AlarmTicker stores={activeStores} />
    </div>
  );
}
