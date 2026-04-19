/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, ReactNode } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  LayoutDashboard, 
  Store, 
  ClipboardCheck, 
  Activity,
  AlertTriangle,
  FileText,
  MousePointerClick
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---
type StoreStatus = 'success' | 'warning' | 'danger' | 'stable';

interface Action {
  id: string;
  storeId: string;
  title: string;
  status: 'Açık' | 'Kapatıldı' | 'Gecikmiş';
  deadline: string;
}

interface StoreData {
  id: string;
  name: string;
  code: string;
  segment: string;
  region: string;
  status: StoreStatus;
  ciroGerc: number;
  upt: number;
  conversion: number;
  yds: number;
  index: number;
  personnelEfficiency: string;
  stockAccuracy: number;
  visitFrequency: number;
  managerNote: string;
}

// --- Mock Data ---
const STORES: StoreData[] = [
  {
    id: '1',
    code: 'M104',
    name: 'NİŞANTAŞI',
    segment: 'A+',
    region: 'Merkez',
    status: 'success',
    ciroGerc: 112,
    upt: 2.45,
    conversion: 22.1,
    yds: 9.2,
    index: 94,
    personnelEfficiency: '₺4.8k / saat',
    stockAccuracy: 98.5,
    visitFrequency: 3,
    managerNote: 'Nişantaşı ekibi dönüşümde bölge lideri. Vitrin rotasyonu satışları destekliyor.'
  },
  {
    id: '2',
    code: 'M201',
    name: 'BAĞDAT CAD.',
    segment: 'A+',
    region: 'Asya',
    status: 'stable',
    ciroGerc: 98,
    upt: 2.10,
    conversion: 19.5,
    yds: 8.5,
    index: 82,
    personnelEfficiency: '₺4.1k / saat',
    stockAccuracy: 96.0,
    visitFrequency: 2,
    managerNote: 'Cadde trafiği stabil. Hafta sonu seanslarına odaklanılmalı.'
  },
  {
    id: '3',
    code: 'M305',
    name: 'İSTİNYE PARK',
    segment: 'A+',
    region: 'Merkez',
    status: 'warning',
    ciroGerc: 92,
    upt: 1.95,
    conversion: 17.2,
    yds: 7.8,
    index: 74,
    personnelEfficiency: '₺5.2k / saat',
    stockAccuracy: 92.4,
    visitFrequency: 2,
    managerNote: 'AVM trafiği artmasına rağmen sepet ortalaması geride kaldı. Cross-sell eğitimi planlanmalı.'
  },
  {
    id: '4',
    code: 'M402',
    name: 'ZORLU CENTER',
    segment: 'A+',
    region: 'Merkez',
    status: 'danger',
    ciroGerc: 81,
    upt: 1.82,
    conversion: 14.8,
    yds: 6.2,
    index: 62,
    personnelEfficiency: '₺4.2k / saat',
    stockAccuracy: 94.2,
    visitFrequency: 2,
    managerNote: 'Zorlu mağazasında dönüşüm oranı kritik seviyede. Yarın sabah seansında karşılama disiplini için yerinde denetim yapılacak.'
  },
  {
    id: '5',
    code: 'M108',
    name: 'EMAAR SQUARE',
    segment: 'A',
    region: 'Asya',
    status: 'warning',
    ciroGerc: 88,
    upt: 2.05,
    conversion: 16.4,
    yds: 7.4,
    index: 68,
    personnelEfficiency: '₺3.8k / saat',
    stockAccuracy: 95.1,
    visitFrequency: 1,
    managerNote: 'Emaar mağazasında personel eksikliği verimliliği düşürüyor.'
  },
  {
    id: '6',
    code: 'M212',
    name: 'VADİ İSTANBUL',
    segment: 'A',
    region: 'Merkez',
    status: 'stable',
    ciroGerc: 96,
    upt: 2.15,
    conversion: 18.9,
    yds: 8.1,
    index: 78,
    personnelEfficiency: '₺4.5k / saat',
    stockAccuracy: 97.2,
    visitFrequency: 2,
    managerNote: 'Vadi performansı istikrarlı gidiyor. Stok yönetimi başarılı.'
  }
];

