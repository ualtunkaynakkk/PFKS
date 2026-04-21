import { useState, useMemo, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Activity, LayoutDashboard, Store, BarChart2, Loader2, LogOut, ShieldCheck, Users } from 'lucide-react';

import type { RegionFilter, TabType, ModalType, NewActionForm, AppView, KPIUpdateForm } from './types';
import { getDailySlots } from './data/stores';
import { useStores, useActions, useVisitLogs } from './hooks';
import { useAuth } from './context/AuthContext';
import { hasPermission, ROLE_LABELS, ROLE_COLORS } from './types/auth';

import { LoginPage } from './components/LoginPage';
import { KPIBar } from './components/KPIBar';
import { StoreTable } from './components/StoreTable';
import { StoreDrillDown } from './components/StoreDrillDown';
import { AlarmTicker } from './components/AlarmTicker';
import { NewActionModal, InterventionModal, PrintPreviewModal } from './components/modals';
import { StoreManagement } from './components/StoreManagement';
import { KPIUpdateModal } from './components/KPIUpdateModal';
import { TrackingModule } from './components/TrackingModule';
import { UserManagement } from './components/UserManagement';

export default function App() {
  const { user, loading: authLoading, signOut } = useAuth();

  // Auth yüklenirken ekran
  if (authLoading) {
    return (
      <div className="flex flex-col h-screen bg-bg items-center justify-center gap-4">
        <Activity className="w-8 h-8 text-accent" />
        <Loader2 className="w-6 h-6 text-slate-300 animate-spin" />
      </div>
    );
  }

  // Giriş yapılmamışsa login sayfası
  if (!user) return <LoginPage />;

  // Aktif rol
  const role = user.profile.role;

  return <AuthenticatedApp user={user} role={role} signOut={signOut} />;
}

// ─── Ana Uygulama (Giriş Sonrası) ────────────────────────────────────────────
import type { AuthUser, PfksRole } from './types/auth';

