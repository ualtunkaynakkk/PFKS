import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, X, CheckCircle2, AlertCircle, FileSpreadsheet, Download, Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import type { StoreForm } from '../types';
import type { PfksRole } from '../types/auth';
import { RegionFilter } from '../types';

interface ParsedStore extends StoreForm {
  rowNum: number;
  errors: string[];
}

interface BulkImportModalProps {
  onClose: () => void;
  onImport: (stores: StoreForm[]) => Promise<void>;
  showToast: (msg: string) => void;
}

const REGIONS = ['Merkez', 'Asya', 'Anadolu'];
const SEGMENTS = ['A+', 'A', 'B', 'C'];
const STATUSES = ['success', 'stable', 'warning', 'danger', ''];

function parseRow(row: Record<string, unknown>, rowNum: number): ParsedStore {
  const errors: string[] = [];

  const code = String(row['Mağaza Kodu*'] ?? row['Mağaza Kodu'] ?? '').trim().toUpperCase();
  const name = String(row['Mağaza Adı*'] ?? row['Mağaza Adı'] ?? '').trim().toUpperCase();
  const region = String(row['Bölge*'] ?? row['Bölge'] ?? '').trim() as RegionFilter;
  const segment = String(row['Segment*'] ?? row['Segment'] ?? '').trim();
  const ciroGerc = parseFloat(String(row['Ciro Gerçekleşme %*'] ?? row['Ciro Gerçekleşme %'] ?? '0'));
  const upt = parseFloat(String(row['FBA*'] ?? row['FBA'] ?? '0'));
  const conversion = parseFloat(String(row['Dönüşüm Oranı %*'] ?? row['Dönüşüm Oranı %'] ?? '0'));
  const yds = parseFloat(String(row['YDS Skoru*'] ?? row['YDS Skoru'] ?? '0'));
  const stockAccuracy = parseFloat(String(row['Stok Doğruluğu %*'] ?? row['Stok Doğruluğu %'] ?? '0'));
  const visitFrequency = parseInt(String(row['Ziyaret/Hafta*'] ?? row['Ziyaret/Hafta'] ?? '0'));
  const personnelEfficiency = String(row['Personel Verimliliği'] ?? '').trim();
  const managerNote = String(row['Bölge Müdürü Notu'] ?? '').trim();
  const activeRaw = String(row['Aktif mi'] ?? 'TRUE').trim().toUpperCase();

  // Validasyonlar
  if (!code) errors.push('Mağaza Kodu boş');
  if (!name) errors.push('Mağaza Adı boş');
  if (!REGIONS.includes(region)) errors.push(`Bölge geçersiz: "${region}" (Merkez/Asya/Anadolu)`);
  if (!SEGMENTS.includes(segment)) errors.push(`Segment geçersiz: "${segment}" (A+/A/B/C)`);
  if (isNaN(ciroGerc) || ciroGerc < 0 || ciroGerc > 300) errors.push('Ciro Gerçekleşme 0-300 arası olmalı');
  if (isNaN(upt) || upt < 0 || upt > 10) errors.push('FBA 0-10 arası olmalı');
  if (isNaN(conversion) || conversion < 0 || conversion > 100) errors.push('Dönüşüm Oranı 0-100 arası olmalı');
  if (isNaN(yds) || yds < 0 || yds > 10) errors.push('YDS 0-10 arası olmalı');
  if (isNaN(stockAccuracy) || stockAccuracy < 0 || stockAccuracy > 100) errors.push('Stok Doğruluğu 0-100 arası olmalı');
  if (isNaN(visitFrequency) || visitFrequency < 0 || visitFrequency > 7) errors.push('Ziyaret/Hafta 0-7 arası olmalı');

  return {
    rowNum,
    errors,
    code,
    name,
    region: REGIONS.includes(region) ? region as RegionFilter : 'Merkez',
    segment: SEGMENTS.includes(segment) ? segment : 'A',
    ciroGerc: isNaN(ciroGerc) ? 100 : ciroGerc,
    upt: isNaN(upt) ? 2.0 : upt,
    conversion: isNaN(conversion) ? 18 : conversion,
    yds: isNaN(yds) ? 8 : yds,
    stockAccuracy: isNaN(stockAccuracy) ? 95 : stockAccuracy,
    visitFrequency: isNaN(visitFrequency) ? 2 : visitFrequency,
    personnelEfficiency: personnelEfficiency || '₺4.0k / saat',
    managerNote: managerNote || '',
  };
}