const INITIAL_ACTIONS: Action[] = [
  { id: 'a1', storeId: '4', title: 'Vitrindeki eksik mankenlerin tamamlanması', status: 'Gecikmiş', deadline: '24.05.2024' },
  { id: 'a2', storeId: '4', title: 'Haftalık kasa eğitimi (Tüm personel)', status: 'Açık', deadline: '26.05.2024' },
  { id: 'a3', storeId: '4', title: 'Kabin arkası düzenleme ve hızlandırma planı', status: 'Açık', deadline: '27.05.2024' },
  { id: 'a4', storeId: '3', title: 'Kasa önü fırsat sepeti revizyonu', status: 'Açık', deadline: '25.05.2024' },
  { id: 'a5', storeId: '1', title: 'Yeni sezon ürün yerleşimi kontrolü', status: 'Kapatıldı', deadline: '22.05.2024' },
];

// --- Helper Components ---
const StatusIndicator = ({ status }: { status: StoreStatus }) => {
  const colors = {
    success: 'bg-success',
    warning: 'bg-warning',
    danger: 'bg-danger',
    stable: 'bg-accent'
  };
  const labels = {
    success: 'KRİTİK BAŞARI',
    stable: 'STABİL',
    warning: 'TAKİPTE',
    danger: 'RİSKLİ'
  };
  return (
    <div className="flex items-center">
      <span className={`status-dot ${colors[status]}`} />
      <span className="text-[10px] sm:text-xs font-semibold">{labels[status]}</span>
    </div>
  );
};

