import { act, renderHook, waitFor } from '@testing-library/react';

// import.meta.env (que usa src/lib/supabaseClient.js) no existe fuera de Vite,
// así que en Jest mockeamos SIEMPRE ese módulo en vez de dejar que se cargue
// de verdad. jest.mock con factory hace que el archivo real ni se ejecute.
jest.mock('../lib/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: jest.fn().mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } }),
    },
  },
}));

import { supabase } from '../lib/supabaseClient';
import { initAuthListener, useAuthStore, useCurrentUser } from './useAuthStore';

beforeEach(() => {
  useAuthStore.setState({ session: null, status: 'loading' });
  jest.clearAllMocks();
});

test('setSession guarda la sesión y marca status como "ready"', () => {
  act(() => {
    useAuthStore.getState().setSession({ user: { id: 'u1' } });
  });

  expect(useAuthStore.getState().status).toBe('ready');
  expect(useAuthStore.getState().session.user.id).toBe('u1');
});

test('useCurrentUser devuelve null si no hay sesión', () => {
  const { result } = renderHook(() => useCurrentUser());
  expect(result.current).toBeNull();
});

test('initAuthListener carga la sesión inicial desde supabase.auth.getSession', async () => {
  supabase.auth.getSession.mockResolvedValueOnce({ data: { session: { user: { id: 'u2' } } } });

  act(() => {
    initAuthListener();
  });

  await waitFor(() => expect(useAuthStore.getState().session?.user.id).toBe('u2'));
});
