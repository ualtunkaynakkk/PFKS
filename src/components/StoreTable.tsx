import { motion, AnimatePresence } from 'motion/react';
import { Store, AlertCircle, Clock, ChevronRight } from 'lucide-react';
import type { StoreData, StoreStatus, RegionFilter, TabType, DailySlot } from '../types';

// ─── Status Dot ───────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<StoreStatus, { color: string; label: string; short: string }> = {
  success: { color: 'bg-success', label: 'BAŞARI',  short: '✓' },
  stable:  { color: 'bg-accent',  label: 'STABİL',  short: '–' },
  warning: { color: 'bg-warning', label: 'TAKİP',   short: '!' },
  danger:  { color: 'bg-danger',  label: 'RİSKLİ',  short: '✕' },
};

export function StatusIndicator({ status }: { status: StoreStatus }) {
  const { color, label } = STATUS_CONFIG[status];
  return (
    <div className="flex items-center gap-1.5">
      <span className={`w-2 h-2 rounded-full shrink-0 ${color}`} />
      <span className="text-[10px] font-semibold hidden sm:inline">{label}</span>
    </div>
  );
}

// ─── Region Filter ────────────────────────────────────────────────────────────
const REGIONS: RegionFilter[] = ['Tümü', 'Merkez', 'Asya', 'Anadolu'];

interface RegionFilterBarProps {
  active: RegionFilter;
  onChange: (r: RegionFilter) => void;
}

export function RegionFilterBar({ active, onChange }: RegionFilterBarProps) {
  return (
    <div className="flex gap-1">
      {REGIONS.map(r => (
        <button key={r} onClick={() => onChange(r)}
          className={`px-2 py-1 text-[9px] font-bold uppercase rounded border transition-all ${
            active === r ? 'bg-accent text-white border-accent' : 'bg-white text-slate-500 border-border'
          }`}>
          {r}
        </button>
      ))}
    </div>
  );
}

// ─── Mobile Store Card ────────────────────────────────────────────────────────
function StoreCard({ store, calcIndex, selected, onSelect }: {
  store: StoreData; calcIndex: (s: StoreData) => number;
  selected: boolean; onSelect: () => void; key?: string;
}) {
  const idx = calcIndex(store);
  const { color } = STATUS_CONFIG[store.status];
  return (
    <button onClick={onSelect}
      className={`w-full text-left p-3 border-b border-border flex items-center gap-3 transition-colors ${
        selected ? 'bg-blue-50 border-l-2 border-l-accent' : 'bg-white active:bg-slate-50'
      }`}>
      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${color}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-slate-400">{store.code}</span>
          <span className="font-bold text-xs text-ink truncate">{store.name}</span>
          {store.status === 'danger' && <AlertCircle className="w-3 h-3 text-danger shrink-0 animate-pulse" />}
        </div>
        <div className="flex gap-3 mt-0.5">
          <span className={`text-[10px] font-mono font-bold ${store.ciroGerc >= 100 ? 'text-success' : store.ciroGerc < 90 ? 'text-danger' : 'text-warning'}`}>
            Ciro %{store.ciroGerc}
          </span>
          <span className="text-[10px] font-mono text-slate-400">Dön. %{store.conversion.toFixed(1)}</span>
          <span className="text-[10px] font-mono text-slate-400">YDS {store.yds}</span>
        </div>
      </div>
      <div className="text-right shrink-0">
        <div className={`text-base font-black font-mono ${idx >= 85 ? 'text-success' : idx < 70 ? 'text-danger' : 'text-warning'}`}>
          {idx}
        </div>
        <ChevronRight className={`w-3.5 h-3.5 mt-0.5 mx-auto ${selected ? 'text-accent' : 'text-slate-300'}`} />
      </div>
    </button>
  );
}

