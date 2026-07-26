import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FaCrown } from 'react-icons/fa';
import { FiCopy, FiTrash2 } from 'react-icons/fi';
import { AppHeader } from '../components/AppHeader';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { useGroupMembers, useGroups, useKickMember, useLeaveGroup } from '../features/groups/hooks';
import { useCreateList, useDeleteList, useLists } from '../features/lists/hooks';
import { useCurrentUser } from '../store/useAuthStore';
import { confirm } from '../store/useConfirmStore';
import { useNotificationStore } from '../store/useNotificationStore';

export default function GroupDetailPage() {
  const { groupId } = useParams();
  const user = useCurrentUser();
  const navigate = useNavigate();
  const notify = useNotificationStore((state) => state.notify);

  // Mismo queryKey que en GroupsPage: si ya estaba cacheado, esto no
  // dispara una petición nueva, solo lee del cache de TanStack Query.
  const { data: groups, isLoading: groupsLoading } = useGroups();
  const group = groups?.find((g) => g.id === groupId);

  // Si la URL apunta a un grupo que no existe o al que ya no perteneces
  // (p.ej. saliste, te expulsaron, o el id es inválido), fuera a /groups.
  useEffect(() => {
    if (!groupsLoading && groups && !group) {
      navigate('/groups', { replace: true });
    }
  }, [groupsLoading, groups, group, navigate]);

  const { data: members } = useGroupMembers(groupId);
  const { data: lists, isLoading: listsLoading } = useLists(groupId);
  const createList = useCreateList(groupId);
  const deleteList = useDeleteList(groupId);
  const kickMember = useKickMember(groupId);
  const leaveGroup = useLeaveGroup();

  const myMembership = members?.find((m) => m.user_id === user.id);
  const isAdmin = myMembership?.role === 'admin';

  const [newListName, setNewListName] = useState('');

  function handleCreateList(e) {
    e.preventDefault();
    if (!newListName.trim()) return;
    createList.mutate(
      { groupId, name: newListName.trim(), userId: user.id },
      {
        onSuccess: () => setNewListName(''),
        onError: (error) => notify(error.message, 'error'),
      }
    );
  }

  async function handleDeleteList(list) {
    const ok = await confirm({
      title: 'Borrar lista',
      message: `¿Borrar la lista "${list.name}"? Se perderán todos sus productos.`,
      confirmLabel: 'Borrar',
      danger: true,
    });
    if (!ok) return;
    deleteList.mutate(list.id, { onError: (error) => notify(error.message, 'error') });
  }

  async function handleKick(member) {
    const ok = await confirm({
      title: 'Expulsar miembro',
      message: `¿Expulsar a ${member.profiles?.username} del grupo?`,
      confirmLabel: 'Expulsar',
      danger: true,
    });
    if (!ok) return;
    kickMember.mutate(
      { groupId, userId: member.user_id },
      { onError: (error) => notify(error.message, 'error') }
    );
  }

  async function handleLeaveGroup() {
    const ok = await confirm({
      title: 'Salir del grupo',
      message: '¿Seguro que quieres salir de este grupo?',
      confirmLabel: 'Salir',
      danger: true,
    });
    if (!ok) return;
    leaveGroup.mutate(
      { groupId, userId: user.id },
      {
        onSuccess: () => navigate('/groups', { replace: true }),
        onError: (error) => notify(error.message, 'error'),
      }
    );
  }

  async function handleCopyInviteCode() {
    if (!group) return;
    await navigator.clipboard.writeText(group.invite_code);
    notify('Código copiado');
  }

  if (!groupsLoading && groups && !group) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader />

      <main className="mx-auto max-w-3xl px-4 py-6 sm:py-8">
        <Link to="/groups" className="text-sm text-slate-500 hover:underline">
          ← Mis grupos
        </Link>

        <div className="mt-3 mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-xl font-semibold text-slate-900">{group?.name ?? 'Grupo'}</h1>
          {group && (
            <button
              onClick={handleCopyInviteCode}
              className="flex items-center gap-1.5 self-start rounded-full bg-slate-100 px-3 py-1.5 text-xs text-slate-500 active:bg-slate-200"
            >
              Código: <span className="font-mono text-slate-700">{group.invite_code}</span>
              <FiCopy aria-hidden="true" />
            </button>
          )}
        </div>

        <Card className="mb-6">
          <h2 className="mb-3 text-sm font-semibold text-slate-700">Miembros</h2>
          <ul className="flex flex-col gap-1">
            {members?.map((m) => (
              <li key={m.user_id} className="flex items-center justify-between gap-2 py-1.5">
                <span className="flex items-center gap-2 text-sm text-slate-700">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
                    {m.profiles?.username?.[0]?.toUpperCase()}
                  </span>
                  {m.profiles?.username}
                  {m.role === 'admin' && <FaCrown className="text-amber-500" title="Admin del grupo" />}
                </span>
                {isAdmin && m.user_id !== user.id && (
                  <Button
                    variant="ghost"
                    className="!px-3 !py-2 text-xs text-red-600 hover:bg-red-50"
                    onClick={() => handleKick(m)}
                    disabled={kickMember.isPending}
                  >
                    Expulsar
                  </Button>
                )}
              </li>
            ))}
          </ul>

          <Button
            variant="ghost"
            className="mt-3 w-full text-xs text-slate-400 hover:bg-slate-50 sm:w-auto"
            onClick={handleLeaveGroup}
            disabled={leaveGroup.isPending}
          >
            Salir del grupo
          </Button>
        </Card>

        <Card className="mb-6">
          <h2 className="mb-3 text-sm font-semibold text-slate-700">Nueva lista</h2>
          <form onSubmit={handleCreateList} className="flex flex-col gap-2 sm:flex-row">
            <Input
              aria-label="Nombre de la lista"
              placeholder="Ej: Compra semanal, Barbacoa..."
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={createList.isPending} className="w-full sm:w-auto">
              Crear
            </Button>
          </form>
        </Card>

        <h2 className="mb-3 text-sm font-semibold text-slate-700">Listas</h2>
        {listsLoading && <p className="text-sm text-slate-500">Cargando...</p>}
        {!listsLoading && lists?.length === 0 && (
          <p className="text-sm text-slate-500">Este grupo aún no tiene listas.</p>
        )}
        <div className="grid gap-3 sm:grid-cols-2">
          {lists?.map((list) => (
            <Card key={list.id} className="flex items-center justify-between gap-2">
              <Link to={`/groups/${groupId}/lists/${list.id}`} className="flex-1 py-1 text-sm font-medium text-slate-900">
                {list.name}
              </Link>
              {isAdmin && (
                <button
                  onClick={() => handleDeleteList(list)}
                  aria-label={`Borrar lista ${list.name}`}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600"
                >
                  <FiTrash2 aria-hidden="true" />
                </button>
              )}
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
