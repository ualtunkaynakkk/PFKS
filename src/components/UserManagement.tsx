import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users, Plus, Pencil, Trash2, Shield, X, Save,
  Eye, EyeOff, RefreshCw, CheckCircle2, AlertCircle, Loader2
} from 'lucide-react';
import { supabase } from '../services/supabase';
import { ROLE_LABELS, ROLE_COLORS } from '../types/auth';
import type { PfksRole } from '../types/auth';

const EDGE_URL = 'https://nbzktfignblwxuyeajci.supabase.co/functions/v1/pfks-admin';
const ROLES: { value: PfksRole; label: string }[] = [
  { value: 'admin',            label: 'Admin' },
  { value: 'bolge_muduru',     label: 'Bölge Müdürü' },
  { value: 'operasyon_muduru', label: 'Operasyon Müdürü' },
  { value: 'magaza_muduru',    label: 'Mağaza Müdürü' },
];

interface UserRow {
  id: string;
  email: string;
  createdAt: string;
  profile: { full_name: string; role: PfksRole; store_id: string | null; is_active: boolean } | null;
}

interface StoreOption { id: string; code: string; name: string; }

async function callAdmin(path: string, method = 'GET', body?: object) {
  const { data: { session } } = await supabase.auth.getSession();
  const res = await fetch(`${EDGE_URL}/${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session?.access_token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

// ─── User Form Modal ──────────────────────────────────────────────────────────
interface UserFormProps {
  user?: UserRow;
  stores: StoreOption[];
  onClose: () => void;
  onSave: () => void;
  showToast: (msg: string) => void;
}

function UserFormModal({ user, stores, onClose, onSave, showToast }: UserFormProps) {
  const isEdit = !!user;
  const [form, setForm] = useState({
    email:      user?.email ?? '',
    fullName:   user?.profile?.full_name ?? '',
    role:       (user?.profile?.role ?? 'magaza_muduru') as PfksRole,
    storeId:    user?.profile?.store_id ?? '',
    isActive:   user?.profile?.is_active ?? true,
    password:   '',
    showPass:   false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$';
    const pwd = Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    setForm(f => ({ ...f, password: pwd, showPass: true }));
  };

  const handleSave = async () => {
    if (!form.fullName.trim()) { setError('Ad Soyad zorunlu'); return; }
    if (!isEdit && !form.email.trim()) { setError('E-posta zorunlu'); return; }
    if (!isEdit && form.password.length < 8) { setError('Şifre en az 8 karakter olmalı'); return; }

    setLoading(true);
    setError(null);

    try {
      if (isEdit) {
        await callAdmin('update-user', 'POST', {
          userId: user!.id,
          fullName: form.fullName,
          role: form.role,
          storeId: form.storeId || null,
          isActive: form.isActive,
          ...(form.password ? { newPassword: form.password } : {}),
        });
        showToast(`${form.fullName} güncellendi.`);
      } else {
        const res = await callAdmin('create-user', 'POST', {
          email: form.email,
          password: form.password,
          fullName: form.fullName,
          role: form.role,
          storeId: form.storeId || null,
        });
        if (res.error) { setError(res.error); setLoading(false); return; }
        showToast(`${form.fullName} oluşturuldu.`);
      }
      onSave();
      onClose();
    } catch {
      setError('Bir hata oluştu.');
    }
    setLoading(false);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }}
        className="bg-white rounded-lg shadow-2xl w-full max-w-md border border-border overflow-hidden">
        <div className="bg-panel-header px-6 py-4 border-b border-border flex items-center justify-between">
          <h3 className="text-sm font-bold text-ink uppercase tracking-wider">
            {isEdit ? `Kullanıcı Düzenle — ${user!.profile?.full_name}` : 'Yeni Kullanıcı'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-ink p-1 rounded hover:bg-slate-100">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Ad Soyad */}
          <div>
            <label className="label">Ad Soyad *</label>
            <input value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
              className="input" placeholder="Ümit Altunkaynak" />
          </div>

          {/* E-posta (sadece yeni kullanıcıda) */}
          {!isEdit && (
            <div>
              <label className="label">E-posta *</label>
              <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="input" placeholder="kullanici@penti.com" />
            </div>
          )}

          {/* Şifre */}
          <div>
            <label className="label">{isEdit ? 'Yeni Şifre (boş bırakırsan değişmez)' : 'Şifre *'}</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input type={form.showPass ? 'text' : 'password'}
                  value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="input pr-10" placeholder={isEdit ? '••••••••' : 'En az 8 karakter'} />
                <button type="button" onClick={() => setForm(f => ({ ...f, showPass: !f.showPass }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-ink">
                  {form.showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <button onClick={generatePassword} title="Otomatik şifre oluştur"
                className="px-3 py-2 border border-border rounded text-xs font-bold text-slate-500 hover:bg-slate-50 transition-colors flex items-center gap-1 shrink-0">
                <RefreshCw className="w-3.5 h-3.5" /> Üret
              </button>
            </div>
            {form.password && form.showPass && (
              <p className="text-[10px] text-success font-mono mt-1 bg-green-50 px-2 py-1 rounded">
                ✓ Şifre: {form.password}
              </p>
            )}
          </div>

          {/* Rol */}
          <div>
            <label className="label">Rol *</label>
            <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value as PfksRole, storeId: '' }))}
              className="input">
              {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>

          {/* Mağaza (sadece mağaza müdürü için) */}
          {form.role === 'magaza_muduru' && (
            <div>
              <label className="label">Atanacak Mağaza</label>
              <select value={form.storeId} onChange={e => setForm(f => ({ ...f, storeId: e.target.value }))} className="input">
                <option value="">Mağaza seçin...</option>
                {stores.map(s => <option key={s.id} value={s.id}>{s.code} — {s.name}</option>)}
              </select>
            </div>
          )}

          {/* Aktif/Pasif (düzenleme modunda) */}
          {isEdit && (
            <label className="flex items-center gap-3 cursor-pointer">
              <div className={`w-10 h-6 rounded-full transition-colors relative ${form.isActive ? 'bg-success' : 'bg-slate-300'}`}
                onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isActive ? 'translate-x-5' : 'translate-x-1'}`} />
              </div>
              <span className="text-xs font-bold text-slate-600">
                {form.isActive ? 'Aktif' : 'Pasif'}
              </span>
            </label>
          )}

          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="bg-red-50 border border-danger/20 rounded px-3 py-2 text-xs text-danger font-medium flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {error}
            </motion.div>
          )}
        </div>

        <div className="bg-slate-50 px-6 py-4 border-t border-border flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-xs font-bold text-slate-500 uppercase hover:text-ink">İptal</button>
          <button onClick={handleSave} disabled={loading}
            className="px-4 py-2 bg-accent text-white text-xs font-bold rounded uppercase flex items-center gap-1.5 hover:bg-blue-700 disabled:opacity-60 transition-colors">
            {loading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Kaydediliyor...</> : <><Save className="w-3.5 h-3.5" /> Kaydet</>}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Ana Panel ────────────────────────────────────────────────────────────────
