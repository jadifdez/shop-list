import { supabase } from '../../lib/supabaseClient';

// Funciones "planas" que solo hablan con Supabase. No tocan zustand ni
// TanStack Query: eso lo hacen los hooks (hooks.js) que las envuelven.
// Separar esto facilita testear la lógica de red con mocks simples.

export async function signUp({ email, password, username }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username } }, // -> new.raw_user_meta_data en el trigger SQL
  });
  if (error) throw error;
  return data;
}

export async function signIn({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function fetchProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, display_name, created_at')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data;
}
