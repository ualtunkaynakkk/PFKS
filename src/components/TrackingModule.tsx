import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Activity, ClipboardList, MapPin, TrendingUp, TrendingDown,
  Plus, X, Save, Calendar, Clock, CheckCircle2, AlertCircle,
  AlertTriangle, ChevronDown, ChevronUp, Filter
} from 'lucide-react';
import type { StoreData, Action, VisitLog, KPISnapshot } from '../types';

// ─── Ziyaret Kayıt Formu ──────────────────────────────────────────────────────
interface VisitLogFormProps {
  stores: StoreData[];
  onSave: (log: Omit<VisitLog, 'id' | 'createdAt'>) => void;
  onClose: () => void;
}

function VisitLogForm({ stores, onSave, onClose }: VisitLogFormProps) {
  const [form, setForm] = useState({
    storeId: stores[0]?.id ?? '',
    date: new Date().toISOString().split('T')[0],
    type: 'Rutin' as VisitLog['type'],
    notes: '',
    findings: '',
    nextVisit: '',
  });

  const valid = form.storeId && form.date && form.notes.trim();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }}
        className="bg-white rounded-lg shadow-2xl w-full max-w-lg border border-border overflow-hidden">
        <div className="bg-panel-header px-6 py-4 border-b border-border flex items-center justify-between">
          <h3 className="text-sm font-bold text-ink uppercase tracking-wider">Ziyaret Kaydı Ekle</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-ink p-1 rounded hover:bg-slate-100"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Mağaza</label>
              <select value={form.storeId} onChange={e => setForm(f => ({ ...f, storeId: e.target.value }))} className="input">
                {stores.filter(s => s.isActive).map(s => (
                  <option key={s.id} value={s.id}>{s.code} — {s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Ziyaret Tarihi</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="input" />
            </div>
            <div>
              <label className="label">Ziyaret Tipi</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as VisitLog['type'] }))} className="input">
                {['Rutin', 'Acil', 'Denetim', 'Eğitim'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Ziyaret Notları *</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              className="input h-20 resize-none" placeholder="Ziyaret sırasında yapılan gözlemler ve görüşmeler..." />
          </div>
          <div>
            <label className="label">Bulgular & Tespitler</label>
            <textarea value={form.findings} onChange={e => setForm(f => ({ ...f, findings: e.target.value }))}
              className="input h-16 resize-none" placeholder="Kritik bulgular, olumlu/olumsuz tespitler..." />
          </div>
          <div>
            <label className="label">Sonraki Ziyaret Tarihi</label>
            <input type="date" value={form.nextVisit} onChange={e => setForm(f => ({ ...f, nextVisit: e.target.value }))} className="input" />
          </div>
        </div>
        <div className="bg-slate-50 px-6 py-4 border-t border-border flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-xs font-bold text-slate-500 uppercase">İptal</button>
          <button onClick={() => valid && onSave(form)} disabled={!valid}
            className="px-4 py-2 bg-accent text-white text-xs font-bold rounded uppercase flex items-center gap-1.5 disabled:opacity-40 hover:bg-blue-700 transition-colors">
            <Save className="w-3.5 h-3.5" /> Kaydet
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Mini Trend Grafik ────────────────────────────────────────────────────────
function MiniTrend({ snapshots, field, label }: { snapshots: KPISnapshot[]; field: keyof KPISnapshot; label: string }) {
  if (snapshots.length < 2) return null;
  const vals = snapshots.map(s => s[field] as number);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const range = max - min || 1;
  const last = vals[vals.length - 1];
  const prev = vals[vals.length - 2];
  const diff = last - prev;
  const w = 80, h = 28;

  const points = vals.map((v, i) => {
    const x = (i / (vals.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
      <span className="text-[10px] text-slate-500 w-32">{label}</span>
      <svg width={w} height={h} className="shrink-0">
        <polyline points={points} fill="none" stroke="#2563eb" strokeWidth="1.5" strokeLinejoin="round" />
        {vals.map((v, i) => {
          const x = (i / (vals.length - 1)) * w;
          const y = h - ((v - min) / range) * h;
          return <circle key={i} cx={x} cy={y} r="2" fill="#2563eb" />;
        })}
      </svg>
      <span className="font-mono font-bold text-xs text-ink w-10 text-right">{last}</span>
      <span className={`text-[10px] font-bold w-10 ${diff > 0 ? 'text-success' : diff < 0 ? 'text-danger' : 'text-slate-300'}`}>
        {diff > 0 ? '+' : ''}{diff !== 0 ? diff.toFixed(1) : '—'}
      </span>
    </div>
  );
}

// ─── Ana Takip Modülü ─────────────────────────────────────────────────────────
interface TrackingModuleProps {
  canAddVisit?: boolean;
  stores: StoreData[];
  allActions: Action[];
  allLogs: VisitLog[];
  kpiSnapshots: KPISnapshot[];
  getStoreLogs: (id: string) => VisitLog[];
  getStoreSnapshots: (id: string) => KPISnapshot[];
  onAddVisit: (log: Omit<VisitLog, 'id' | 'createdAt'>) => void;
  showToast: (msg: string) => void;
}

export function TrackingModule({
  stores, allActions, allLogs, kpiSnapshots,
  getStoreLogs, getStoreSnapshots, onAddVisit, showToast, canAddVisit = false,
}: TrackingModuleProps) {
  const [tab, setTab] = useState<'actions' | 'visits' | 'trends'>('actions');
  const [showVisitForm, setShowVisitForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'Tümü' | 'Açık' | 'Gecikmiş' | 'Kapatıldı'>('Tümü');
  const [filterStore, setFilterStore] = useState<string>('Tümü');
  const [expandedStore, setExpandedStore] = useState<string | null>(null);

  const getStoreName = (id: string) => {
    const s = stores.find(x => x.id === id);
    return s ? `${s.code} — ${s.name}` : id;
  };

  const filteredActions = allActions.filter(a => {
    const matchStatus = filterStatus === 'Tümü' || a.status === filterStatus;
    const matchStore = filterStore === 'Tümü' || a.storeId === filterStore;
    return matchStatus && matchStore;
  });

  const VISIT_TYPE_COLORS: Record<string, string> = {
    Rutin: 'bg-blue-100 text-accent',
    Acil: 'bg-red-100 text-danger',
    Denetim: 'bg-amber-100 text-warning',
    Eğitim: 'bg-green-100 text-success',
  };

  const activeStores = stores.filter(s => s.isActive);

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      {/* Tab Header */}
      <div className="px-5 py-3 border-b border-border bg-panel-header flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className="flex gap-1">
          {([
            { id: 'actions', label: 'Aksiyon Geçmişi', icon: ClipboardList },
            { id: 'visits', label: 'Ziyaret Kayıtları', icon: MapPin },
            { id: 'trends', label: 'KPI Trendleri', icon: TrendingUp },
          ] as const).map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`px-3 py-1.5 text-[10px] font-bold uppercase rounded flex items-center gap-1.5 transition-all ${
                tab === id ? 'bg-ink text-white' : 'bg-white text-slate-500 border border-border hover:bg-slate-50'
              }`}>
              <Icon className="w-3 h-3" />{label}
            </button>
          ))}
        </div>
        {tab === 'visits' && canAddVisit && (
          <button onClick={() => setShowVisitForm(true)}
            className="px-3 py-1.5 bg-accent text-white text-[10px] font-bold rounded uppercase flex items-center gap-1.5 hover:bg-blue-700 transition-colors">
            <Plus className="w-3 h-3" /> Ziyaret Ekle
          </button>
        )}
      </div>

      {/* ── Aksiyon Geçmişi ── */}
      {tab === 'actions' && (
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Filters */}
          <div className="px-5 py-2.5 border-b border-border bg-white flex flex-wrap gap-3 items-center shrink-0">
            <Filter className="w-3 h-3 text-slate-400" />
            <div className="flex gap-1">
              {(['Tümü', 'Açık', 'Gecikmiş', 'Kapatıldı'] as const).map(s => (
                <button key={s} onClick={() => setFilterStatus(s)}
                  className={`px-2.5 py-1 text-[9px] font-bold uppercase rounded border transition-all ${
                    filterStatus === s ? 'bg-ink text-white border-ink' : 'bg-white text-slate-500 border-border'
                  }`}>{s}</button>
              ))}
            </div>
            <select value={filterStore} onChange={e => setFilterStore(e.target.value)}
              className="text-[10px] border border-border rounded px-2 py-1 outline-none bg-white text-slate-600">
              <option value="Tümü">Tüm Mağazalar</option>
              {activeStores.map(s => <option key={s.id} value={s.id}>{s.code} — {s.name}</option>)}
            </select>
            <span className="text-[10px] text-slate-400 font-mono ml-auto">{filteredActions.length} kayıt</span>
          </div>

          <div className="flex-1 overflow-auto bg-white">
            <table className="w-full border-collapse text-[11px]">
              <thead className="sticky top-0 z-10">
                <tr className="bg-table-header border-b border-border">
                  {['Durum', 'Mağaza', 'Aksiyon', 'Problem Alanı', 'Sorumlu', 'Termin', 'Kapatılma'].map(h => (
                    <th key={h} className="py-2.5 px-3 text-left font-bold text-slate-500 uppercase text-[10px] whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredActions.map(action => (
                  <tr key={action.id} className="border-b border-border hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3">
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                        action.status === 'Gecikmiş' ? 'bg-red-100 text-danger' :
                        action.status === 'Kapatıldı' ? 'bg-green-100 text-success' :
                        'bg-slate-100 text-slate-600'
                      }`}>{action.status}</span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[10px] text-slate-500 whitespace-nowrap">{getStoreName(action.storeId)}</td>
                    <td className="py-2.5 px-3 font-medium text-ink max-w-[200px]">{action.title}</td>
                    <td className="py-2.5 px-3">
                      <span className="bg-blue-50 text-accent text-[9px] font-bold px-2 py-0.5 rounded">{action.problemArea}</span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">{action.responsible}</td>
                    <td className="py-2.5 px-3 font-mono text-[10px] text-slate-500">{action.deadline}</td>
                    <td className="py-2.5 px-3 font-mono text-[10px] text-slate-400">{action.closedAt || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredActions.length === 0 && (
              <div className="text-center py-12 text-[11px] text-slate-400">
                <ClipboardList className="w-8 h-8 mx-auto mb-2 opacity-30" />
                Eşleşen aksiyon bulunamadı.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Ziyaret Kayıtları ── */}
      {tab === 'visits' && (
        <div className="flex-1 overflow-auto p-5 space-y-3 bg-white">
          {allLogs.length === 0 && (
            <div className="text-center py-12 text-[11px] text-slate-400">
              <MapPin className="w-8 h-8 mx-auto mb-2 opacity-30" />
              Henüz ziyaret kaydı yok.
            </div>
          )}
          {allLogs.map(log => (
            <div key={log.id} className="border border-border rounded-sm overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3 bg-slate-50">
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${VISIT_TYPE_COLORS[log.type] || 'bg-slate-100 text-slate-600'}`}>
                  {log.type}
                </span>
                <span className="font-bold text-xs text-ink">{getStoreName(log.storeId)}</span>
                <span className="font-mono text-[10px] text-slate-400 flex items-center gap-1 ml-auto">
                  <Calendar className="w-3 h-3" />{log.date}
                </span>
                {log.nextVisit && (
                  <span className="font-mono text-[10px] text-accent flex items-center gap-1">
                    <Clock className="w-3 h-3" />Sonraki: {log.nextVisit}
                  </span>
                )}
              </div>
              <div className="px-4 py-3 space-y-2">
                <p className="text-[11px] text-slate-700 leading-relaxed">{log.notes}</p>
                {log.findings && (
                  <div className="bg-amber-50 border-l-2 border-warning px-3 py-2 rounded-r">
                    <p className="text-[10px] font-bold text-warning uppercase mb-1">Bulgular</p>
                    <p className="text-[11px] text-slate-600">{log.findings}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── KPI Trendleri ── */}
      {tab === 'trends' && (
        <div className="flex-1 overflow-auto p-5 space-y-3 bg-white">
          <p className="text-[10px] text-slate-400 font-bold uppercase">Mağaza bazlı haftalık KPI değişimi</p>
          {activeStores.map(store => {
            const snaps = getStoreSnapshots(store.id);
            const isOpen = expandedStore === store.id;
            if (snaps.length === 0) return null;
            return (
              <div key={store.id} className="border border-border rounded-sm overflow-hidden">
                <button
                  onClick={() => setExpandedStore(isOpen ? null : store.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
                >
                  <span className={`w-2 h-2 rounded-full shrink-0 ${
                    store.status === 'success' ? 'bg-success' : store.status === 'danger' ? 'bg-danger' : store.status === 'warning' ? 'bg-warning' : 'bg-accent'
                  }`} />
                  <span className="font-bold text-xs text-ink">{store.code} — {store.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono ml-auto">{snaps.length} veri noktası</span>
                  {isOpen ? <ChevronUp className="w-3.5 h-3.5 text-slate-400 shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                </button>
                {isOpen && (
                  <div className="px-4 py-3 space-y-1">
                    <div className="flex gap-4 text-[9px] font-bold text-slate-400 uppercase mb-2 pb-1 border-b border-slate-100">
                      <span className="w-32">Metrik</span>
                      <span className="w-20">Trend</span>
                      <span className="w-10 text-right">Son</span>
                      <span className="w-10 text-right">Δ</span>
                    </div>
                    <MiniTrend snapshots={snaps} field="ciroGerc" label="Ciro Gerçekleşme %" />
                    <MiniTrend snapshots={snaps} field="conversion" label="Dönüşüm Oranı %" />
                    <MiniTrend snapshots={snaps} field="upt" label="FBA" />
                    <MiniTrend snapshots={snaps} field="yds" label="YDS Skoru" />
                    <MiniTrend snapshots={snaps} field="stockAccuracy" label="Stok Doğruluğu %" />
                    <div className="pt-2 border-t border-slate-100 mt-2">
                      <p className="text-[9px] text-slate-400 font-bold uppercase mb-1">Veri Noktaları</p>
                      <div className="flex flex-wrap gap-1">
                        {snaps.map(s => (
                          <span key={s.id} className="text-[9px] font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-500">{s.date}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {activeStores.every(s => getStoreSnapshots(s.id).length === 0) && (
            <div className="text-center py-12 text-[11px] text-slate-400">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-30" />
              Henüz KPI snapshot verisi yok.
            </div>
          )}
        </div>
      )}

      {/* Ziyaret Formu */}
      <AnimatePresence>
        {showVisitForm && (
          <VisitLogForm
            stores={stores}
            onClose={() => setShowVisitForm(false)}
            onSave={log => {
              onAddVisit(log);
              setShowVisitForm(false);
              showToast(`${getStoreName(log.storeId)} ziyaret kaydı eklendi.`);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
