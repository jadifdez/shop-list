import { supabase } from '../../lib/supabaseClient';

// Nota: no filtramos "where user is member" a mano en estas queries.
// Las policies RLS de supabase/schema.sql ya garantizan que `groups` y
// `group_members` solo devuelven filas de grupos a los que perteneces.

export async function fetchGroups() {
  const { data, error } = await supabase
    .from('groups')
    .select('id, name, invite_code, created_by, created_at')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function fetchGroupMembers(groupId) {
  const { data, error } = await supabase
    .from('group_members')
    .select('user_id, role, joined_at, profiles ( id, username, display_name )')
    .eq('group_id', groupId);
  if (error) throw error;
  return data;
}

export async function createGroup({ name, userId }) {
  // Insert y select van en dos peticiones separadas a propósito: si fueran
  // una sola (.insert().select()), Postgres genera un INSERT ... RETURNING,
  // y la policy de SELECT de "groups" se evalúa en ese mismo instante, antes
  // de que el trigger on_group_created (que te añade a group_members) haya
  // quedado visible. Separándolo, el segundo SELECT ocurre en su propia
  // petición, ya con la fila de group_members confirmada.
  const id = crypto.randomUUID();
  const { error: insertError } = await supabase
    .from('groups')
    .insert({ id, name, created_by: userId });
  if (insertError) throw insertError;

  const { data, error } = await supabase
    .from('groups')
    .select('id, name, invite_code, created_by, created_at')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function joinGroupByInviteCode(inviteCode) {
  const { data, error } = await supabase.rpc('join_group_by_invite_code', {
    p_code: inviteCode.trim(),
  });
  if (error) throw error;
  return data;
}

export async function leaveGroup({ groupId, userId }) {
  const { error } = await supabase
    .from('group_members')
    .delete()
    .eq('group_id', groupId)
    .eq('user_id', userId);
  if (error) throw error;
}