interface UserManagementProps { showToast: (msg: string) => void; }

export function UserManagement({ showToast }: UserManagementProps) {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [stores, setStores] = useState<StoreOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [panel, setPanel] = useState<'none' | 'new' | string>('none');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await callAdmin('users');
    setUsers(res.users ?? []);
    setStores(res.stores ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (userId: string) => {
    setDeleting(true);
    const res = await callAdmin('delete-user', 'POST', { userId });
    if (res.error) { showToast(`Hata: ${res.error}`); }
    else { showToast('Kullanıcı silindi.'); }
    setDeleteConfirm(null);
    setDeleting(false);
    load();
  };

  const editUser = users.find(u => u.id === panel);

  const getStoreName = (storeId: string | null) => {
    if (!storeId) return '—';
    const s = stores.find(x => x.id === storeId);
    return s ? `${s.code} — ${s.name}` : '—';
  };

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-5 py-3 border-b border-border bg-panel-header flex items-center justify-between shrink-0">
        <h2 className="text-xs uppercase font-bold text-slate-600 flex items-center gap-2">
          <Users className="w-3.5 h-3.5" /> Kullanıcı Yönetimi
          <span className="text-[10px] font-mono bg-accent/10 text-accent px-2 py-0.5 rounded-full ml-1">
            {users.filter(u => u.profile?.is_active !== false).length} Aktif
          </span>
        </h2>
        <button onClick={() => setPanel('new')}
          className="px-3 py-1.5 bg-accent text-white text-[10px] font-bold rounded uppercase flex items-center gap-1.5 hover:bg-blue-700 transition-colors">
          <Plus className="w-3 h-3" /> Yeni Kullanıcı
        </button>
      </div>

      {/* Tablo */}
      <div className="flex-1 overflow-auto bg-white">
        {loading ? (
          <div className="flex items-center justify-center h-full gap-3">
            <Loader2 className="w-6 h-6 text-accent animate-spin" />
            <span className="text-xs text-slate-400">Yükleniyor...</span>
          </div>
        ) : (
          <>
            {/* Mobil: Kart görünümü */}
            <div className="sm:hidden divide-y divide-border">
              {users.map(user => (
                <div key={user.id} className={`p-4 ${user.profile?.is_active === false ? 'opacity-50' : ''}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-ink truncate">{user.profile?.full_name ?? '—'}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        {user.profile?.role && (
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${ROLE_COLORS[user.profile.role]}`}>
                            {ROLE_LABELS[user.profile.role]}
                          </span>
                        )}
                        {user.profile?.store_id && (
                          <span className="text-[9px] text-slate-400">{getStoreName(user.profile.store_id)}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => setPanel(user.id)}
                        className="p-2 rounded hover:bg-blue-50 text-accent transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setDeleteConfirm(user.id)}
                        className="p-2 rounded hover:bg-red-50 text-danger transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop: Tablo */}
            <table className="hidden sm:table w-full border-collapse text-[11px]">
              <thead className="sticky top-0 z-10">
                <tr className="bg-table-header border-b border-border">
                  {['Ad Soyad', 'E-posta', 'Rol', 'Mağaza', 'Durum', 'İşlem'].map(h => (
                    <th key={h} className="py-2.5 px-4 text-left font-bold text-slate-500 uppercase text-[10px]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} className={`border-b border-border hover:bg-slate-50 transition-colors ${user.profile?.is_active === false ? 'opacity-40' : ''}`}>
                    <td className="py-3 px-4 font-bold text-ink">{user.profile?.full_name ?? '—'}</td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-[10px]">{user.email}</td>
                    <td className="py-3 px-4">
                      {user.profile?.role ? (
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${ROLE_COLORS[user.profile.role]}`}>
                          {ROLE_LABELS[user.profile.role]}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[10px]">
                      {getStoreName(user.profile?.store_id ?? null)}
                    </td>
                    <td className="py-3 px-4">
                      {user.profile?.is_active !== false ? (
                        <span className="flex items-center gap-1 text-success text-[10px] font-bold">
                          <CheckCircle2 className="w-3 h-3" /> Aktif
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[10px] font-bold">Pasif</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setPanel(user.id)}
                          className="p-1.5 rounded hover:bg-blue-50 text-accent transition-colors" title="Düzenle">
                          <Pencil className="w-3 h-3" />
                        </button>
                        <button onClick={() => setDeleteConfirm(user.id)}
                          className="p-1.5 rounded hover:bg-red-50 text-danger transition-colors" title="Sil">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>

      {/* Bilgi Kutusu */}
      <div className="px-5 py-3 bg-slate-50 border-t border-border shrink-0">
        <div className="flex items-start gap-2">
          <Shield className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
          <p className="text-[10px] text-slate-400 leading-relaxed">
            Şifre değiştirme için kullanıcıyı düzenle → Yeni Şifre alanını doldur ve kaydet.
            Mağaza müdürü rolü için mutlaka mağaza ataması yap.
          </p>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {panel === 'new' && (
          <UserFormModal stores={stores} onClose={() => setPanel('none')} onSave={load} showToast={showToast} />
        )}
        {editUser && (
          <UserFormModal user={editUser} stores={stores} onClose={() => setPanel('none')} onSave={load} showToast={showToast} />
        )}
        {deleteConfirm && (() => {
          const u = users.find(x => x.id === deleteConfirm);
          return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm">
              <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }}
                className="bg-white rounded-lg p-6 shadow-2xl w-full max-w-sm border border-border">
                <div className="flex items-start gap-3 mb-5">
                  <AlertCircle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-ink">{u?.profile?.full_name} silinsin mi?</p>
                    <p className="text-xs text-slate-400 mt-1">Bu işlem geri alınamaz. Kullanıcının tüm verisi silinir.</p>
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-xs font-bold text-slate-500 uppercase">İptal</button>
                  <button onClick={() => handleDelete(deleteConfirm)} disabled={deleting}
                    className="px-4 py-2 bg-danger text-white text-xs font-bold rounded uppercase flex items-center gap-1.5 disabled:opacity-60">
                    {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    Sil
                  </button>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
