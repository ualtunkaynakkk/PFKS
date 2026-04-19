import { useState, ReactNode } from 'react';
import { motion } from 'motion/react';
import { X, Activity } from 'lucide-react';
import type { StoreData, NewActionForm } from '../../types';

// ─── Base Modal ────────────────────────────────────────────────────────────────
interface ModalProps {
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
}

export function Modal({ title, children, footer, onClose }: ModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white rounded-lg shadow-2xl w-full max-w-lg overflow-hidden border border-border"
      >
        <div className="bg-panel-header px-6 py-4 border-b border-border flex items-center justify-between">
          <h3 className="text-sm font-bold text-ink uppercase tracking-wider">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-ink transition-colors p-1 rounded hover:bg-slate-100">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6">{children}</div>
        {footer && (
          <div className="bg-slate-50 px-6 py-4 border-t border-border flex justify-end gap-3">
            {footer}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// ─── New Action Modal ──────────────────────────────────────────────────────────
interface NewActionModalProps {
  store: StoreData;
  onClose: () => void;
  onSave: (form: NewActionForm) => void;
}

const PROBLEM_AREAS = ['FBA', 'Dönüşüm', 'Sepet Ort.', 'YDS', 'Stok', 'Personel', 'Görsel'];
const RESPONSIBLE_OPTIONS = ['Mağaza Müdürü', 'Bölge Müdürü', 'Görsel Düzenleme', 'İK', 'Depo'];

export function NewActionModal({ store, onClose, onSave }: NewActionModalProps) {
  const [form, setForm] = useState<NewActionForm>({
    title: '',
    deadline: '',
    responsible: 'Mağaza Müdürü',
    problemArea: '',
  });
  const [errors, setErrors] = useState<Partial<NewActionForm>>({});

  const validate = () => {
    const e: Partial<NewActionForm> = {};
    if (!form.title.trim()) e.title = 'Aksiyon başlığı zorunlu';
    if (!form.deadline) e.deadline = 'Termin tarihi zorunlu';
    if (!form.problemArea) e.problemArea = 'Problem alanı seçiniz';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (validate()) onSave(form);
  };

  return (
    <Modal
      title={`Yeni Aksiyon // ${store.name}`}
      onClose={onClose}
      footer={
        <>
          <button onClick={onClose} className="px-4 py-2 text-xs font-bold text-slate-500 uppercase hover:text-ink transition-colors">
            İptal
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-accent text-white text-xs font-bold rounded uppercase shadow-lg shadow-accent/20 hover:bg-blue-700 transition-colors"
          >
            Aksiyonu Kaydet
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">
            Aksiyon Başlığı <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
            className={`w-full border p-2.5 rounded text-xs focus:ring-2 focus:ring-accent outline-none transition-all ${errors.title ? 'border-danger' : 'border-border'}`}
            placeholder="Örn: Vitrin düzenlemesi revizyonu"
          />
          {errors.title && <p className="text-[10px] text-danger mt-1">{errors.title}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">
              Termin <span className="text-danger">*</span>
            </label>
            <input
              type="date"
              value={form.deadline}
              onChange={(e) => setForm(f => ({ ...f, deadline: e.target.value }))}
              className={`w-full border p-2.5 rounded text-xs outline-none transition-all ${errors.deadline ? 'border-danger' : 'border-border'}`}
            />
            {errors.deadline && <p className="text-[10px] text-danger mt-1">{errors.deadline}</p>}
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Sorumlu</label>
            <select
              value={form.responsible}
              onChange={(e) => setForm(f => ({ ...f, responsible: e.target.value }))}
              className="w-full border border-border p-2.5 rounded text-xs outline-none bg-white focus:ring-2 focus:ring-accent"
            >
              {RESPONSIBLE_OPTIONS.map(opt => <option key={opt}>{opt}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">
            Problem Alanı <span className="text-danger">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {PROBLEM_AREAS.map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => setForm(f => ({ ...f, problemArea: tag }))}
                className={`px-3 py-1 text-[10px] font-bold rounded-full border transition-all ${
                  form.problemArea === tag
                    ? 'bg-accent text-white border-accent'
                    : 'bg-slate-100 text-slate-600 border-transparent hover:bg-slate-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
          {errors.problemArea && <p className="text-[10px] text-danger mt-1">{errors.problemArea}</p>}
        </div>
      </div>
    </Modal>
  );
}

// ─── Intervention Modal ────────────────────────────────────────────────────────
interface InterventionModalProps {
  store: StoreData;
  onClose: () => void;
  onSend: (note: string) => void;
}

export function InterventionModal({ store, onClose, onSend }: InterventionModalProps) {
  const [note, setNote] = useState('');

  return (
    <Modal
      title={`Acil Müdahale Emri // ${store.name}`}
      onClose={onClose}
      footer={
        <button
          onClick={() => onSend(note)}
          disabled={!note.trim()}
          className="px-4 py-2 bg-danger text-white text-xs font-bold rounded uppercase disabled:opacity-40 hover:bg-red-700 transition-colors"
        >
          Talimatı Gönder
        </button>
      }
    >
      <div className="space-y-4">
        <div className="bg-red-50 p-4 border-l-4 border-danger rounded-r">
          <p className="text-xs font-bold text-danger leading-relaxed">
            {store.name} mağazası saatlik ciro temposu hedefin %{Math.max(0, 100 - store.ciroGerc)} gerisinde.
            Sistem personelin "karşılama" safhasında zayıf olduğunu teşhis etti.
          </p>
        </div>
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Bölge Müdürü Talimatı</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full border border-border p-2.5 rounded text-xs h-28 outline-none focus:ring-2 focus:ring-danger resize-none"
            placeholder="Mağaza müdürüne iletilecek notu yazınız..."
          />
        </div>
      </div>
    </Modal>
  );
}

// ─── Print Preview Modal ───────────────────────────────────────────────────────
interface PrintPreviewModalProps {
  store: StoreData;
  index: number;
  onClose: () => void;
}

export function PrintPreviewModal({ store, index, onClose }: PrintPreviewModalProps) {
  const today = new Date().toLocaleDateString('tr-TR');

  return (
    <Modal title={`Rapor Önizleme // ${store.name}`} onClose={onClose}>
      <div className="border border-border p-8 bg-white shadow-inner space-y-6">
        <div className="flex justify-between border-b pb-4">
          <div>
            <h4 className="font-bold text-sm">{store.code} - {store.name}</h4>
            <p className="text-[10px] text-slate-400">TARİH: {today}</p>
            <p className="text-[10px] text-slate-400">BÖLGE: {store.region} | SEGMENT: {store.segment}</p>
          </div>
          <Activity className="w-8 h-8 text-accent opacity-20" />
        </div>
        <div className="space-y-2">
          {[
            ['CİRO GERÇEKLEŞME', `%${store.ciroGerc}`],
            ['DÖNÜŞÜM ORANI', `%${store.conversion}`],
            ['FBA (Fatura Başına Adet)', `${store.upt}`],
            ['YDS SKORU', `${store.yds} / 10`],
            ['STOK DOĞRULUĞU', `%${store.stockAccuracy}`],
            ['PERFORMANS ENDEKSİ', `${index} / 100`],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between text-xs">
              <span className="text-slate-500">{label}:</span>
              <span className="font-bold font-mono">{value}</span>
            </div>
          ))}
        </div>
        <div className="pt-4 border-t text-center">
          <button
            onClick={() => { window.print(); onClose(); }}
            className="px-6 py-2 bg-ink text-white text-[10px] font-bold rounded uppercase hover:bg-slate-800 transition-colors"
          >
            Yazıcıya Gönder
          </button>
        </div>
      </div>
    </Modal>
  );
}