// ─── Desktop Table Row ────────────────────────────────────────────────────────
function StoreTableRow({ store, calcIndex, selected, onSelect }: {
  store: StoreData; calcIndex: (s: StoreData) => number;
  selected: boolean; onSelect: () => void; key?: string;
}) {
  const idx = calcIndex(store);
  return (
    <tr onClick={onSelect}
      className={`cursor-pointer border-b border-border transition-colors group ${
        selected ? 'bg-blue-50/60 border-l-2 border-l-accent' : 'hover:bg-slate-50'
      }`}>
      <td className="py-2.5 px-3"><StatusIndicator status={store.status} /></td>
      <td className="py-2.5 px-3 font-bold text-ink whitespace-nowrap">
        <span className="font-mono text-[10px] text-slate-400 mr-1">{store.code}</span>
        {store.name}
        {store.status === 'danger' && <AlertCircle className="inline ml-1.5 w-3 h-3 text-danger animate-pulse" />}
      </td>
      <td className={`py-2.5 px-3 text-right font-black font-mono ${idx >= 85 ? 'text-success' : idx < 70 ? 'text-danger' : 'text-warning'}`}>
        {idx}
      </td>
      <td className={`py-2.5 px-3 text-right font-mono font-bold ${store.ciroGerc >= 100 ? 'text-success' : store.ciroGerc < 90 ? 'text-danger' : 'text-warning'}`}>
        %{store.ciroGerc}
      </td>
      <td className="py-2.5 px-3 text-right font-mono text-slate-700">{store.upt.toFixed(2)}</td>
      <td className="py-2.5 px-3 text-right font-mono text-slate-700">%{store.conversion.toFixed(1)}</td>
      <td className={`py-2.5 px-3 text-right font-bold ${store.yds >= 8.5 ? 'text-success' : store.yds < 7 ? 'text-danger' : 'text-warning'}`}>
        {store.yds}
      </td>
    </tr>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
interface StoreTableProps {
  showRegionFilter?: boolean;
  stores: StoreData[];
  selectedId: string;
  calcIndex: (s: StoreData) => number;
  onSelect: (id: string) => void;
  activeTab: TabType;
  onTabChange: (t: TabType) => void;
  regionFilter: RegionFilter;
  onRegionChange: (r: RegionFilter) => void;
  selectedStore: StoreData;
  dailySlots: DailySlot[];
  onIntervention: () => void;
}

export function StoreTable({
  stores, selectedId, calcIndex, onSelect,
  activeTab, onTabChange,
  regionFilter, onRegionChange,
  selectedStore, dailySlots, onIntervention, showRegionFilter = true,
}: StoreTableProps) {
  return (
    <div className="bg-panel flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-border bg-panel-header flex flex-wrap items-center justify-between gap-2 shrink-0">
        <h2 className="text-[10px] uppercase font-bold text-slate-600 flex items-center gap-1.5">
          <Store className="w-3 h-3" /> Mağaza Performans Matrisi
        </h2>
        <div className="flex items-center gap-1.5 flex-wrap">
          {showRegionFilter && <RegionFilterBar active={regionFilter} onChange={onRegionChange} />}
          <div className="flex gap-1">
            {(['overview', 'daily'] as TabType[]).map(tab => (
              <button key={tab} onClick={() => onTabChange(tab)}
                className={`px-2.5 py-1 text-[9px] font-bold uppercase rounded border transition-all ${
                  activeTab === tab ? 'bg-ink text-white border-ink' : 'bg-white text-slate-600 border-border'
                }`}>
                {tab === 'overview' ? 'Genel' : 'Tempo'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' ? (
            <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              {/* Mobil: kart görünümü */}
              <div className="sm:hidden">
                {stores.map(store => (
                  <StoreCard key={store.id} store={store} calcIndex={calcIndex}
                    selected={selectedId === store.id} onSelect={() => onSelect(store.id)} />
                ))}
              </div>
              {/* Desktop: tablo görünümü */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full border-collapse text-[11px]">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-table-header border-b border-border">
                      {['Durum', 'Mağaza', 'Endeks', 'Ciro %', 'FBA', 'Dönüşüm', 'YDS'].map(h => (
                        <th key={h} className={`py-2.5 px-3 font-bold text-slate-500 uppercase text-[10px] whitespace-nowrap ${
                          h === 'Durum' || h === 'Mağaza' ? 'text-left' : 'text-right'
                        }`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {stores.map(store => (
                      <StoreTableRow key={store.id} store={store} calcIndex={calcIndex}
                        selected={selectedId === store.id} onSelect={() => onSelect(store.id)} />
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          ) : (
            <motion.div key="daily" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-ink uppercase flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-accent" />
                  <span className="truncate">{selectedStore.name} // Günlük Tempo</span>
                </h3>
                <div className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded shrink-0">
                  Hedef: ₺{dailySlots.reduce((s, d) => s + d.target, 0).toLocaleString('tr-TR')}
                </div>
              </div>

              <div className="space-y-3">
                {dailySlots.map((slot, i) => {
                  const pct = slot.actual ? Math.min(140, Math.round((slot.actual / slot.target) * 100)) : 0;
                  const color = !slot.actual ? 'bg-slate-300' : pct >= 100 ? 'bg-success' : pct >= 80 ? 'bg-warning' : 'bg-danger';
                  const label = !slot.actual ? 'BEKL.' : pct >= 100 ? `+%${pct - 100}` : `-%${100 - pct}`;
                  const textColor = !slot.actual ? 'text-slate-400' : pct >= 100 ? 'text-success' : pct >= 80 ? 'text-warning' : 'text-danger';
                  return (
                    <div key={i} className="bg-slate-50 p-3 rounded border border-border">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-mono font-bold text-[10px] text-slate-500">{slot.time}</span>
                        <span className={`font-mono font-bold text-xs ${textColor}`}>{label}</span>
                      </div>
                      <div className="flex justify-between text-[9px] font-bold mb-1.5">
                        <span className="text-slate-400">
                          {slot.actual ? `₺${slot.actual.toLocaleString('tr-TR')}` : '—'}
                        </span>
                        <span className="text-slate-400">Hedef: ₺{slot.target.toLocaleString('tr-TR')}</span>
                      </div>
                      <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.6, ease: 'easeOut' }}
                          className={`h-full rounded-full ${color}`} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {selectedStore.status === 'danger' && (
                <div className="mt-4 p-3 border border-accent border-dashed rounded bg-blue-50/30 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[10px] font-black text-accent uppercase">Sistem Teşhisi</div>
                    <div className="text-xs font-bold text-slate-700 mt-0.5">Kritik sapma — müdahale önerilir.</div>
                  </div>
                  <button onClick={onIntervention}
                    className="px-3 py-1.5 bg-danger text-white text-[10px] font-bold rounded hover:bg-red-700 transition-colors shrink-0">
                    MÜDAHALE
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Legend */}
      <div className="px-3 py-2 bg-slate-50 border-t border-border flex justify-between items-center shrink-0">
        <div className="flex gap-3">
          {[['bg-success', 'BAŞARI'], ['bg-warning', 'TAKİP'], ['bg-danger', 'RİSK']].map(([c, l]) => (
            <div key={l} className="flex items-center gap-1">
              <div className={`w-1.5 h-1.5 ${c} rounded-full`} />
              <span className="text-[9px] font-bold text-slate-500 hidden xs:inline">{l}</span>
            </div>
          ))}
        </div>
        <span className="text-[9px] font-mono text-slate-400">{stores.length} MAĞAZA</span>
      </div>
    </div>
  );
}
