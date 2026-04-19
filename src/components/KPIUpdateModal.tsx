import { useState } from 'react';
import { motion } from 'motion/react';
import { X, TrendingUp, TrendingDown, Minus, Save } from 'lucide-react';
import type { StoreData, KPIUpdateForm } from '../types';
import { calcIndex } from '../data/stores';

interface KPIUpdateModalProps {
  store: StoreData;
  onClose: () => void;
  onSave: (form: KPIUpdateForm) => void;
}

export function KPIUpdateModal({ store, onClose, onSave }: KPIUpdateModalProps) {
  const [form, setForm] = useState<KPIUpdateForm>({
    ciroGerc: store.ciroGerc,
    upt: store.upt,
    conversion: store.conversion,
    yds: store.yds,
    stockAccuracy: store.stockAccuracy,
    note: '',
  });

  const set = (key: keyof KPIUpdateForm, val: number | string) =>
    setForm(f => ({ ...f, [key]: val }));

  // Önizleme: yeni değerlere göre endeks hesapla
  const previewStore = { ...store, ...form };
  const newIndex = calcIndex(previewStore as StoreData);
  const oldIndex = calcIndex(store);
  const indexDiff = newIndex - oldIndex;

  const kpis = [
    { key: 'ciroGerc', label: 'Ciro Gerçekleşme %', old: store.ciroGerc, min: 0, max: 200, step: 0.1, suffix: '%' },
    { key: 'upt', label: 'FBA (Fatura Başına Adet)', old: store.upt, min: 0, max: 5, step: 0.01, suffix: '' },
    { key: 'conversion', label: 'Dönüşüm Oranı %', old: store.conversion, min: 0, max: 50, step: 0.1, suffix: '%' },
    { key: 'yds', label: 'YDS Skoru (0-10)', old: store.yds, min: 0, max: 10, step: 0.1, suffix: '' },
    { key: 'stockAccuracy', label: 'Stok Doğruluğu %', old: store.stockAccuracy, min: 0, max: 100, step: 0.1, suffix: '%' },
  ] as const;

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }}
        className="bg-white rounded-lg shadow-2xl w-full max-w-lg border border-border overflow-hidden"
      >
        <div className="bg-panel-header px-6 py-4 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-ink uppercase tracking-wider">KPI Güncelle</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">{store.code} — {store.name}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-ink p-1 rounded hover:bg-slate-100">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Endeks Önizleme */}
          <div className="flex items-center justify-between bg-slate-50 border border-border rounded p-3">
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase">Performans Endeksi Önizleme</p>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-lg font-black text-slate-400 line-through">{oldIndex}</span>
                <span className="text-[10px] text-slate-400">→</span>
                <span className={`text-2xl font-black ${newIndex >= 85 ? 'text-success' : newIndex < 70 ? 'text-danger' : 'text-warning'}`}>
                  {newIndex}
                </span>
              </div>
            </div>
            <div className={`flex items-center gap-1 text-sm font-bold ${
              indexDiff > 0 ? 'text-success' : indexDiff < 0 ? 'text-danger' : 'text-slate-400'
            }`}>
              {indexDiff > 0 ? <TrendingUp className="w-4 h-4" /> : indexDiff < 0 ? <TrendingDown className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
              {indexDiff > 0 ? '+' : ''}{indexDiff}
            </div>
          </div>

          {/* KPI Alanları */}
          <div className="space-y-3">
            {kpis.map(({ key, label, old, min, max, step, suffix }) => {
              const current = form[key] as number;
              const diff = current - old;
              return (
                <div key={key} className="flex items-center gap-3">
                  <label className="text-[10px] font-bold text-slate-500 w-40 shrink-0">{label}</label>
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-[10px] font-mono text-slate-400 w-14 text-right shrink-0">{suffix}{old}</span>
                    <span className="text-[10px] text-slate-300">→</span>
                    <input
                      type="number" min={min} max={max} step={step} value={current}
                      onChange={e => set(key, parseFloat(e.target.value) || 0)}
                      className="flex-1 border border-border rounded px-2 py-1.5 text-xs font-mono font-bold outline-none focus:ring-2 focus:ring-accent"
                    />
                    <span className={`text-[10px] font-bold w-12 text-right shrink-0 ${
                      diff > 0 ? 'text-success' : diff < 0 ? 'text-danger' : 'text-slate-300'
                    }`}>
                      {diff > 0 ? '+' : ''}{diff !== 0 ? diff.toFixed(step < 1 ? 1 : 0) : '—'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Not */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Güncelleme Notu</label>
            <textarea
              value={form.note}
              onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
              className="w-full border border-border rounded px-3 py-2 text-xs h-16 outline-none focus:ring-2 focus:ring-accent resize-none"
              placeholder="Güncelleme sebebi, hafta/dönem bilgisi..."
            />
          </div>
        </div>

        <div className="bg-slate-50 px-6 py-4 border-t border-border flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-xs font-bold text-slate-500 uppercase hover:text-ink">İptal</button>
          <button onClick={() => onSave(form)}
            className="px-4 py-2 bg-accent text-white text-xs font-bold rounded uppercase flex items-center gap-1.5 hover:bg-blue-700 transition-colors">
            <Save className="w-3.5 h-3.5" /> KPI'ları Güncelle
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
