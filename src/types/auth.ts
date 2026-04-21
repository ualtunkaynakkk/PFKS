export type PfksRole = 'admin' | 'bolge_muduru' | 'operasyon_muduru' | 'magaza_muduru';

export interface PfksProfile {
  id: string;
  fullName: string;
  role: PfksRole;
  storeId: string | null;
  isActive: boolean;
}

export interface AuthUser {
  id: string;
  email: string;
  profile: PfksProfile;
}

// ─── Yetki Matrisi ────────────────────────────────────────────────
// Mağaza Müdürü : Sadece kendi mağazası, aksiyon kapatma
// Operasyon Md. : Görüntüleme + ziyaret + aksiyon ekleme
// Bölge Müdürü  : Tüm operasyonel yetkiler + mağaza yönetimi
// Admin         : Her şey
export const PERMISSIONS = {
  // Mağaza
  store_view:      ['admin', 'bolge_muduru', 'operasyon_muduru', 'magaza_muduru'] as PfksRole[],
  store_add:       ['admin', 'bolge_muduru'] as PfksRole[],
  store_edit:      ['admin', 'bolge_muduru'] as PfksRole[],
  store_delete:    ['admin', 'bolge_muduru'] as PfksRole[],

  // KPI Bar — mağaza müdürüne kapalı
  kpi_view:        ['admin', 'bolge_muduru', 'operasyon_muduru'] as PfksRole[],
  kpi_update:      ['admin', 'bolge_muduru'] as PfksRole[],

  // Aksiyonlar
  action_view:     ['admin', 'bolge_muduru', 'operasyon_muduru', 'magaza_muduru'] as PfksRole[],
  action_add:      ['admin', 'bolge_muduru', 'operasyon_muduru'] as PfksRole[],  // ✅ OP ekle
  action_close:    ['admin', 'bolge_muduru', 'operasyon_muduru', 'magaza_muduru'] as PfksRole[],
  action_comment:  ['admin', 'bolge_muduru', 'operasyon_muduru', 'magaza_muduru'] as PfksRole[],

  // Ziyaret
  visit_view:      ['admin', 'bolge_muduru', 'operasyon_muduru', 'magaza_muduru'] as PfksRole[],
  visit_add:       ['admin', 'bolge_muduru', 'operasyon_muduru'] as PfksRole[],  // ✅ OP ekle

  // Takip sekmesi — mağaza müdürüne kapalı
  tracking_view:   ['admin', 'bolge_muduru', 'operasyon_muduru'] as PfksRole[],

  // Kullanıcı yönetimi
  user_manage:     ['admin'] as PfksRole[],
} as const;

export type Permission = keyof typeof PERMISSIONS;

export function hasPermission(role: PfksRole | undefined, permission: Permission): boolean {
  if (!role) return false;
  return (PERMISSIONS[permission] as readonly string[]).includes(role);
}

export const ROLE_LABELS: Record<PfksRole, string> = {
  admin:            'Admin',
  bolge_muduru:     'Bölge Müdürü',
  operasyon_muduru: 'Operasyon Müdürü',
  magaza_muduru:    'Mağaza Müdürü',
};

export const ROLE_COLORS: Record<PfksRole, string> = {
  admin:            'bg-purple-100 text-purple-700',
  bolge_muduru:     'bg-blue-100 text-blue-700',
  operasyon_muduru: 'bg-amber-100 text-amber-700',
  magaza_muduru:    'bg-green-100 text-green-700',
};
