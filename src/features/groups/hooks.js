import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCurrentUser } from '../../store/useAuthStore';
import { createGroup, fetchGroupMembers, fetchGroups, joinGroupByInviteCode, leaveGroup } from './api';

export const groupsKey = ['groups'];
export const groupMembersKey = (groupId) => ['groups', groupId, 'members'];

export function useGroups() {
  const user = useCurrentUser();
  return useQuery({
    queryKey: groupsKey,
    queryFn: fetchGroups,
    enabled: !!user,
  });
}

export function useGroupMembers(groupId) {
  return useQuery({
    queryKey: groupMembersKey(groupId),
    queryFn: () => fetchGroupMembers(groupId),
    enabled: !!groupId,
  });
}

export function useCreateGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createGroup,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: groupsKey }),
  });
}

export function useJoinGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: joinGroupByInviteCode,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: groupsKey }),
  });
}

export function useLeaveGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: leaveGroup,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: groupsKey }),
  });
}

// Mismo endpoint que "salir del grupo" (borra la fila de group_members):
// la política RLS decide si te lo permite porque te vas tú mismo, o porque
// eres admin expulsando a otro (ver supabase/schema.sql, is_group_admin()).
export function useKickMember(groupId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: leaveGroup,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: groupMembersKey(groupId) }),
  });
}
