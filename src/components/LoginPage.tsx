import { useState } from 'react';
import { motion } from 'motion/react';
import { Activity, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!email || !password) {
      setError('E-posta ve şifre zorunludur.');
      return;
    }
    setLoading(true);
    setError(null);
    const err = await signIn(email, password);
    if (err) {
      setError('E-posta veya şifre hatalı.');
    }
    setLoading(false);
  };

  const DEMO_ACCOUNTS = [
    { email: 'admin@penti.com',      role: 'Admin',              color: 'text-purple-600' },
    { email: 'bolge@penti.com',      role: 'Bölge Müdürü',       color: 'text-blue-600'   },
    { email: 'operasyon@penti.com',  role: 'Operasyon Müdürü',   color: 'text-amber-600'  },
    { email: 'zorlu@penti.com',      role: 'Mağaza Müdürü',      color: 'text-green-600'  },
  ];

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 bg-ink rounded-lg flex items-center justify-center">
            <Activity className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h1 className="text-lg font-black text-ink tracking-widest uppercase">PFKS</h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">Penti Bölge Yönetim Paneli</p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white border border-border rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-border bg-panel-header">
            <h2 className="text-xs font-bold text-ink uppercase tracking-wider">Sisteme Giriş</h2>
          </div>

          <div className="p-6 space-y-4">
            {/* Email */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase mb-1.5 block">
                E-posta
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                placeholder="kullanici@penti.com"
                className="w-full border border-border rounded px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent transition-all"
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase mb-1.5 block">
                Şifre
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  placeholder="••••••••"
                  className="w-full border border-border rounded px-3 py-2.5 pr-10 text-sm outline-none focus:ring-2 focus:ring-accent transition-all"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-ink transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-danger/20 rounded px-3 py-2 text-xs text-danger font-medium"
              >
                {error}
              </motion.div>
            )}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-2.5 bg-ink text-white font-bold text-sm rounded uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-accent transition-colors disabled:opacity-60 mt-2"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Giriş yapılıyor...</>
              ) : (
                'Giriş Yap'
              )}
            </button>
          </div>
        </div>

        {/* Demo hesapları */}
        <div className="mt-5 bg-white border border-border rounded-lg overflow-hidden">
          <div className="px-4 py-2.5 border-b border-border bg-panel-header">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Demo Hesapları — Şifre: Penti2026!</p>
          </div>
          <div className="divide-y divide-border">
            {DEMO_ACCOUNTS.map(acc => (
              <button
                key={acc.email}
                onClick={() => { setEmail(acc.email); setPassword('Penti2026!'); }}
                className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 transition-colors text-left"
              >
                <span className="text-xs font-medium text-slate-600">{acc.email}</span>
                <span className={`text-[10px] font-bold ${acc.color}`}>{acc.role}</span>
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
