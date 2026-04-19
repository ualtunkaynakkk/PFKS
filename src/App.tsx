import { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Activity, LayoutDashboard, Store, Activity as TrackIcon } from 'lucide-react';

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
  const [selectedStoreId, setSelectedStoreId] = useState<string>('4');
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [activeModal, setActiveModal] = useState<ModalType>('none');
  const [regionFilter, setRegionFilter] = useState<RegionFilter>('Tümü');
  const [toast, setToast] = useState<string | null>(null);

  const { stores, filteredStores, regionSummary, calcIndex, addStore, updateStore, updateKPI, removeStore, restoreStore } = useStores(regionFilter);
  const { storeActions, allActions, openCount, closureRate, addAction, closeAction } = useActions(selectedStoreId);
  const { allLogs, kpiSnapshots, getStoreLogs, getStoreSnapshots, addVisitLog, addKpiSnapshot } = useVisitLogs();

  const selectedStore = useMemo(
    () => stores.find(s => s.id === selectedStoreId) ?? stores.filter(s => s.isActive)[0],
    [stores, selectedStoreId]
  );
  const selectedIndex = useMemo(() => calcIndex(selectedStore), [selectedStore, calcIndex]);
  const dailySlots = useMemo(() => getDailySlots(selectedStoreId), [selectedStoreId]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleSaveAction = async (form: NewActionForm) => {
    await addAction(form, selectedStoreId);
    setActiveModal('none');
    showToast(`Aksiyon kaydedildi — ${selectedStore.name} mağazasına iletildi.`);
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
    await updateKPI(selectedStoreId, form);
    await addKpiSnapshot({
      storeId: selectedStoreId,
      date: new Date().toISOString().split('T')[0],
      ...form,
    });
    setActiveModal('none');
    showToast(`${selectedStore.name} KPI verileri güncellendi.`);
  };

  const NAV_ITEMS = [
    { id: 'dashboard' as AppView, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'stores' as AppView, label: 'Mağaza Yönetimi', icon: Store },
    { id: 'tracking' as AppView, label: 'Takip & Geçmiş', icon: TrackIcon },
  ];

  return (
    <div className="flex flex-col h-screen overflow-hidden relative">

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -40 }} animate={{ opacity: 1, y: 20 }} exit={{ opacity: 0, y: -40 }}
            className="fixed top-0 left-1/2 -translate-x-1/2 z-[150] bg-ink text-white px-6 py-3 rounded-full shadow-2xl border border-accent font-bold text-xs flex items-center gap-2"
          >
            <Activity className="w-4 h-4 text-accent" />
            {toast}
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
      <header className="h-[50px] bg-ink text-white flex items-center justify-between px-5 border-b-2 border-accent shrink-0">
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 text-accent" />
          <h1 className="text-sm sm:text-base font-bold tracking-widest uppercase">
            PFKS <span className="text-accent opacity-50 mx-1">//</span>
            <span className="font-normal opacity-80 text-xs hidden sm:inline">Penti Bölge Yönetim Paneli</span>
          </h1>
        </div>
        {/* Navigation */}
        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setView(id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-bold uppercase transition-all ${
                view === id ? 'bg-accent text-white' : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}>
              <Icon className="w-3 h-3" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </nav>
        <div className="text-[10px] font-mono opacity-60 hidden lg:flex items-center gap-3 uppercase tracking-tighter">
          <span>{new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
          <span className="text-accent">|</span>
          <span>{regionSummary.total} Mağaza</span>
          <span className="text-accent">|</span>
          <span className={`font-black ${openCount > 0 ? 'text-warning' : 'text-success'}`}>{openCount} Açık Aksiyon</span>
        </div>
      </header>

      {/* KPI Bar — sadece dashboard'da */}
      {view === 'dashboard' && (
        <KPIBar
          avgCiro={regionSummary.avgCiro}
          avgConversion={regionSummary.avgConversion}
          avgUpt={regionSummary.avgUpt}
          openCount={openCount}
          closureRate={closureRate}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex">
        {view === 'dashboard' && (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_400px] xl:grid-cols-[650px_1fr] bg-border gap-[1px] overflow-hidden">
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

      <AlarmTicker stores={stores.filter(s => s.isActive)} />
    </div>
  );
}
