import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Store, Plus, Pencil, Trash2, RotateCcw, Search,
  CheckCircle2, AlertCircle, X, Save
} from 'lucide-react';
import type { StoreData, StoreForm, RegionFilter } from '../types';
import { calcIndex } from '../data/stores';

const EMPTY_FORM: StoreForm = {
  name: '', code: '', segment: 'A', region: 'Merkez',
  ciroGerc: 100, upt: 2.0, conversion: 18.0, yds: 8.0,
  stockAccuracy: 95.0, visitFrequency: 2,
  personnelEfficiency: '₺4.0k / saat', managerNote: '',
};

const SEGMENTS = ['A+', 'A', 'B', 'C'];
const REGIONS: RegionFilter[] = ['Merkez', 'Asya', 'Anadolu'];

interface StoreFormPanelProps {
  initial?: StoreForm;
  title: string;
  onSave: (f: StoreForm) => void;
  onCancel: () => void;
}

function StoreFormPanel({ initial = EMPTY_FORM, title, onSave, onCancel }: StoreFormPanelProps) {
  const [form, setForm] = useState<StoreForm>(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof StoreForm, string>>>({});

  const set = (key: keyof StoreForm, value: string | number) =>
    setForm(f => ({ ...f, [key]: value }));

  const validate = () => {
    const e: Partial<Record<keyof StoreForm, string>> = {};
    if (!form.name.trim()) e.name = 'Mağaza adı zorunlu';
    if (!form.code.trim()) e.code = 'Mağaza kodu zorunlu';
    if (form.ciroGerc < 0 || form.ciroGerc > 200) e.ciroGerc = '0-200 arasında olmalı';
    if (form.yds < 0 || form.yds > 10) e.yds = '0-10 arasında olmalı';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onCancel()}
    >
      <motion.div
        initial={{ scale: 0.95, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white rounded-lg shadow-2xl w-full max-w-2xl border border-border overflow-hidden"
      >
        <div className="bg-panel-header px-6 py-4 border-b border-border flex items-center justify-between">
          <h3 className="text-sm font-bold text-ink uppercase tracking-wider">{title}</h3>
          <button onClick={onCancel} className="text-slate-400 hover:text-ink p-1 rounded hover:bg-slate-100">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[70vh]">
          <div className="grid grid-cols-2 gap-4">
            {/* Ad */}
            <div className="col-span-2 sm:col-span-1">
              <label className="label">Mağaza Adı *</label>
              <input value={form.name} onChange={e => set('name', e.target.value)}
                className={`input ${errors.name ? 'border-danger' : ''}`} placeholder="NİŞANTAŞI" />
              {errors.name && <p className="err">{errors.name}</p>}
            </div>
            {/* Kod */}
            <div>
              <label className="label">Mağaza Kodu *</label>
              <input value={form.code} onChange={e => set('code', e.target.value.toUpperCase())}
                className={`input ${errors.code ? 'border-danger' : ''}`} placeholder="M104" />
              {errors.code && <p className="err">{errors.code}</p>}
            </div>
            {/* Segment */}
            <div>
              <label className="label">Segment</label>
              <select value={form.segment} onChange={e => set('segment', e.target.value)} className="input">
                {SEGMENTS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            {/* Bölge */}
            <div>
              <label className="label">Bölge</label>
              <select value={form.region} onChange={e => set('region', e.target.value as RegionFilter)} className="input">
                {REGIONS.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>

            {/* KPI'lar */}
            <div className="col-span-2 border-t border-border pt-4 mt-1">
              <p className="text-[10px] font-black text-slate-400 uppercase mb-3">KPI Değerleri</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { key: 'ciroGerc', label: 'Ciro Gerçekleşme %', min: 0, max: 200, step: 0.1 },
                  { key: 'upt', label: 'FBA (Fatura Başına Adet)', min: 0, max: 5, step: 0.01 },
                  { key: 'conversion', label: 'Dönüşüm Oranı %', min: 0, max: 50, step: 0.1 },
                  { key: 'yds', label: 'YDS Skoru (0-10)', min: 0, max: 10, step: 0.1 },
                  { key: 'stockAccuracy', label: 'Stok Doğruluğu %', min: 0, max: 100, step: 0.1 },
                  { key: 'visitFrequency', label: 'Ziyaret / Hafta', min: 0, max: 7, step: 1 },
                ].map(({ key, label, min, max, step }) => (
                  <div key={key}>
                    <label className="label">{label}</label>
                    <input
                      type="number" min={min} max={max} step={step}
                      value={(form as Record<string, unknown>)[key] as number}
                      onChange={e => set(key as keyof StoreForm, parseFloat(e.target.value) || 0)}
                      className={`input font-mono ${(errors as Record<string, string>)[key] ? 'border-danger' : ''}`}
                    />
                    {(errors as Record<string, string>)[key] && <p className="err">{(errors as Record<string, string>)[key]}</p>}
                  </div>
                ))}
              </div>
            </div>

            {/* Personel Verimliliği */}
            <div className="col-span-2">
              <label className="label">Personel Verimliliği</label>
              <input value={form.personnelEfficiency} onChange={e => set('personnelEfficiency', e.target.value)}
                className="input" placeholder="₺4.0k / saat" />
            </div>
            {/* Not */}
            <div className="col-span-2">
              <label className="label">Bölge Müdürü Notu</label>
              <textarea value={form.managerNote} onChange={e => set('managerNote', e.target.value)}
                className="input h-20 resize-none" placeholder="Mağaza hakkında not..." />
            </div>
          </div>
        </div>

        <div className="bg-slate-50 px-6 py-4 border-t border-border flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 text-xs font-bold text-slate-500 uppercase hover:text-ink">İptal</button>
          <button onClick={() => validate() && onSave(form)}
            className="px-4 py-2 bg-accent text-white text-xs font-bold rounded uppercase flex items-center gap-1.5 hover:bg-blue-700 transition-colors">
            <Save className="w-3.5 h-3.5" /> Kaydet
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

interface StoreManagementProps {
  canAdd?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  stores: StoreData[];
  onAdd: (f: StoreForm) => Promise<unknown>;
  onEdit: (id: string, f: Partial<StoreData>) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
  onRestore: (id: string) => Promise<void>;
  showToast: (msg: string) => void;
}

export function StoreManagement({ stores, onAdd, onEdit, onRemove, onRestore, showToast, canAdd = false, canEdit = false, canDelete = false }: StoreManagementProps) {
  const [search, setSearch] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [panel, setPanel] = useState<'none' | 'add' | string>('none');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filtered = stores.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.code.toLowerCase().includes(search.toLowerCase());
    const matchActive = showInactive ? true : s.isActive;
    return matchSearch && matchActive;
  });

  const editStore = stores.find(s => s.id === panel);

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-5 py-3 border-b border-border bg-panel-header flex flex-wrap items-center justify-between gap-3 shrink-0">
        <h2 className="text-xs uppercase font-bold text-slate-600 flex items-center gap-2">
          <Store className="w-3.5 h-3.5" /> Mağaza Yönetimi
          <span className="text-[10px] font-mono bg-accent/10 text-accent px-2 py-0.5 rounded-full">
            {stores.filter(s => s.isActive).length} Aktif
          </span>
        </h2>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 cursor-pointer">
            <input type="checkbox" checked={showInactive} onChange={e => setShowInactive(e.target.checked)} className="w-3 h-3" />
            Pasifleri Göster
          </label>
          {canAdd && <button onClick={() => setPanel('add')}
            className="px-3 py-1.5 bg-accent text-white text-[10px] font-bold rounded uppercase flex items-center gap-1.5 hover:bg-blue-700 transition-colors">
            <Plus className="w-3 h-3" /> Mağaza Ekle
          </button>}
        </div>
      </div>

      {/* Search */}
      <div className="px-5 py-3 border-b border-border bg-white shrink-0">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-border rounded text-xs outline-none focus:ring-2 focus:ring-accent"
            placeholder="Mağaza adı veya kodu ile ara..." />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto bg-white">
        <table className="w-full border-collapse text-[11px]">
          <thead className="sticky top-0 z-10">
            <tr className="bg-table-header border-b border-border">
              {['Durum', 'Kod', 'Mağaza', 'Bölge', 'Seg.', 'Ciro%', 'FBA', 'Dön.%', 'YDS', 'Endeks', 'İşlem'].map(h => (
                <th key={h} className="py-2.5 px-3 text-left font-bold text-slate-500 uppercase text-[10px] whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(store => {
              const idx = calcIndex(store);
              return (
                <tr key={store.id} className={`border-b border-border transition-colors hover:bg-slate-50 ${!store.isActive ? 'opacity-40' : ''}`}>
                  <td className="py-2.5 px-3">
                    <span className={`w-2 h-2 rounded-full inline-block ${
                      store.status === 'success' ? 'bg-success' :
                      store.status === 'danger' ? 'bg-danger' :
                      store.status === 'warning' ? 'bg-warning' : 'bg-accent'
                    }`} />
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-500">{store.code}</td>
                  <td className="py-2.5 px-3 font-bold text-ink">{store.name}</td>
                  <td className="py-2.5 px-3 text-slate-600">{store.region}</td>
                  <td className="py-2.5 px-3 text-slate-600">{store.segment}</td>
                  <td className={`py-2.5 px-3 font-mono font-bold ${store.ciroGerc >= 100 ? 'text-success' : store.ciroGerc < 90 ? 'text-danger' : 'text-warning'}`}>
                    %{store.ciroGerc}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-700">{store.upt.toFixed(2)}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-700">%{store.conversion.toFixed(1)}</td>
                  <td className={`py-2.5 px-3 font-bold ${store.yds >= 8.5 ? 'text-success' : store.yds < 7 ? 'text-danger' : 'text-warning'}`}>
                    {store.yds}
                  </td>
                  <td className={`py-2.5 px-3 font-black font-mono ${idx >= 85 ? 'text-success' : idx < 70 ? 'text-danger' : 'text-warning'}`}>
                    {idx}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-1">
                      {store.isActive ? (
                        <>
                          {canEdit && <button onClick={() => setPanel(store.id)}
                            className="p-1.5 rounded hover:bg-blue-50 text-accent transition-colors" title="Düzenle">
                            <Pencil className="w-3 h-3" />
                          </button>}
                          {canDelete && <button onClick={() => setDeleteConfirm(store.id)}
                            className="p-1.5 rounded hover:bg-red-50 text-danger transition-colors" title="Pasife Al">
                            <Trash2 className="w-3 h-3" />
                          </button>}
                        </>
                      ) : (
                        <button onClick={() => { onRestore(store.id); showToast(`${store.name} mağazası aktif edildi.`); }}
                          className="p-1.5 rounded hover:bg-green-50 text-success transition-colors" title="Aktif Et">
                          <RotateCcw className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-[11px] text-slate-400">
            <Store className="w-8 h-8 mx-auto mb-2 opacity-30" />
            Eşleşen mağaza bulunamadı.
          </div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {panel === 'add' && (
          <StoreFormPanel
            title="Yeni Mağaza Ekle"
            onCancel={() => setPanel('none')}
            onSave={form => { onAdd(form); setPanel('none'); showToast(`${form.name} mağazası eklendi.`); }}
          />
        )}
        {editStore && (
          <StoreFormPanel
            title={`Düzenle — ${editStore.name}`}
            initial={{ ...editStore }}
            onCancel={() => setPanel('none')}
            onSave={form => { onEdit(editStore.id, form); setPanel('none'); showToast(`${form.name} güncellendi.`); }}
          />
        )}
        {deleteConfirm && (() => {
          const s = stores.find(x => x.id === deleteConfirm);
          return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm">
              <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }}
                className="bg-white rounded-lg p-6 shadow-2xl w-full max-w-sm border border-border">
                <div className="flex items-start gap-3 mb-4">
                  <AlertCircle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-ink">{s?.name} mağazasını pasife al?</p>
                    <p className="text-xs text-slate-500 mt-1">Mağaza listeden kaldırılır, veriler saklanır. İstediğin zaman geri alabilirsin.</p>
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <button onClick={() => setDeleteConfirm(null)} className="px-3 py-1.5 text-xs font-bold text-slate-500 uppercase">İptal</button>
                  <button onClick={() => {
                    const activeCount = stores.filter(x => x.isActive).length;
                    if (activeCount <= 1) {
                      showToast('En az 1 aktif mağaza olmalıdır.');
                      setDeleteConfirm(null);
                      return;
                    }
                    onRemove(deleteConfirm);
                    showToast(`${s?.name} pasife alındı.`);
                    setDeleteConfirm(null);
                  }} className="px-3 py-1.5 bg-danger text-white text-xs font-bold rounded uppercase">
                    Pasife Al
                  </button>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
