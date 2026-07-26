import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Faltan VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. Copia .env.example a .env y rellena los valores de tu proyecto Supabase (Project Settings > API).'
  );
}

// Cliente único de Supabase para toda la app: auth, queries y realtime
// se hacen todos a través de esta misma instancia.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
