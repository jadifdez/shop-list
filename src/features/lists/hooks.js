import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabaseClient';
import { useCurrentUser } from '../../store/useAuthStore';
import {
  addListItem,
  createList,
  deleteList,
  deleteListItem,
  fetchListItems,
  fetchLists,
  toggleListItem,
} from './api';

export const listsKey = (groupId) => ['groups', groupId, 'lists'];
export const listItemsKey = (listId) => ['lists', listId, 'items'];

export function useLists(groupId) {
  return useQuery({
    queryKey: listsKey(groupId),
    queryFn: () => fetchLists(groupId),
    enabled: !!groupId,
  });
}

export function useCreateList(groupId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createList,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: listsKey(groupId) }),
  });
}

export function useDeleteList(groupId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteList,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: listsKey(groupId) }),
  });
}

export function useListItems(listId) {
  return useQuery({
    queryKey: listItemsKey(listId),
    queryFn: () => fetchListItems(listId),
    enabled: !!listId,
  });
}

function useInvalidateListItems(listId) {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: listItemsKey(listId) });
}

export function useAddListItem(listId) {
  const user = useCurrentUser();
  const invalidate = useInvalidateListItems(listId);
  return useMutation({
    mutationFn: ({ name, quantity }) => addListItem({ listId, name, quantity, userId: user.id }),
    onSuccess: invalidate,
  });
}

export function useToggleListItem(listId) {
  const invalidate = useInvalidateListItems(listId);
  return useMutation({ mutationFn: toggleListItem, onSuccess: invalidate });
}

export function useDeleteListItem(listId) {
  const invalidate = useInvalidateListItems(listId);
  return useMutation({ mutationFn: deleteListItem, onSuccess: invalidate });
}

/**
 * Se suscribe a Supabase Realtime para la lista actual: cuando otro miembro
 * de la familia añade/marca/borra un item, invalidamos la query y TanStack
 * Query hace el refetch. Así no hace falta hacer polling ni tocar el estado
 * a mano: Realtime solo decide *cuándo* refrescar, TanStack Query decide *qué*
 * pedir y cachea el resultado.
 */
export function useListItemsRealtime(listId) {
  const invalidate = useInvalidateListItems(listId);

  useEffect(() => {
    if (!listId) return;

    const channel = supabase
      .channel(`list_items:${listId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'list_items', filter: `list_id=eq.${listId}` },
        () => invalidate()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listId]);
}
