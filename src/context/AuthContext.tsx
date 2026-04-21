import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../services/supabase';
import type { AuthUser, PfksProfile, PfksRole } from '../types/auth';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  signIn: async () => null,
  signOut: async () => {},
});

async function loadProfile(userId: string, email: string): Promise<AuthUser | null> {
  // Retry mekanizması — session tam oturmadan önce profil çekilemeyebilir
  for (let attempt = 0; attempt < 3; attempt++) {
    const { data, error } = await supabase
      .from('pfks_profiles')
      .select('id, full_name, role, store_id, is_active')
      .eq('id', userId)
      .single();

    if (data) {
      const profile: PfksProfile = {
        id: data.id,
        fullName: data.full_name,
        role: data.role as PfksRole,
        storeId: data.store_id,
        isActive: data.is_active,
      };
      return { id: userId, email, profile };
    }

    if (error?.code === 'PGRST116') {
      // Profil henüz oluşmamış — kısa bekle
      await new Promise(r => setTimeout(r, 300 * (attempt + 1)));
      continue;
    }

    // Başka bir hata — devam etme
    console.error('loadProfile error:', error);
    break;
  }
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mevcut oturumu kontrol et
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const authUser = await loadProfile(session.user.id, session.user.email ?? '');
        setUser(authUser);
      }
      setLoading(false);
    });

    // Auth state değişimlerini dinle
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const authUser = await loadProfile(session.user.id, session.user.email ?? '');
        setUser(authUser);
        setLoading(false);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setLoading(false);
      } else if (event === 'INITIAL_SESSION') {
        // getSession zaten handle ediyor, burada setLoading yapma
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string): Promise<string | null> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return error.message;
    
    // onAuthStateChange'i beklemeden direkt profil yükle
    if (data.user) {
      const authUser = await loadProfile(data.user.id, data.user.email ?? '');
      if (authUser) {
        setUser(authUser);
        setLoading(false);
      }
    }
    return null;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