export default function App() {
  const [selectedStoreId, setSelectedStoreId] = useState<string>('4');
  const [actions, setActions] = useState<Action[]>(INITIAL_ACTIONS);
  const [activeTab, setActiveTab] = useState<'overview' | 'daily'>('overview');
  const [activeModal, setActiveModal] = useState<'none' | 'new_action' | 'intervention' | 'print_preview'>('none');
  const [toast, setToast] = useState<string | null>(null);

  const selectedStore = useMemo(() => 
    STORES.find(s => s.id === selectedStoreId) || STORES[0]
  , [selectedStoreId]);

  const storeActions = useMemo(() => 
    actions.filter(a => a.storeId === selectedStoreId)
  , [actions, selectedStoreId]);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const closeModal = () => setActiveModal('none');

  const Modal = ({ title, children, footer }: { title: string, children: ReactNode, footer?: ReactNode }) => (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm"
    >
      <motion.div 
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white rounded-lg shadow-2xl w-full max-w-lg overflow-hidden border border-border"
      >
        <div className="bg-panel-header px-6 py-4 border-b border-border flex items-center justify-between">
          <h3 className="text-sm font-bold text-ink uppercase tracking-wider">{title}</h3>
          <button onClick={closeModal} className="text-slate-400 hover:text-ink transition-colors">
            <TrendingDown className="w-5 h-5 rotate-45" />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
        {footer && (
          <div className="bg-slate-50 px-6 py-4 border-t border-border flex justify-end gap-3">
            {footer}
          </div>
        )}
      </motion.div>
    </motion.div>
  );

  return (
    <div className="flex flex-col h-screen overflow-hidden relative">
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 20 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-0 left-1/2 -translate-x-1/2 z-[150] bg-ink text-white px-6 py-3 rounded-full shadow-2xl border border-accent font-bold text-xs flex items-center gap-2"
          >
            <Activity className="w-4 h-4 text-accent animate-pulse" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Modals --- */}
      <AnimatePresence>
        {activeModal === 'new_action' && (
          <Modal 
            title={`YENİ AKSİYON // ${selectedStore.name}`}
            footer={
              <>
                <button onClick={closeModal} className="px-4 py-2 text-xs font-bold text-slate-500 uppercase">İptal</button>
                <button onClick={() => { showToast('Aksiyon kaydedildi ve mağaza müdürüne iletildi.'); closeModal(); }} className="px-4 py-2 bg-accent text-white text-xs font-bold rounded uppercase shadow-lg shadow-accent/20">Aksiyonu Kaydet</button>
              </>
            }
          >
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Aksiyon Başlığı</label>
                <input type="text" className="w-full border border-border p-2.5 rounded text-xs focus:ring-2 focus:ring-accent outline-none" placeholder="Örn: Vitrin düzenlemesi revizyonu" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Termin</label>
                  <input type="date" className="w-full border border-border p-2.5 rounded text-xs outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Sorumlu</label>
                  <select className="w-full border border-border p-2.5 rounded text-xs outline-none bg-white">
                    <option>Mağaza Müdürü</option>
                    <option>Bölge Müdürü</option>
                    <option>Görsel Düzenleme</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Problem Alanı</label>
                <div className="flex flex-wrap gap-2">
                  {['FBA', 'Dönüşüm', 'Sepet Ort.', 'YDS', 'Stok'].map(tag => (
                    <button key={tag} className="px-3 py-1 bg-slate-100 text-[10px] font-bold rounded-full text-slate-600 hover:bg-accent hover:text-white transition-colors">
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Modal>
        )}

        {activeModal === 'intervention' && (
          <Modal 
            title={`ACİL MÜDAHALE EMRE // ${selectedStore.name}`}
            footer={
              <button onClick={() => { showToast('Müdahale kaydedildi.'); closeModal(); }} className="px-4 py-2 bg-danger text-white text-xs font-bold rounded uppercase">Talimatı Gönder</button>
            }
          >
            <div className="space-y-4">
              <div className="bg-red-50 p-4 border-l-4 border-danger">
                <p className="text-xs font-bold text-danger leading-relaxed">
                  Zorlu Center mağazası saatlik ciro temposu hedefin %32 gerisinde. Sistem personelin "karşılama" safhasında zayıf olduğunu teşhis etti.
                </p>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Bölge Müdürü Talimatı</label>
                <textarea className="w-full border border-border p-2.5 rounded text-xs h-24 outline-none" placeholder="Mağaza müdürüne iletilecek notu yazınız..."></textarea>
              </div>
            </div>
          </Modal>
        )}

        {activeModal === 'print_preview' && (
          <Modal title={`RAPOR ÖNİZLEME // ${selectedStore.name}`}>
            <div className="border border-border p-8 bg-white shadow-inner space-y-6">
              <div className="flex justify-between border-b pb-4">
                <div>
                  <h4 className="font-bold text-sm">{selectedStore.code} - {selectedStore.name}</h4>
                  <p className="text-[10px] text-slate-400">TARİH: 19.04.2026</p>
                </div>
                <Activity className="w-8 h-8 text-accent opacity-20" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs"><span className="text-slate-500">CIRO GERÇEKLEŞME:</span> <span className="font-bold font-mono">%{selectedStore.ciroGerc}</span></div>
                <div className="flex justify-between text-xs"><span className="text-slate-500">DÖNÜŞÜM ORANI:</span> <span className="font-bold font-mono">%{selectedStore.conversion}</span></div>
                <div className="flex justify-between text-xs"><span className="text-slate-500">FBA:</span> <span className="font-bold font-mono">{selectedStore.upt}</span></div>
                <div className="flex justify-between text-xs"><span className="text-slate-500">YDS SKORU:</span> <span className="font-bold font-mono">{selectedStore.yds} / 10</span></div>
              </div>
              <div className="pt-4 border-t text-center">
                <button onClick={() => { window.print(); closeModal(); }} className="px-6 py-2 bg-ink text-white text-[10px] font-bold rounded uppercase">Yazıcıya Gönder</button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* --- Top Navigation --- */}
      <header className="h-[50px] bg-ink text-white flex items-center justify-between px-5 border-b-2 border-accent shrink-0">
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 text-accent" />
          <h1 className="text-sm sm:text-base font-bold tracking-widest uppercase">
            Retail Performance Control System <span className="text-accent opacity-50 ml-1">//</span> <span className="font-normal opacity-80 text-xs ml-2 hidden sm:inline">Bölge Yönetim Paneli</span>
          </h1>
        </div>
        <div className="text-[10px] font-mono opacity-60 hidden md:block uppercase tracking-tighter">
          Rapor Tarihi: 19.04.2026 | Seans: Gün Ortası | Kullanıcı: Bölge Müdürü
        </div>
      </header>

      {/* --- KPI Summary Bar --- */}
      <section className="grid grid-cols-2 lg:grid-cols-5 gap-[1px] bg-border h-auto lg:h-[90px] shrink-0 border-b border-border">
        {[
          { label: 'BÖLGE CİRO', value: '₺1,420,500', trend: '▲ %4.2 vs HEDEF', positive: true },
          { label: 'FBA (Fatura Başına Adet)', value: '2.18', trend: '▼ -2.1% vs GY', positive: false },
          { label: 'SEPET ORTALAMASI', value: '₺651.20', trend: '▲ %8.4 vs GY', positive: true },
          { label: 'DÖNÜŞÜM ORANI', value: '%18.4', trend: '● %0.0 vs HEDEF', positive: null },
          { label: 'AKSİYON KAPATMA %', value: '%92.0', trend: '▲ %5.0 vs HEDEF', positive: true },
        ].map((kpi, i) => (
          <div key={i} className="bg-panel p-4 flex flex-col justify-center">
            <span className="text-[10px] uppercase text-slate-500 font-bold mb-1">{kpi.label}</span>
            <span className="text-xl font-bold font-mono text-ink leading-none">{kpi.value}</span>
            <span className={`text-[10px] mt-1 font-semibold ${
              kpi.positive === true ? 'text-success' : kpi.positive === false ? 'text-danger' : 'text-warning'
            }`}>
              {kpi.trend}
            </span>
          </div>
        ))}
      </section>

      {/* --- Main Content --- */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_400px] xl:grid-cols-[650px_1fr] bg-border gap-[1px] overflow-hidden">
        
        {/* Left Column: Store List / Data Grid */}
        <div className="bg-panel flex flex-col overflow-hidden">
          <div className="px-5 py-3 border-b border-border bg-panel-header flex items-center justify-between">
            <h2 className="text-xs uppercase font-bold text-slate-600 flex items-center gap-2">
              <Store className="w-3.5 h-3.5" /> Mağaza Trafik Işığı & Performans Matrisi
            </h2>
            <div className="flex gap-2">
              <button 
                onClick={() => setActiveTab('overview')}
                className={`px-3 py-1 text-[10px] font-bold uppercase rounded border transition-all ${
                  activeTab === 'overview' ? 'bg-ink text-white border-ink' : 'bg-white text-slate-600 border-border hover:bg-slate-50'
                }`}
              >
                Genel Bakış
              </button>
              <button 
                onClick={() => setActiveTab('daily')}
                className={`px-3 py-1 text-[10px] font-bold uppercase rounded border transition-all ${
                  activeTab === 'daily' ? 'bg-ink text-white border-ink' : 'bg-white text-slate-600 border-border hover:bg-slate-50'
                }`}
              >
                Günlük Tempo
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto bg-white">
            <AnimatePresence mode="wait">
              {activeTab === 'overview' ? (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                >
                  <table className="w-full border-collapse text-[11px]">
                    <thead className="sticky top-0 z-10">
                      <tr className="bg-table-header border-b border-border shadow-sm">
                        <th className="text-left py-2.5 px-4 font-bold text-slate-500 uppercase">Durum</th>
                        <th className="text-left py-2.5 px-4 font-bold text-slate-500 uppercase">Mağaza</th>
                        <th className="text-right py-2.5 px-4 font-bold text-slate-500 uppercase">Ciro Gerc %</th>
                        <th className="text-right py-2.5 px-4 font-bold text-slate-500 uppercase">FBA</th>
                        <th className="text-right py-2.5 px-4 font-bold text-slate-500 uppercase">Dönüşüm</th>
                        <th className="text-right py-2.5 px-4 font-bold text-slate-500 uppercase">YDS</th>
                        <th className="py-2.5 px-4"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {STORES.map((store) => (
                        <tr 
                          key={store.id} 
                          onClick={() => setSelectedStoreId(store.id)}
                          className={`
                            cursor-pointer border-b border-border transition-colors group
                            ${selectedStoreId === store.id ? 'bg-blue-50/50' : 'hover:bg-slate-50'}
                            ${store.status === 'success' && selectedStoreId !== store.id ? 'bg-green-50/20' : ''}
                            ${store.status === 'danger' && selectedStoreId !== store.id ? 'bg-red-50/20' : ''}
                          `}
                        >
                          <td className="py-3 px-4">
                            <StatusIndicator status={store.status} />
                          </td>
                          <td className="py-3 px-4 font-bold text-ink">
                            {store.code} - {store.name}
                            {store.status === 'danger' && <AlertCircle className="inline-block ml-2 w-3 h-3 text-danger animate-pulse" />}
                          </td>
                          <td className={`py-3 px-4 text-right font-mono font-bold ${store.ciroGerc < 90 ? 'text-danger' : store.ciroGerc > 110 ? 'text-success' : 'text-slate-700'}`}>
                            %{store.ciroGerc}
                          </td>
                          <td className="py-3 px-4 text-right font-mono">{store.upt.toFixed(2)}</td>
                          <td className="py-3 px-4 text-right font-mono">%{store.conversion.toFixed(1)}</td>
                          <td className={`py-3 px-4 text-right font-bold ${store.yds < 7 ? 'text-danger' : store.yds > 9 ? 'text-success' : 'text-slate-700'}`}>
                            {store.yds}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <ArrowRight className={`w-3.5 h-3.5 transition-transform ${selectedStoreId === store.id ? 'translate-x-1 text-accent opacity-100' : 'text-slate-300 opacity-0 group-hover:opacity-100'}`} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </motion.div>
              ) : (
                <motion.div
                  key="daily"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="p-6"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-bold text-ink uppercase tracking-wider flex items-center gap-2">
                       <Clock className="w-4 h-4 text-accent" /> {selectedStore.name} // Günlük Tempo Eğrisi
                    </h3>
                    <div className="text-[10px] font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded">HEDEF: ₺45,000</div>
                  </div>
                  
                  <div className="space-y-4">
                    {[
                      { time: '10:00 - 12:00', ciro: '₺8,400', target: '₺7,500', status: 'success' },
                      { time: '12:00 - 14:00', ciro: '₺12,200', target: '₺15,000', status: 'warning' },
                      { time: '14:00 - 16:00', ciro: '₺6,800', target: '₺10,000', status: 'danger' },
                      { time: '16:00 - 18:00', ciro: '...', target: '₺12,500', status: 'pending' },
                    ].map((row, i) => (
                      <div key={i} className="flex items-center gap-4 bg-slate-50 p-4 rounded border border-border">
                        <div className="w-32 font-mono font-bold text-xs text-slate-500">{row.time}</div>
                        <div className="flex-1">
                          <div className="flex justify-between text-[10px] font-bold mb-1">
                            <span className="text-slate-400">GERÇEKLEŞEN: {row.ciro}</span>
                            <span className="text-slate-400">HEDEF: {row.target}</span>
                          </div>
                          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: row.status === 'pending' ? '0%' : row.status === 'success' ? '112%' : row.status === 'warning' ? '81%' : '68%' }}
                              className={`h-full ${row.status === 'success' ? 'bg-success' : row.status === 'warning' ? 'bg-warning' : row.status === 'danger' ? 'bg-danger' : 'bg-slate-300'}`}
                            />
                          </div>
                        </div>
                        <div className={`w-20 text-right font-mono font-bold text-xs ${row.status === 'success' ? 'text-success' : row.status === 'warning' ? 'text-warning' : row.status === 'danger' ? 'text-danger' : 'text-slate-300'}`}>
                          {row.status === 'pending' ? 'WAIT' : row.status === 'success' ? '+%12' : row.status === 'warning' ? '-%19' : '-%32'}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 p-4 border border-accent border-dashed rounded bg-blue-50/30 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-black text-accent uppercase">Sistem Teşhisi</div>
                      <div className="text-xs font-bold text-slate-700 mt-1">Saat 14:00 - 16:00 frekansı kritik sapma gösteriyor. Müdahale şart.</div>
                    </div>
                    <button 
                      onClick={() => setActiveModal('intervention')}
                      className="px-4 py-2 bg-ink text-white text-[10px] font-bold rounded hover:bg-black transition-colors"
                    >
                      MÜDAHALE ET
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="p-4 bg-slate-50 border-t border-border flex justify-between items-center shrink-0">
             <div className="flex gap-4">
                <div className="flex items-center gap-1.5 cursor-pointer">
                  <div className="w-2.5 h-2.5 bg-success rounded-full" />
                  <span className="text-[9px] font-bold text-slate-500">TAM HEDEFE ULAŞIM</span>
                </div>
                <div className="flex items-center gap-1.5 cursor-pointer">
                  <div className="w-2.5 h-2.5 bg-warning rounded-full" />
                  <span className="text-[9px] font-bold text-slate-500">YDS TAKİBİ GEREKEN</span>
                </div>
                <div className="flex items-center gap-1.5 cursor-pointer">
                  <div className="w-2.5 h-2.5 bg-danger rounded-full" />
                  <span className="text-[9px] font-bold text-slate-500">MÜDAHALE GEREKEN KOŞUL</span>
                </div>
             </div>
             <span className="text-[9px] font-mono text-slate-400">SON GÜNCELLEME: 09:42:15</span>
          </div>
        </div>

        {/* Right Column: Detail Scorecard */}
        <div className="bg-panel flex flex-col border-l border-border overflow-hidden">
          <div className="px-5 py-3 border-b border-border bg-panel-header flex items-center justify-between">
            <h2 className="text-xs uppercase font-bold text-slate-600 flex items-center gap-2">
              <ClipboardCheck className="w-3.5 h-3.5" /> Mağaza Detay Analizi (Drill-Down)
            </h2>
            <button 
              onClick={() => setActiveModal('print_preview')}
              className="px-2.5 py-1 text-[9px] font-bold uppercase bg-ink text-white rounded hover:bg-slate-800 transition-colors active:scale-95"
            >
              Yazdır / PDF
            </button>
          </div>

          <div className="flex-1 overflow-auto p-5 space-y-6">
            {/* Store Header */}
            <div className="flex justify-between items-start">
              <div>
                <motion.div 
                  key={selectedStore.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-lg font-extrabold text-ink"
                >
                  {selectedStore.code} - {selectedStore.name}
                </motion.div>
                <div className="text-[10px] text-slate-500 font-bold tracking-tight">
                  SEGMENT: <span className="text-accent">{selectedStore.segment}</span> | BÖLGE: <span className="text-ink">{selectedStore.region}</span>
                </div>
              </div>
              <div className="text-right">
                <motion.div 
                  key={selectedStore.index}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`text-3xl font-black leading-none ${
                    selectedStore.index < 70 ? 'text-danger' : selectedStore.index < 85 ? 'text-warning' : 'text-success'
                  }`}
                >
                  {selectedStore.index}
                  <span className="text-xs font-normal text-slate-400 ml-1">/ 100</span>
                </motion.div>
                <div className="text-[9px] uppercase font-bold text-slate-500 mt-1">Performans Endeksi</div>
              </div>
            </div>

            {/* Metric Radar-like Grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'YÖNETİM DİSİPLİNİ', val: `${selectedStore.yds} / 10.0`, sub: 'YDS Skoru' },
                { label: 'PERSONEL VERİMLİLİĞİ', val: selectedStore.personnelEfficiency, sub: 'Ciro / Saat' },
                { label: 'STOK DOĞRULUĞU', val: `%${selectedStore.stockAccuracy}`, sub: 'Sayım vs Sistem' },
                { label: 'ZİYARET SIKLIĞI', val: `${selectedStore.visitFrequency} / Hafta`, sub: 'Bölge Md. Ziyareti' },
              ].map((m, i) => (
                <div key={i} className="border border-border p-3 rounded-sm bg-slate-50/50">
                  <span className="text-[9px] font-bold text-slate-400 block mb-1 uppercase tracking-tighter">{m.label}</span>
                  <div className="text-sm font-bold font-mono text-ink">{m.val}</div>
                  <div className="text-[8px] text-slate-400 font-semibold">{m.sub}</div>
                </div>
              ))}
            </div>

            {/* Action List Section */}
            <div className="space-y-3 pt-2 border-t border-border border-dashed">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] uppercase font-black text-slate-600 flex items-center gap-1.5">
                  <AlertTriangle className="w-3 h-3 text-warning" /> Açık Aksiyonlar
                </h3>
                <span className="text-[9px] font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">{storeActions.length} AKSİYON</span>
              </div>

              <div className="space-y-1.5">
                {storeActions.length > 0 ? (
                  storeActions.map((action) => (
                    <div key={action.id} className="flex items-center gap-3 py-2 border-b border-slate-50 group hover:bg-slate-50/80 px-2 -mx-2 transition-colors">
                      <div className={`
                        shrink-0 text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase
                        ${action.status === 'Gecikmiş' ? 'bg-red-100 text-danger' : 
                          action.status === 'Kapatıldı' ? 'bg-green-100 text-success' : 'bg-slate-100 text-slate-600'}
                      `}>
                        {action.status}
                      </div>
                      <div className="flex-1 text-[10px] font-medium leading-tight text-ink group-hover:text-accent transition-colors">
                        {action.title}
                      </div>
                      <div className="text-[9px] font-mono text-slate-400 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" /> {action.deadline}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-[10px] text-slate-400 italic">
                    Bu mağaza için atanmış açık aksiyon bulunamadı.
                  </div>
                )}
              </div>
            </div>

            {/* Regional Manager's Note */}
            <div className="bg-slate-100/80 p-4 border-l-2 border-accent rounded-r-sm shadow-sm">
              <div className="text-[9px] font-black text-accent mb-2 flex items-center gap-1.5">
                <FileText className="w-3 h-3" /> BÖLGE MÜDÜRÜ NOTU
              </div>
              <p className="text-[11px] leading-relaxed font-medium italic text-slate-700 font-sans">
                "{selectedStore.managerNote}"
              </p>
            </div>

            {/* Quick Action Button */}
            <button 
              onClick={() => setActiveModal('new_action')}
              className="w-full py-2.5 bg-ink text-white font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-accent transition-all hover:shadow-lg rounded active:scale-95"
            >
              <MousePointerClick className="w-3.5 h-3.5" /> Yeni Aksiyon Ekle / Ziyaret Başlat
            </button>
          </div>
        </div>
      </main>

      {/* --- Footer / Alarms --- */}
      <footer className="h-[40px] bg-table-header border-t border-border flex items-center px-5 shrink-0 relative overflow-hidden">
        <div className="flex items-center gap-2 z-10 bg-table-header pr-4 h-full border-r border-border mr-4">
          <div className="w-1.5 h-1.5 bg-danger rounded-full alarm-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
          <span className="text-[10px] font-black text-danger uppercase tracking-tighter">ANLIK ALARM:</span>
        </div>
        
        <div className="flex-1 overflow-hidden relative h-full flex items-center group">
          <motion.div 
            animate={{ x: [1000, -2000] }}
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
            className="whitespace-nowrap flex gap-12 text-[11px] font-bold text-slate-600 selection:bg-accent/20"
          >
            {[
              "M402 (Zorlu) Mağazası saatlik satış temposu hedefin %25 altında kaldı. Müdahale Gerekli!",
              "Bölge genelinde Dönüşüm Oranı son 2 saatte %1.5 artış gösterdi.",
              "M104 (Nişantaşı) Mağazası dünkü Aksiyon Hedefini %100 kapatarak Kritik Başarı statüsüne geçti.",
              "Dikkat: Hafta sonu seansları için tüm mağazaların FBA odaklı ek satış kışkırtma planları aktif edildi."
            ].map((text, i) => (
              <span key={i} className="flex items-center gap-2 group-hover:text-accent transition-colors">
                <AlertCircle className="w-3 h-3" /> {text}
              </span>
            ))}
          </motion.div>
        </div>

        <div className="flex items-center gap-2 ml-4 pl-4 border-l border-border z-10 bg-table-header h-full">
           <span className="text-[10px] font-mono text-slate-400">FPS: 60.0</span>
           <div className="px-2 py-0.5 bg-accent text-white text-[9px] font-bold rounded-sm animate-pulse uppercase">LIVE DATA</div>
        </div>
      </footer>
    </div>
  );
}
