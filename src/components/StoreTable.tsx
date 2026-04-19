import { motion, AnimatePresence } from 'motion/react';
import { Store, ArrowRight, AlertCircle, Clock } from 'lucide-react';
import type { StoreData, StoreStatus, RegionFilter, TabType, DailySlot } from '../types';

// ─── Status Indicator ─────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<StoreStatus, { color: string; label: string }> = {
  success: { color: 'bg-success', label: 'KRİTİK BAŞARI' },
  stable:  { color: 'bg-accent',   label: 'STABİL' },
  warning: { color: 'bg-warning',  label: 'TAKİPTE' },
  danger:  { color: 'bg-danger',   label: 'RİSKLİ' },
};

export function StatusIndicator({ status }: { status: StoreStatus }) {
  const { color, label } = STATUS_CONFIG[status];
  return (
    <div className="flex items-center">
      <span className={`status-dot ${color}`} />
      <span className="text-[10px] sm:text-xs font-semibold">{label}</span>
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
        <button
          key={r}
          onClick={() => onChange(r)}
          className={`px-2.5 py-1 text-[9px] font-bold uppercase rounded border transition-all ${
            active === r
              ? 'bg-accent text-white border-accent'
              : 'bg-white text-slate-500 border-border hover:bg-slate-50'
          }`}
        >
          {r}
        </button>
      ))}
    </div>
  );
}

