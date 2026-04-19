import type { StoreData, Action, KPIWeights, DailySlot } from '../types';

// KPI Ağırlıkları — TEMPO modelinden alınmıştır
export const KPI_WEIGHTS: KPIWeights = {
  ciro: 0.35,
  conversion: 0.25,
  upt: 0.15,
  yds: 0.15,
  stockAccuracy: 0.05,
  visitFrequency: 0.05,
};

// Performans endeksini hesaplar (0-100)
export function calcIndex(store: StoreData): number {
  const ciroScore = Math.min(store.ciroGerc, 130) / 130 * 100;
  const convScore = Math.min(store.conversion, 30) / 30 * 100;
  const uptScore = Math.min(store.upt, 3.0) / 3.0 * 100;
  const ydsScore = store.yds * 10;
  const stockScore = store.stockAccuracy;
  const visitScore = Math.min(store.visitFrequency, 4) / 4 * 100;

  return Math.round(
    ciroScore * KPI_WEIGHTS.ciro +
    convScore * KPI_WEIGHTS.conversion +
    uptScore * KPI_WEIGHTS.upt +
    ydsScore * KPI_WEIGHTS.yds +
    stockScore * KPI_WEIGHTS.stockAccuracy +
    visitScore * KPI_WEIGHTS.visitFrequency
  );
}

export const STORES: StoreData[] = [
  {
    id: '1', code: 'M104', name: 'NİŞANTAŞI', segment: 'A+', region: 'Merkez',
    status: 'success', ciroGerc: 112, upt: 2.45, conversion: 22.1,
    yds: 9.2, personnelEfficiency: '₺4.8k / saat', stockAccuracy: 98.5,
    visitFrequency: 3,
    managerNote: 'Nişantaşı ekibi dönüşümde bölge lideri. Vitrin rotasyonu satışları destekliyor.',
  },
  {
    id: '2', code: 'M201', name: 'BAĞDAT CAD.', segment: 'A+', region: 'Asya',
    status: 'stable', ciroGerc: 98, upt: 2.10, conversion: 19.5,
    yds: 8.5, personnelEfficiency: '₺4.1k / saat', stockAccuracy: 96.0,
    visitFrequency: 2,
    managerNote: 'Cadde trafiği stabil. Hafta sonu seanslarına odaklanılmalı.',
  },
  {
    id: '3', code: 'M305', name: 'İSTİNYE PARK', segment: 'A+', region: 'Merkez',
    status: 'warning', ciroGerc: 92, upt: 1.95, conversion: 17.2,
    yds: 7.8, personnelEfficiency: '₺5.2k / saat', stockAccuracy: 92.4,
    visitFrequency: 2,
    managerNote: 'AVM trafiği artmasına rağmen sepet ortalaması geride kaldı. Cross-sell eğitimi planlanmalı.',
  },
  {
    id: '4', code: 'M402', name: 'ZORLU CENTER', segment: 'A+', region: 'Merkez',
    status: 'danger', ciroGerc: 81, upt: 1.82, conversion: 14.8,
    yds: 6.2, personnelEfficiency: '₺4.2k / saat', stockAccuracy: 94.2,
    visitFrequency: 2,
    managerNote: 'Zorlu mağazasında dönüşüm oranı kritik seviyede. Yarın sabah seansında karşılama disiplini için yerinde denetim yapılacak.',
  },
  {
    id: '5', code: 'M108', name: 'EMAAR SQUARE', segment: 'A', region: 'Asya',
    status: 'warning', ciroGerc: 88, upt: 2.05, conversion: 16.4,
    yds: 7.4, personnelEfficiency: '₺3.8k / saat', stockAccuracy: 95.1,
    visitFrequency: 1,
    managerNote: 'Emaar mağazasında personel eksikliği verimliliği düşürüyor.',
  },
  {
    id: '6', code: 'M212', name: 'VADİ İSTANBUL', segment: 'A', region: 'Merkez',
    status: 'stable', ciroGerc: 96, upt: 2.15, conversion: 18.9,
    yds: 8.1, personnelEfficiency: '₺4.5k / saat', stockAccuracy: 97.2,
    visitFrequency: 2,
    managerNote: 'Vadi performansı istikrarlı gidiyor. Stok yönetimi başarılı.',
  },
  {
    id: '7', code: 'M315', name: 'AKASYA AVM', segment: 'A', region: 'Asya',
    status: 'warning', ciroGerc: 89, upt: 1.98, conversion: 16.8,
    yds: 7.6, personnelEfficiency: '₺3.9k / saat', stockAccuracy: 93.8,
    visitFrequency: 2,
    managerNote: 'Akasya\'da trafik yoğun ancak dönüşüm baskı altında. Karşılama hattı güçlendirilmeli.',
  },
  {
    id: '8', code: 'M520', name: 'FORUM ANADOLU', segment: 'B', region: 'Anadolu',
    status: 'stable', ciroGerc: 101, upt: 2.22, conversion: 20.3,
    yds: 8.8, personnelEfficiency: '₺3.5k / saat', stockAccuracy: 96.7,
    visitFrequency: 2,
    managerNote: 'Forum Anadolu tutarlı performans sergiliyor. Sepet ortalaması bölge üzerinde.',
  },
];