export function BulkImportModal({ onClose, onImport, showToast }: BulkImportModalProps) {
  const [parsed, setParsed] = useState<ParsedStore[]>([]);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'upload' | 'preview' | 'done'>('upload');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        
        // Satır 5'ten itibaren oku (1-4 başlık/örnek satırı)
        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
          range: 4, // 0-indexed → satır 5
          defval: '',
        });

        // Boş satırları filtrele
        const nonEmpty = rows.filter(r =>
          String(r['Mağaza Kodu*'] ?? r['Mağaza Kodu'] ?? '').trim() !== ''
        );

        const parsedRows = nonEmpty.map((row, i) => parseRow(row, i + 6));
        setParsed(parsedRows);
        setStep('preview');
      } catch (err) {
        showToast('Dosya okunamadı. Lütfen geçerli bir .xlsx dosyası seçin.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDrop = (e: DragEvent & {dataTransfer: DataTransfer}) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file?.name.endsWith('.xlsx')) handleFile(file);
    else showToast('Sadece .xlsx formatı desteklenir.');
  };

  const validRows = parsed.filter(r => r.errors.length === 0);
  const errorRows = parsed.filter(r => r.errors.length > 0);

  const handleImport = async () => {
    if (validRows.length === 0) return;
    setLoading(true);
    try {
      await onImport(validRows);
      setStep('done');
      showToast(`${validRows.length} mağaza başarıyla yüklendi.`);
    } catch (err) {
      showToast('Yükleme sırasında hata oluştu.');
    }
    setLoading(false);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }}
        className="bg-white rounded-lg shadow-2xl w-full max-w-2xl border border-border overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-panel-header px-6 py-4 border-b border-border flex items-center justify-between shrink-0">
          <h3 className="text-sm font-bold text-ink uppercase tracking-wider flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-accent" /> Excel'den Toplu Mağaza Yükle
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-ink p-1 rounded hover:bg-slate-100">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {step === 'upload' && (
            <div className="space-y-4">
              {/* Şablon indir */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-accent">Excel Şablonunu İndir</p>
                  <p className="text-xs text-slate-500 mt-0.5">Şablonu doldurup sisteme yükle. 100 satıra kadar mağaza eklenebilir.</p>
                </div>
                <a href="/PFKS_Magaza_Sablonu.xlsx" download
                  className="px-4 py-2 bg-accent text-white text-xs font-bold rounded uppercase flex items-center gap-1.5 hover:bg-blue-700 transition-colors shrink-0 whitespace-nowrap">
                  <Download className="w-3.5 h-3.5" /> Şablonu İndir
                </a>
              </div>

              {/* Dosya yükleme alanı */}
              <div
                onDrop={(e: React.DragEvent<HTMLDivElement>) => handleDrop(e)}
                onDragOver={e => e.preventDefault()}
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-border rounded-lg p-10 text-center cursor-pointer hover:border-accent hover:bg-blue-50/30 transition-all"
              >
                <Upload className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-bold text-slate-600">Dosyayı buraya sürükle veya tıkla</p>
                <p className="text-xs text-slate-400 mt-1">Sadece .xlsx formatı desteklenir</p>
                <input ref={fileRef} type="file" accept=".xlsx" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
              </div>
            </div>
          )}

          {step === 'preview' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-ink">{fileName}</p>
                <button onClick={() => { setParsed([]); setStep('upload'); }}
                  className="text-xs text-slate-400 hover:text-ink underline">Farklı dosya seç</button>
              </div>

              {/* Özet */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-50 border border-border rounded p-3 text-center">
                  <p className="text-xl font-black text-ink">{parsed.length}</p>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Toplam Satır</p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded p-3 text-center">
                  <p className="text-xl font-black text-success">{validRows.length}</p>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Geçerli</p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded p-3 text-center">
                  <p className="text-xl font-black text-danger">{errorRows.length}</p>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Hatalı</p>
                </div>
              </div>

              {/* Hatalı satırlar */}
              {errorRows.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-danger uppercase">Hatalı Satırlar (yüklenmeyecek)</p>
                  <div className="max-h-32 overflow-auto space-y-1">
                    {errorRows.map(row => (
                      <div key={row.rowNum} className="bg-red-50 border border-danger/20 rounded px-3 py-2 text-xs">
                        <span className="font-bold text-danger">Satır {row.rowNum}:</span>
                        <span className="text-slate-600 ml-2">{row.code || '(boş kod)'}</span>
                        <span className="text-danger ml-2">— {row.errors.join(', ')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Geçerli önizleme */}
              {validRows.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-success uppercase">Yüklenecek Mağazalar</p>
                  <div className="max-h-48 overflow-auto border border-border rounded">
                    <table className="w-full text-[10px]">
                      <thead className="sticky top-0 bg-table-header">
                        <tr>
                          {['Kod', 'Ad', 'Bölge', 'Seg.', 'Ciro%', 'FBA', 'Dön.%', 'YDS'].map(h => (
                            <th key={h} className="py-1.5 px-2 text-left font-bold text-slate-500">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {validRows.map((row, i) => (
                          <tr key={i} className="border-t border-border hover:bg-slate-50">
                            <td className="py-1.5 px-2 font-mono font-bold text-slate-600">{row.code}</td>
                            <td className="py-1.5 px-2 font-bold text-ink">{row.name}</td>
                            <td className="py-1.5 px-2 text-slate-500">{row.region}</td>
                            <td className="py-1.5 px-2 text-slate-500">{row.segment}</td>
                            <td className="py-1.5 px-2 font-mono">{row.ciroGerc}</td>
                            <td className="py-1.5 px-2 font-mono">{row.upt}</td>
                            <td className="py-1.5 px-2 font-mono">{row.conversion}</td>
                            <td className="py-1.5 px-2 font-mono">{row.yds}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 'done' && (
            <div className="flex flex-col items-center justify-center py-10 gap-4">
              <CheckCircle2 className="w-12 h-12 text-success" />
              <p className="text-base font-bold text-ink">{validRows.length} mağaza yüklendi</p>
              <p className="text-sm text-slate-400">Mağazalar sisteme başarıyla eklendi.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {step !== 'done' && (
          <div className="bg-slate-50 px-6 py-4 border-t border-border flex justify-end gap-3 shrink-0">
            <button onClick={onClose} className="px-4 py-2 text-xs font-bold text-slate-500 uppercase hover:text-ink">
              {step === 'done' ? 'Kapat' : 'İptal'}
            </button>
            {step === 'preview' && validRows.length > 0 && (
              <button onClick={handleImport} disabled={loading}
                className="px-4 py-2 bg-accent text-white text-xs font-bold rounded uppercase flex items-center gap-1.5 hover:bg-blue-700 disabled:opacity-60 transition-colors">
                {loading
                  ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Yükleniyor...</>
                  : <><Upload className="w-3.5 h-3.5" /> {validRows.length} Mağazayı Yükle</>
                }
              </button>
            )}
          </div>
        )}
        {step === 'done' && (
          <div className="bg-slate-50 px-6 py-4 border-t border-border flex justify-end shrink-0">
            <button onClick={onClose} className="px-4 py-2 bg-accent text-white text-xs font-bold rounded uppercase hover:bg-blue-700">
              Kapat
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
