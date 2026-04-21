interface KPIBarProps {
  avgCiro: number;
  avgConversion: string;
  avgUpt: string;
  openCount: number;
  closureRate: number;
}

export function KPIBar({ avgCiro, avgConversion, avgUpt, openCount, closureRate }: KPIBarProps) {
  const kpis = [
    {
      label: 'CİRO',
      labelFull: 'BÖLGE CİRO ORTALAMASI',
      value: `%${avgCiro}`,
      trend: avgCiro >= 100 ? `▲ Hedefe ulaşıldı` : `▼ %${100 - avgCiro} açık`,
      positive: avgCiro >= 100,
    },
    {
      label: 'FBA',
      labelFull: 'FBA (Fatura Başına Adet)',
      value: avgUpt,
      trend: parseFloat(avgUpt) >= 2.2 ? '▲ Hedef üzeri' : '▼ Hedef altı',
      positive: parseFloat(avgUpt) >= 2.2,
    },
    {
      label: 'DÖNÜŞÜM',
      labelFull: 'DÖNÜŞÜM ORANI',
      value: `%${avgConversion}`,
      trend: parseFloat(avgConversion) >= 20 ? '▲ İyi' : '● Gelişim',
      positive: parseFloat(avgConversion) >= 20 ? true : null,
    },
    {
      label: 'AKSİYON',
      labelFull: 'AÇIK AKSİYONLAR',
      value: `${openCount}`,
      trend: openCount === 0 ? '✓ Temiz' : `${openCount} bekliyor`,
      positive: openCount === 0,
    },
    {
      label: 'KAPATMA',
      labelFull: 'AKSİYON KAPATMA %',
      value: `%${closureRate}`,
      trend: closureRate >= 80 ? '▲ Disiplinli' : '▼ Takip et',
      positive: closureRate >= 80,
    },
  ];

  return (
    <section className="flex overflow-x-auto shrink-0 border-b border-border bg-border gap-[1px] scrollbar-none" style={{scrollbarWidth:'none'}}>
      {kpis.map((kpi, i) => (
        <div key={i} className="bg-panel flex-shrink-0 flex-1 min-w-[120px] p-3 flex flex-col justify-center">
          {/* Mobilde kısa label, büyük ekranda uzun */}
          <span className="text-[9px] uppercase text-slate-400 font-bold mb-0.5 block sm:hidden leading-tight">{kpi.label}</span>
          <span className="text-[9px] uppercase text-slate-400 font-bold mb-0.5 hidden sm:block leading-tight">{kpi.labelFull}</span>
          <span className="text-lg font-bold font-mono text-ink leading-none">{kpi.value}</span>
          <span className={`text-[9px] mt-0.5 font-semibold truncate ${
            kpi.positive === true ? 'text-success' : kpi.positive === false ? 'text-danger' : 'text-warning'
          }`}>
            {kpi.trend}
          </span>
        </div>
      ))}
    </section>
  );
}
