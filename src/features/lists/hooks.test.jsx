import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';

// Mockeamos la capa de API (api.js) entera: así probamos que el HOOK hace
// bien su trabajo (pasar los argumentos correctos, invalidar la cache...)
// sin depender de una base de datos real ni de la red.
jest.mock('./api');
jest.mock('../../lib/supabaseClient', () => ({
  supabase: {
    channel: jest.fn(() => ({ on: jest.fn().mockReturnThis(), subscribe: jest.fn() })),
    removeChannel: jest.fn(),
  },
}));

import * as api from './api';
import { useAuthStore } from '../../store/useAuthStore';
import { useAddListItem, useListItems } from './hooks';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  // eslint-disable-next-line react/display-name
  return ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

beforeEach(() => {
  jest.clearAllMocks();
  useAuthStore.setState({ session: { user: { id: 'user-1' } }, status: 'ready' });
});

test('useListItems pide los items de la lista indicada', async () => {
  api.fetchListItems.mockResolvedValue([{ id: 'item-1', name: 'Pan' }]);

  const { result } = renderHook(() => useListItems('list-1'), { wrapper: createWrapper() });

  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(result.current.data).toEqual([{ id: 'item-1', name: 'Pan' }]);
  expect(api.fetchListItems).toHaveBeenCalledWith('list-1');
});

test('useAddListItem llama a la API con el listId y el userId de la sesión actual', async () => {
  api.addListItem.mockResolvedValue({ id: 'item-1', name: 'Leche' });

  const { result } = renderHook(() => useAddListItem('list-1'), { wrapper: createWrapper() });

  await act(async () => {
    await result.current.mutateAsync({ name: 'Leche', quantity: '2' });
  });

  expect(api.addListItem).toHaveBeenCalledWith({
    listId: 'list-1',
    name: 'Leche',
    quantity: '2',
    userId: 'user-1',
  });
});
