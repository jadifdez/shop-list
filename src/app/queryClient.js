import { QueryClient } from '@tanstack/react-query';

// Config única de TanStack Query para toda la app.
// staleTime > 0 evita refetch instantáneo al re-montar un componente que ya
// tenía datos recientes; para una app colaborativa como esta, además usamos
// Supabase Realtime (ver features/lists/hooks.js) para invalidar antes de
// que el staleTime expire cuando OTRO usuario cambia algo.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
