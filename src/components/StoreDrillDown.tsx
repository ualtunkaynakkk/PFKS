import { useState } from 'react';
import { motion } from 'motion/react';
import {
  ClipboardCheck, AlertTriangle, FileText, MousePointerClick,
  CheckCircle2, Clock, ChevronDown, ChevronUp
} from 'lucide-react';
import type { StoreData, Action } from '../types';
import { KPI_WEIGHTS } from '../data/stores';

interface StoreDrillDownProps {
  store: StoreData;
  index: number;
  actions: Action[];
  onNewAction: () => void;
  onPrint: () => void;
  onCloseAction: (id: string) => void;
  onKPIUpdate: () => void;
}

export function StoreDrillDown({ store, index, actions, onNewAction, onPrint, onCloseAction, onKPIUpdate }: StoreDrillDownProps) {
  const [showWeights, setShowWeights] = useState(false);

  return (
    <div className="bg-panel flex flex-col border-l border-border overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3 border-b border-border bg-panel-header flex items-center justify-between shrink-0">
        <h2 className="text-xs uppercase font-bold text-slate-600 flex items-center gap-2">
          <ClipboardCheck className="w-3.5 h-3.5" /> Mağaza Detay Analizi
        </h2>
        <button
          onClick={onPrint}
          className="px-2.5 py-1 text-[9px] font-bold uppercase bg-ink text-white rounded hover:bg-slate-800 transition-colors active:scale-95"
        >
          Yazdır / PDF
        </button>
      </div>

      <div className="flex-1 overflow-auto p-5 space-y-5">
        {/* Store Header + Index */}
        <div className="flex justify-between items-start">
          <div>
            <motion.div
              key={store.name}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-lg font-extrabold text-ink leading-tight"
            >
              {store.code} — {store.name}
            </motion.div>
            <div className="text-[10px] text-slate-500 font-bold tracking-tight mt-0.5">
              SEGMENT: <span className="text-accent">{store.segment}</span> | BÖLGE: <span className="text-ink">{store.region}</span>
            </div>
          </div>
          <div className="text-right">
            <motion.div
              key={index}
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`text-3xl font-black leading-none ${
                index < 70 ? 'text-danger' : index < 82 ? 'text-warning' : 'text-success'
              }`}
            >
              {index}
              <span className="text-xs font-normal text-slate-400 ml-1">/ 100</span>
            </motion.div>
            <div className="text-[9px] uppercase font-bold text-slate-500 mt-1">Performans Endeksi</div>
          </div>
        </div>

        {/* Endeks Formülü */}
        <div className="border border-border rounded overflow-hidden">
          <button
            onClick={() => setShowWeights(v => !v)}
            className="w-full flex items-center justify-between px-3 py-2 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase hover:bg-slate-100 transition-colors"
          >
            <span>Endeks Hesaplama Formülü (TEMPO Modeli)</span>
            {showWeights ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          {showWeights && (
            <div className="p-3 space-y-1.5 bg-white">
              {[
                ['Ciro Gerçekleşme', `%${store.ciroGerc}`, KPI_WEIGHTS.ciro],
                ['Dönüşüm Oranı', `%${store.conversion}`, KPI_WEIGHTS.conversion],
                ['FBA', `${store.upt}`, KPI_WEIGHTS.upt],
                ['YDS Skoru', `${store.yds}/10`, KPI_WEIGHTS.yds],
                ['Stok Doğruluğu', `%${store.stockAccuracy}`, KPI_WEIGHTS.stockAccuracy],
                ['Ziyaret Sıklığı', `${store.visitFrequency}/hafta`, KPI_WEIGHTS.visitFrequency],
              ].map(([label, val, weight]) => (
                <div key={label as string} className="flex items-center gap-2 text-[10px]">
                  <span className="w-36 text-slate-500 font-medium">{label as string}</span>
                  <span className="font-mono font-bold text-ink w-16">{val as string}</span>
                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-accent/50 rounded-full" style={{ width: `${(weight as number) * 100}%` }} />
                  </div>
                  <span className="font-mono text-slate-400 w-8 text-right">%{Math.round((weight as number) * 100)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'YDS — YÖNETİM DİSİPLİNİ', val: `${store.yds} / 10.0`, sub: 'Yönetim Disiplin Skoru' },
            { label: 'PERSONEL VERİMLİLİĞİ', val: store.personnelEfficiency, sub: 'Ciro / Saat' },
            { label: 'STOK DOĞRULUĞU', val: `%${store.stockAccuracy}`, sub: 'Sayım vs Sistem' },
            { label: 'ZİYARET SIKLIĞI', val: `${store.visitFrequency} / Hafta`, sub: 'Bölge Md. Ziyareti' },
          ].map((m, i) => (
            <div key={i} className="border border-border p-3 rounded-sm bg-slate-50/50">
              <span className="text-[9px] font-bold text-slate-400 block mb-1 uppercase tracking-tighter">{m.label}</span>
              <div className="text-sm font-bold font-mono text-ink">{m.val}</div>
              <div className="text-[8px] text-slate-400 font-semibold">{m.sub}</div>
            </div>
          ))}
        </div>

        {/* Action List */}
        <div className="space-y-2 pt-2 border-t border-border border-dashed">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] uppercase font-black text-slate-600 flex items-center gap-1.5">
              <AlertTriangle className="w-3 h-3 text-warning" /> Aksiyonlar
            </h3>
            <span className="text-[9px] font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">{actions.length} KAYIT</span>
          </div>

          {actions.length === 0 ? (
            <div className="text-center py-4 text-[10px] text-slate-400 italic">
              Bu mağaza için atanmış aksiyon bulunamadı.
            </div>
          ) : (
            <div className="space-y-1">
              {actions.map(action => (
                <div key={action.id} className="flex items-start gap-2 py-2 border-b border-slate-50 group hover:bg-slate-50/80 px-2 -mx-2 rounded transition-colors">
                  <div className={`mt-0.5 shrink-0 text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase ${
                    action.status === 'Gecikmiş' ? 'bg-red-100 text-danger' :
                    action.status === 'Kapatıldı' ? 'bg-green-100 text-success' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {action.status}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-medium text-ink leading-tight">{action.title}</div>
                    <div className="flex gap-2 mt-0.5">
                      <span className="text-[9px] text-slate-400">{action.responsible}</span>
                      <span className="text-[9px] font-mono text-slate-400 flex items-center gap-0.5">
                        <Clock className="w-2 h-2" /> {action.deadline}
                      </span>
                    </div>
                  </div>
                  {action.status !== 'Kapatıldı' && (
                    <button
                      onClick={() => onCloseAction(action.id)}
                      className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-green-100 text-success"
                      title="Aksiyonu kapat"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Manager Note */}
        <div className="bg-slate-100/80 p-4 border-l-2 border-accent rounded-r-sm shadow-sm">
          <div className="text-[9px] font-black text-accent mb-2 flex items-center gap-1.5">
            <FileText className="w-3 h-3" /> BÖLGE MÜDÜRÜ NOTU
          </div>
          <p className="text-[11px] leading-relaxed font-medium italic text-slate-700">
            "{store.managerNote}"
          </p>
        </div>

        {/* Action Button */}
        <div className="space-y-2 pb-2">
          <button
            onClick={onKPIUpdate}
            className="w-full py-2.5 bg-slate-100 text-ink font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-200 transition-all rounded active:scale-95 border border-border"
          >
            <span>📊</span> KPI Verilerini Güncelle
          </button>
          <button
            onClick={onNewAction}
            className="w-full py-2.5 bg-ink text-white font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-accent transition-all rounded active:scale-95"
          >
            <MousePointerClick className="w-3.5 h-3.5" /> Yeni Aksiyon Ekle / Ziyaret Başlat
          </button>
        </div>
      </div>
    </div>
  );
}
