# PFKS — Penti Performans Takip ve Kontrol Sistemi

> Bölge Yönetim Paneli | React 19 + Vite + TypeScript + Tailwind v4

## Özellikler

- Mağaza Trafik Işığı — Ciro %, FBA, Dönüşüm, YDS metriklerine göre renk kodlaması
- Performans Endeksi — TEMPO modeli ağırlıklı hesaplama (şeffaf formül)
- Bölge Filtresi — Merkez / Asya / Anadolu segmentasyonu
- Günlük Tempo — Mağaza bazlı saatlik ciro takibi
- Aksiyon Yönetimi — Controlled form, validasyon, mağaza bazlı kayıt
- AI Analizi — Gemini 2.0 Flash ile mağaza bazlı otomatik teşhis
- Güvenli API Katmanı — API key asla tarayıcıya gitmez

## Kurulum

```bash
npm install
cp .env.example .env.local
# .env.local içine GEMINI_API_KEY ekle
```

### Sadece frontend:
```bash
npm run dev
```

### Frontend + Backend proxy (AI analizi ile):
```bash
npm run dev:full
```

## Vercel Deploy

1. GitHub'a push et
2. vercel.com → New Project → repo seç
3. Environment Variables: GEMINI_API_KEY ekle
4. Deploy

## Güvenlik Mimarisi

```
Tarayıcı → POST /api/gemini {"prompt":"..."} → Vercel Serverless Function
                                                  (GEMINI_API_KEY burada)
                                                       ↓
                                                  Google Gemini API
```

## Proje Yapısı

```
src/
├── types/           TypeScript interface'leri
├── data/            Mock data + calcIndex formülü
├── hooks/           useStores, useActions
├── services/        Gemini servisi (güvenli proxy)
└── components/
    ├── modals/      NewAction, Intervention, PrintPreview
    ├── KPIBar.tsx
    ├── StoreTable.tsx
    ├── StoreDrillDown.tsx
    └── AlarmTicker.tsx
api/
└── gemini.ts        Vercel serverless proxy
server.ts            Local dev Express proxy
```