// ─── Store Table ──────────────────────────────────────────────────────────────
interface StoreTableProps {
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
  selectedStore, dailySlots, onIntervention,
}: StoreTableProps) {
  return (
    <div className="bg-panel flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3 border-b border-border bg-panel-header flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xs uppercase font-bold text-slate-600 flex items-center gap-2">
          <Store className="w-3.5 h-3.5" /> Mağaza Performans Matrisi
        </h2>
        <div className="flex gap-2 flex-wrap">
          <RegionFilterBar active={regionFilter} onChange={onRegionChange} />
          <div className="w-px bg-border mx-1 hidden sm:block" />
          {(['overview', 'daily'] as TabType[]).map(tab => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`px-3 py-1 text-[10px] font-bold uppercase rounded border transition-all ${
                activeTab === tab ? 'bg-ink text-white border-ink' : 'bg-white text-slate-600 border-border hover:bg-slate-50'
              }`}
            >
              {tab === 'overview' ? 'Genel Bakış' : 'Günlük Tempo'}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-auto bg-white">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' ? (
            <motion.div key="overview" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              <table className="w-full border-collapse text-[11px]">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-table-header border-b border-border shadow-sm">
                    {['Durum', 'Mağaza', 'Endeks', 'Ciro %', 'FBA', 'Dönüşüm', 'YDS', ''].map(h => (
                      <th key={h} className={`py-2.5 px-3 font-bold text-slate-500 uppercase ${h === '' || h === 'Durum' || h === 'Mağaza' ? 'text-left' : 'text-right'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stores.map(store => {
                    const idx = calcIndex(store);
                    return (
                      <tr
                        key={store.id}
                        onClick={() => onSelect(store.id)}
                        className={`cursor-pointer border-b border-border transition-colors group ${
                          selectedId === store.id ? 'bg-blue-50/60 border-l-2 border-l-accent' : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="py-3 px-3"><StatusIndicator status={store.status} /></td>
                        <td className="py-3 px-3 font-bold text-ink">
                          <span className="font-mono text-[10px] text-slate-400 mr-1">{store.code}</span>
                          {store.name}
                          {store.status === 'danger' && <AlertCircle className="inline-block ml-1.5 w-3 h-3 text-danger animate-pulse" />}
                        </td>
                        <td className={`py-3 px-3 text-right font-mono font-black ${idx < 70 ? 'text-danger' : idx < 85 ? 'text-warning' : 'text-success'}`}>
                          {idx}
                        </td>
                        <td className={`py-3 px-3 text-right font-mono font-bold ${store.ciroGerc < 90 ? 'text-danger' : store.ciroGerc > 105 ? 'text-success' : 'text-slate-700'}`}>
                          %{store.ciroGerc}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-slate-700">{store.upt.toFixed(2)}</td>
                        <td className="py-3 px-3 text-right font-mono text-slate-700">%{store.conversion.toFixed(1)}</td>
                        <td className={`py-3 px-3 text-right font-bold ${store.yds < 7 ? 'text-danger' : store.yds > 8.5 ? 'text-success' : 'text-slate-700'}`}>
                          {store.yds}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <ArrowRight className={`w-3.5 h-3.5 transition-all ${selectedId === store.id ? 'translate-x-1 text-accent opacity-100' : 'text-slate-300 opacity-0 group-hover:opacity-100'}`} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </motion.div>
          ) : (
            <motion.div key="daily" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold text-ink uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-4 h-4 text-accent" /> {selectedStore.name} // Günlük Tempo
                </h3>
                <div className="text-[10px] font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded">
                  HEDEF: ₺{dailySlots.reduce((s, d) => s + d.target, 0).toLocaleString('tr-TR')}
                </div>
              </div>

              <div className="space-y-4">
                {dailySlots.map((slot, i) => {
                  const pct = slot.actual ? Math.min(140, Math.round((slot.actual / slot.target) * 100)) : 0;
                  const color = !slot.actual ? 'bg-slate-300' : pct >= 100 ? 'bg-success' : pct >= 80 ? 'bg-warning' : 'bg-danger';
                  const label = !slot.actual ? 'BEKLENIYOR' : pct >= 100 ? `+%${pct - 100}` : `-%${100 - pct}`;
                  const textColor = !slot.actual ? 'text-slate-400' : pct >= 100 ? 'text-success' : pct >= 80 ? 'text-warning' : 'text-danger';
                  return (
                    <div key={i} className="flex items-center gap-4 bg-slate-50 p-4 rounded border border-border">
                      <div className="w-32 font-mono font-bold text-xs text-slate-500">{slot.time}</div>
                      <div className="flex-1">
                        <div className="flex justify-between text-[10px] font-bold mb-1.5">
                          <span className="text-slate-400">GERÇ: {slot.actual ? `₺${slot.actual.toLocaleString('tr-TR')}` : '—'}</span>
                          <span className="text-slate-400">HEDEF: ₺{slot.target.toLocaleString('tr-TR')}</span>
                        </div>
                        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                            className={`h-full rounded-full ${color}`}
                          />
                        </div>
                      </div>
                      <div className={`w-24 text-right font-mono font-bold text-xs ${textColor}`}>{label}</div>
                    </div>
                  );
                })}
              </div>

              {selectedStore.status === 'danger' && (
                <div className="mt-6 p-4 border border-accent border-dashed rounded bg-blue-50/30 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-black text-accent uppercase">Sistem Teşhisi</div>
                    <div className="text-xs font-bold text-slate-700 mt-1">Kritik sapma tespit edildi. Müdahale önerilir.</div>
                  </div>
                  <button onClick={onIntervention} className="px-4 py-2 bg-danger text-white text-[10px] font-bold rounded hover:bg-red-700 transition-colors">
                    MÜDAHALE ET
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Legend */}
      <div className="p-3 bg-slate-50 border-t border-border flex justify-between items-center shrink-0">
        <div className="flex gap-4">
          {[['bg-success', 'BAŞARI'], ['bg-warning', 'TAKİP'], ['bg-danger', 'RİSK']].map(([c, l]) => (
            <div key={l} className="flex items-center gap-1.5">
              <div className={`w-2 h-2 ${c} rounded-full`} />
              <span className="text-[9px] font-bold text-slate-500">{l}</span>
            </div>
          ))}
        </div>
        <span className="text-[9px] font-mono text-slate-400">
          {stores.length} MAĞAZA GÖSTERİLİYOR
        </span>
      </div>
    </div>
  );
}
