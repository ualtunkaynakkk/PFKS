import { motion } from 'motion/react';
import { AlertCircle } from 'lucide-react';
import type { StoreData } from '../types';

interface AlarmTickerProps {
  stores: StoreData[];
}

export function AlarmTicker({ stores }: AlarmTickerProps) {
  // Dinamik alarmlar mağaza datasından üretilir
  const alarms = [
    ...stores.filter(s => s.status === 'danger').map(s =>
      `${s.code} (${s.name}) mağazası kritik risk seviyesinde — anlık müdahale önerilir.`
    ),
    ...stores.filter(s => s.status === 'warning').map(s =>
      `${s.code} (${s.name}) takip modunda — dönüşüm oranı %${s.conversion.toFixed(1)}.`
    ),
    ...stores.filter(s => s.status === 'success').map(s =>
      `${s.code} (${s.name}) bölge lideri — ciro gerçekleşme %${s.ciroGerc}.`
    ),
  ];

  const tickerText = alarms.join('     ◆     ');

  return (
    <footer className="h-[40px] bg-table-header border-t border-border flex items-center px-5 shrink-0 relative overflow-hidden">
      <div className="flex items-center gap-2 z-10 bg-table-header pr-4 h-full border-r border-border mr-4 shrink-0">
        <div className="w-1.5 h-1.5 bg-danger rounded-full alarm-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
        <span className="text-[10px] font-black text-danger uppercase tracking-tighter">ANLIK DURUM:</span>
      </div>

      <div className="flex-1 overflow-hidden relative h-full flex items-center">
        <motion.div
          animate={{ x: ['100%', '-100%'] }}
          transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
          className="whitespace-nowrap flex gap-8 text-[11px] font-bold text-slate-600"
        >
          {tickerText}
        </motion.div>
      </div>

      <div className="flex items-center gap-2 ml-4 pl-4 border-l border-border z-10 bg-table-header h-full shrink-0">
        <div className="px-2 py-0.5 bg-success text-white text-[9px] font-bold rounded-sm uppercase">
          {stores.filter(s => s.status === 'success').length} BAŞARI
        </div>
        <div className="px-2 py-0.5 bg-danger text-white text-[9px] font-bold rounded-sm uppercase">
          {stores.filter(s => s.status === 'danger').length} RİSK
        </div>
      </div>
    </footer>
  );
}
