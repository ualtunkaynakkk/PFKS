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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadProfile(userId: string, email: string): Promise<AuthUser | null> {
    const { data, error } = await supabase
      .from('pfks_profiles')
      .select('id, full_name, role, store_id, is_active')
      .eq('id', userId)
      .single();

    if (error || !data) return null;

    const profile: PfksProfile = {
      id: data.id,
      fullName: data.full_name,
      role: data.role as PfksRole,
      storeId: data.store_id,
      isActive: data.is_active,
    };

    return { id: userId, email, profile };
  }

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
      if (session?.user) {
        const authUser = await loadProfile(session.user.id, session.user.email ?? '');
        setUser(authUser);
      } else {
        setUser(null);
      }
      if (event !== 'INITIAL_SESSION') setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string): Promise<string | null> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return error.message;
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
