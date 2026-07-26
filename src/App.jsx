import { useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { RouterProvider } from 'react-router-dom';
import { queryClient } from './app/queryClient';
import { router } from './app/router';
import { ConfirmDialog } from './components/ConfirmDialog';
import { Toaster } from './components/Toaster';
import { initAuthListener, useAuthStatus } from './store/useAuthStore';

export default function App() {
  const status = useAuthStatus();

  // Arranca el listener de sesión de Supabase una sola vez, al montar la app.
  useEffect(() => initAuthListener(), []);

  return (
    <QueryClientProvider client={queryClient}>
      {status === 'loading' ? (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-400">
          Cargando...
        </div>
      ) : (
        <RouterProvider router={router} />
      )}
      <Toaster />
      <ConfirmDialog />
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
