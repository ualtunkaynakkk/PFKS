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
      value: `%${avgCiro}`,
      trend: avgCiro >= 100 ? `▲ Hedefte` : `▼ %${100 - avgCiro} açık`,
      positive: avgCiro >= 100,
    },
    {
      label: 'FBA',
      value: avgUpt,
      trend: parseFloat(avgUpt) >= 2.2 ? '▲ İyi' : '▼ Hedef altı',
      positive: parseFloat(avgUpt) >= 2.2,
    },
    {
      label: 'DÖNÜŞÜM',
      value: `%${avgConversion}`,
      trend: parseFloat(avgConversion) >= 20 ? '▲ İyi' : '● Gelişim',
      positive: parseFloat(avgConversion) >= 20 ? true : null,
    },
    {
      label: 'AKSİYON',
      value: `${openCount}`,
      trend: openCount === 0 ? '✓ Temiz' : `${openCount} bekliyor`,
      positive: openCount === 0,
    },
    {
      label: 'KAPATMA',
      value: `%${closureRate}`,
      trend: closureRate >= 80 ? '▲ Disiplinli' : '▼ Takip',
      positive: closureRate >= 80,
    },
  ];

  return (
    <div className="flex shrink-0 border-b border-border overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
      {kpis.map((kpi, i) => (
        <div
          key={i}
          className="flex-none w-[calc(50vw-1px)] sm:flex-1 sm:w-auto border-r border-border last:border-r-0 bg-panel px-3 py-2.5"
        >
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{kpi.label}</p>
          <p className="text-[22px] font-black font-mono text-ink leading-none">{kpi.value}</p>
          <p className={`text-[10px] font-semibold mt-1 ${
            kpi.positive === true ? 'text-success' : kpi.positive === false ? 'text-danger' : 'text-warning'
          }`}>
            {kpi.trend}
          </p>
        </div>
      ))}
    </div>
  );
}