export const INITIAL_ACTIONS: Action[] = [
  {
    id: 'a1', storeId: '4', title: 'Vitrindeki eksik mankenlerin tamamlanması',
    status: 'Gecikmiş', deadline: '2026-04-20', responsible: 'Görsel Düzenleme',
    problemArea: 'FBA', createdAt: '2026-04-15',
  },
  {
    id: 'a2', storeId: '4', title: 'Haftalık kasa eğitimi (Tüm personel)',
    status: 'Açık', deadline: '2026-04-22', responsible: 'Mağaza Müdürü',
    problemArea: 'Dönüşüm', createdAt: '2026-04-16',
  },
  {
    id: 'a3', storeId: '4', title: 'Kabin arkası düzenleme ve hızlandırma planı',
    status: 'Açık', deadline: '2026-04-23', responsible: 'Mağaza Müdürü',
    problemArea: 'Dönüşüm', createdAt: '2026-04-16',
  },
  {
    id: 'a4', storeId: '3', title: 'Kasa önü fırsat sepeti revizyonu',
    status: 'Açık', deadline: '2026-04-21', responsible: 'Mağaza Müdürü',
    problemArea: 'Sepet Ort.', createdAt: '2026-04-14',
  },
  {
    id: 'a5', storeId: '1', title: 'Yeni sezon ürün yerleşimi kontrolü',
    status: 'Kapatıldı', deadline: '2026-04-18', responsible: 'Görsel Düzenleme',
    problemArea: 'FBA', createdAt: '2026-04-10',
  },
  {
    id: 'a6', storeId: '5', title: 'Personel takviyesi talebi iletildi',
    status: 'Açık', deadline: '2026-04-25', responsible: 'Bölge Müdürü',
    problemArea: 'Stok', createdAt: '2026-04-17',
  },
];

// Günlük tempo slot'ları — mağaza bazlı mock
export const getDailySlots = (storeId: string): DailySlot[] => {
  const multipliers: Record<string, number[]> = {
    '1': [1.12, 0.95, 1.08, null as unknown as number],
    '2': [0.98, 0.88, 0.92, null as unknown as number],
    '3': [0.92, 0.81, 0.68, null as unknown as number],
    '4': [0.85, 0.79, 0.62, null as unknown as number],
    '5': [0.90, 0.84, 0.75, null as unknown as number],
    '6': [1.02, 0.94, 0.98, null as unknown as number],
    '7': [0.89, 0.82, 0.77, null as unknown as number],
    '8': [1.05, 0.97, 1.02, null as unknown as number],
  };
  const mults = multipliers[storeId] || [1, 1, 1, null];
  const targets = [7500, 15000, 10000, 12500];
  return [
    { time: '10:00 - 12:00', actual: mults[0] ? Math.round(targets[0] * mults[0]) : null, target: targets[0] },
    { time: '12:00 - 14:00', actual: mults[1] ? Math.round(targets[1] * mults[1]) : null, target: targets[1] },
    { time: '14:00 - 16:00', actual: mults[2] ? Math.round(targets[2] * mults[2]) : null, target: targets[2] },
    { time: '16:00 - 18:00', actual: null, target: targets[3] },
  ];
};
