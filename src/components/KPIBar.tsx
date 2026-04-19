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
      label: 'BÖLGE CİRO ORTALAMASI',
      value: `%${avgCiro}`,
      trend: avgCiro >= 100 ? `▲ Hedefe ulaşıldı` : `▼ %${100 - avgCiro} hedef açığı`,
      positive: avgCiro >= 100,
    },
    {
      label: 'FBA (Fatura Başına Adet)',
      value: avgUpt,
      trend: parseFloat(avgUpt) >= 2.2 ? '▲ Hedef üzerinde' : '▼ Hedef altında',
      positive: parseFloat(avgUpt) >= 2.2,
    },
    {
      label: 'DÖNÜŞÜM ORANI',
      value: `%${avgConversion}`,
      trend: parseFloat(avgConversion) >= 20 ? '▲ İyi seviye' : '● Gelişim alanı',
      positive: parseFloat(avgConversion) >= 20 ? true : null,
    },
    {
      label: 'AÇIK AKSİYONLAR',
      value: `${openCount}`,
      trend: openCount === 0 ? '✓ Temiz tablo' : `${openCount} aksiyon bekliyor`,
      positive: openCount === 0,
    },
    {
      label: 'AKSİYON KAPATMA %',
      value: `%${closureRate}`,
      trend: closureRate >= 80 ? '▲ Yüksek disiplin' : '▼ Takip gerekli',
      positive: closureRate >= 80,
    },
  ];

  return (
    <section className="grid grid-cols-2 lg:grid-cols-5 gap-[1px] bg-border h-auto lg:h-[90px] shrink-0 border-b border-border">
      {kpis.map((kpi, i) => (
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
  );
}
