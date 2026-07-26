import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';

/**
 * Zustand guarda SOLO la sesión de auth (identidad: "quién soy, estoy logueado").
 * Todo lo demás -perfil, grupos, listas, items- es "server state" y vive en
 * TanStack Query (ver src/features/*). La sesión va en zustand porque hace
 * falta de forma síncrona en muchos sitios (guards de rutas, headers, etc.)
 * antes de que ninguna query haya podido ejecutarse.
 */
export const useAuthStore = create((set) => ({
  session: null,
  status: 'loading', // 'loading' -> aún no sabemos si hay sesión | 'ready' -> ya lo sabemos
  setSession: (session) => set({ session, status: 'ready' }),
}));

// Selectors listos para usar en componentes, para no repetir `session?.user` por todas partes.
export const useCurrentUser = () => useAuthStore((state) => state.session?.user ?? null);
export const useAuthStatus = () => useAuthStore((state) => state.status);

/**
 * Arranca el listener de auth de Supabase y lo conecta al store.
 * Se llama UNA vez, en el componente raíz (ver src/App.jsx).
 * Devuelve una función de limpieza para el useEffect.
 */
export function initAuthListener() {
  supabase.auth.getSession().then(({ data: { session } }) => {
    useAuthStore.getState().setSession(session);
  });

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    useAuthStore.getState().setSession(session);
  });

  return () => subscription.unsubscribe();
}