function AuthenticatedApp({ user, role, signOut }: {
  user: AuthUser; role: PfksRole; signOut: () => void;
}) {
  const [view, setView] = useState<AppView>('dashboard');
  const [selectedStoreId, setSelectedStoreId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [activeModal, setActiveModal] = useState<ModalType>('none');
  const [regionFilter, setRegionFilter] = useState<RegionFilter>('Tümü');
  const [toast, setToast] = useState<string | null>(null);

  const {
    stores, filteredStores, regionSummary,
    loading: storesLoading, error: storesError,
    calcIndex, addStore, updateStore, updateKPI, removeStore, restoreStore,
  } = useStores(regionFilter);

  // Mağaza müdürü: sadece kendi mağazası
  const visibleFilteredStores = useMemo(() => {
    if (role === 'magaza_muduru' && user.profile.storeId) {
      return filteredStores.filter(s => s.id === user.profile.storeId);
    }
    return filteredStores;
  }, [filteredStores, role, user.profile.storeId]);

  const activeStores = useMemo(() => stores.filter(s => s.isActive), [stores]);

  useEffect(() => {
    if (activeStores.length > 0 && !selectedStoreId) {
      // Mağaza müdürü: kendi mağazası
      if (role === 'magaza_muduru' && user.profile.storeId) {
        setSelectedStoreId(user.profile.storeId);
      } else {
        const zorlu = activeStores.find(s => s.code === 'M402');
        setSelectedStoreId(zorlu?.id ?? activeStores[0].id);
      }
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

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleSaveAction = async (form: NewActionForm) => {
    if (!selectedStore || !hasPermission(role, 'action_add')) return;
    await addAction(form, selectedStoreId);
    setActiveModal('none');
    showToast(`Aksiyon kaydedildi — ${selectedStore.name}`);
  };

  const handleIntervention = (note: string) => {
    setActiveModal('none');
    showToast(`Müdahale talimatı gönderildi${note ? ` — ${note.slice(0, 50)}` : ''}`);
  };

  const handleCloseAction = async (id: string) => {
    if (!hasPermission(role, 'action_close')) return;
    await closeAction(id);
    showToast('Aksiyon kapatıldı.');
  };

  const handleKPIUpdate = async (form: KPIUpdateForm) => {
    if (!selectedStore || !hasPermission(role, 'kpi_update')) return;
    await updateKPI(selectedStoreId, form);
    await addKpiSnapshot({
      storeId: selectedStoreId,
      date: new Date().toISOString().split('T')[0],
      ...form,
    });
    setActiveModal('none');
    showToast(`${selectedStore.name} KPI güncellendi.`);
  };

  // ── Loading / Error ────────────────────────────────────────────────────────
  if (storesLoading) {
    return (
      <div className="flex flex-col h-screen bg-bg">
        <AppHeader user={user} role={role} signOut={signOut} view={view} setView={setView} openCount={openCount} total={regionSummary.total} />
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
        <AppHeader user={user} role={role} signOut={signOut} view={view} setView={setView} openCount={openCount} total={regionSummary.total} />
        <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6 text-center">
          <p className="text-sm font-bold text-danger">Bağlantı hatası</p>
          <p className="text-xs text-slate-400">{storesError}</p>
          <button onClick={() => window.location.reload()} className="mt-2 px-4 py-2 bg-accent text-white text-xs font-bold rounded uppercase">Yeniden Dene</button>
        </div>
      </div>
    );
  }

  // Seçili mağaza yok ama sistem çalışmaya devam eder
  // selectedStore null iken dashboard boş mesaj gösterir, diğer sekmeler çalışır

  // ── Render ─────────────────────────────────────────────────────────────────
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
        {activeModal === 'new_action' && hasPermission(role, 'action_add') && (
          <NewActionModal store={selectedStore} onClose={() => setActiveModal('none')} onSave={handleSaveAction} />
        )}
        {activeModal === 'intervention' && hasPermission(role, 'action_add') && (
          <InterventionModal store={selectedStore} onClose={() => setActiveModal('none')} onSend={handleIntervention} />
        )}
        {activeModal === 'print_preview' && (
          <PrintPreviewModal store={selectedStore} index={selectedIndex} onClose={() => setActiveModal('none')} />
        )}
        {activeModal === 'kpi_update' && hasPermission(role, 'kpi_update') && (
          <KPIUpdateModal store={selectedStore} onClose={() => setActiveModal('none')} onSave={handleKPIUpdate} />
        )}
      </AnimatePresence>

      {/* Header */}
      <AppHeader
        user={user} role={role} signOut={signOut}
        view={view} setView={setView}
        openCount={openCount} total={regionSummary.total}
      />

      {/* KPI Bar */}
      {view === 'dashboard' && hasPermission(role, 'kpi_view') && (
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
        {view === 'dashboard' && !selectedStore && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-2">
              <Store className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-sm font-bold text-slate-600">Henüz aktif mağaza yok</p>
            <p className="text-xs text-slate-400 max-w-xs">
              Mağaza Yönetimi sekmesinden yeni mağaza ekleyebilir veya pasif mağazaları aktif edebilirsiniz.
            </p>
            {hasPermission(role, 'store_add') && (
              <button onClick={() => setView('stores')}
                className="mt-2 px-5 py-2.5 bg-accent text-white text-xs font-bold rounded uppercase hover:bg-blue-700 transition-colors flex items-center gap-2">
                <Store className="w-3.5 h-3.5" /> Mağaza Yönetimi
              </button>
            )}
          </div>
        )}

        {view === 'dashboard' && selectedStore && (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_380px] xl:grid-cols-[600px_1fr] bg-border gap-[1px] overflow-hidden">
            <StoreTable
              stores={visibleFilteredStores}
              selectedId={selectedStoreId}
              calcIndex={calcIndex}
              onSelect={setSelectedStoreId}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              regionFilter={regionFilter}
              onRegionChange={setRegionFilter}
              selectedStore={selectedStore}
              dailySlots={dailySlots}
              onIntervention={() => hasPermission(role, 'action_add') && setActiveModal('intervention')}
              showRegionFilter={role !== 'magaza_muduru'}
            />
            <StoreDrillDown
              store={selectedStore}
              index={selectedIndex}
              actions={storeActions}
              onNewAction={() => setActiveModal('new_action')}
              onPrint={() => setActiveModal('print_preview')}
              onCloseAction={handleCloseAction}
              onKPIUpdate={() => setActiveModal('kpi_update')}
              role={role}
            />
          </div>
        )}

        {view === 'stores' && hasPermission(role, 'store_view') && (
          <StoreManagement
            stores={stores}
            onAdd={addStore}
            onEdit={updateStore}
            onRemove={removeStore}
            onRestore={restoreStore}
            showToast={showToast}
            canAdd={hasPermission(role, 'store_add')}
            canEdit={hasPermission(role, 'store_edit')}
            canDelete={hasPermission(role, 'store_delete')}
          />
        )}

        {view === 'tracking' && hasPermission(role, 'tracking_view') && (
          <TrackingModule
            stores={stores}
            allActions={allActions}
            allLogs={allLogs}
            kpiSnapshots={kpiSnapshots}
            getStoreLogs={getStoreLogs}
            getStoreSnapshots={getStoreSnapshots}
            onAddVisit={addVisitLog}
            showToast={showToast}
            canAddVisit={hasPermission(role, 'visit_add')}
          />
        )}

        {view === 'users' && role === 'admin' && (
          <UserManagement showToast={showToast} />
        )}

        {/* Yetkisiz erişim */}
        {(
          (view === 'stores' && !hasPermission(role, 'store_view')) ||
          (view === 'tracking' && !hasPermission(role, 'tracking_view'))
        ) && (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center p-6">
            <ShieldCheck className="w-10 h-10 text-slate-300" />
            <p className="text-sm font-bold text-slate-400">Bu sayfaya erişim yetkiniz yok.</p>
          </div>
        )}
      </main>

      <AlarmTicker stores={activeStores} />
    </div>
  );
}

// ─── Header Component ─────────────────────────────────────────────────────────
function AppHeader({ user, role, signOut, view, setView, openCount, total }: {
  user: AuthUser; role: PfksRole;
  signOut: () => void;
  view: AppView; setView: (v: AppView) => void;
  openCount: number; total: number;
}) {
  const NAV_ITEMS = [
    { id: 'dashboard' as AppView, label: 'Dashboard',       icon: LayoutDashboard, permission: 'store_view' as const },
    { id: 'stores'   as AppView, label: 'Mağazalar',        icon: Store,            permission: 'store_view' as const },
    { id: 'tracking' as AppView, label: 'Takip',            icon: BarChart2,        permission: 'tracking_view' as const },
    { id: 'users'    as AppView, label: 'Kullanıcılar',     icon: Users,            permission: 'user_manage' as const },
  ];

  return (
    <header className="h-[50px] bg-ink text-white flex items-center justify-between px-4 border-b-2 border-accent shrink-0">
      <div className="flex items-center gap-2.5">
        <Activity className="w-4 h-4 text-accent shrink-0" />
        <h1 className="text-sm font-bold tracking-widest uppercase hidden sm:block">
          PFKS <span className="text-accent opacity-40 mx-1">//</span>
        </h1>
      </div>

      {/* Nav */}
      <nav className="flex items-center gap-0.5">
        {NAV_ITEMS.filter(item => hasPermission(role, item.permission)).map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setView(id)} title={label}
            className={`flex items-center gap-1.5 px-3 py-2 rounded text-[10px] font-bold uppercase transition-all ${
              view === id ? 'bg-accent text-white' : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}>
            <Icon className="w-4 h-4" />
            <span className="hidden md:inline">{label}</span>
          </button>
        ))}
      </nav>

      {/* Kullanıcı */}
      <div className="flex items-center gap-2">
        <div className="hidden sm:flex flex-col items-end">
          <span className="text-[10px] font-bold text-white/80 leading-none">{user.profile.fullName}</span>
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded mt-0.5 ${ROLE_COLORS[role]}`}>
            {ROLE_LABELS[role]}
          </span>
        </div>
        <button onClick={signOut} title="Çıkış Yap"
          className="p-2 rounded text-white/60 hover:text-white hover:bg-white/10 transition-colors">
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
