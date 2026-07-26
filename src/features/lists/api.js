import { supabase } from '../../lib/supabaseClient';

export async function fetchLists(groupId) {
  const { data, error } = await supabase
    .from('shopping_lists')
    .select('id, name, group_id, created_by, created_at')
    .eq('group_id', groupId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function createList({ groupId, name, userId }) {
  const { data, error } = await supabase
    .from('shopping_lists')
    .insert({ group_id: groupId, name, created_by: userId })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteList(listId) {
  const { error } = await supabase.from('shopping_lists').delete().eq('id', listId);
  if (error) throw error;
}

export async function fetchListItems(listId) {
  const { data, error } = await supabase
    .from('list_items')
    .select('id, name, quantity, is_checked, list_id, created_by, created_at')
    .eq('list_id', listId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data;
}

export async function addListItem({ listId, name, quantity, userId }) {
  const { data, error } = await supabase
    .from('list_items')
    .insert({ list_id: listId, name, quantity, created_by: userId })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function toggleListItem({ id, isChecked }) {
  const { data, error } = await supabase
    .from('list_items')
    .update({ is_checked: isChecked })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteListItem(id) {
  const { error } = await supabase.from('list_items').delete().eq('id', id);
  if (error) throw error;
}
