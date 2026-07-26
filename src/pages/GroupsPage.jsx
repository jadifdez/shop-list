import { useState } from 'react';
import { AppHeader } from '../components/AppHeader';
import { GroupCard } from '../components/GroupCard';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { useCreateGroup, useGroups, useJoinGroup } from '../features/groups/hooks';
import { useCurrentUser } from '../store/useAuthStore';
import { useNotificationStore } from '../store/useNotificationStore';

export default function GroupsPage() {
  const user = useCurrentUser();
  const { data: groups, isLoading } = useGroups();
  const createGroup = useCreateGroup();
  const joinGroup = useJoinGroup();
  const notify = useNotificationStore((state) => state.notify);

  const [newGroupName, setNewGroupName] = useState('');
  const [inviteCode, setInviteCode] = useState('');

  function handleCreate(e) {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    createGroup.mutate(
      { name: newGroupName.trim(), userId: user.id },
      {
        onSuccess: () => {
          setNewGroupName('');
          notify('Grupo creado');
        },
        onError: (error) => notify(error.message, 'error'),
      }
    );
  }

  function handleJoin(e) {
    e.preventDefault();
    if (!inviteCode.trim()) return;
    joinGroup.mutate(inviteCode, {
      onSuccess: () => {
        setInviteCode('');
        notify('Te has unido al grupo');
      },
      onError: (error) => notify(error.message, 'error'),
    });
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader />

      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          <Card>
            <h2 className="mb-3 text-sm font-semibold text-slate-700">Crear un grupo</h2>
            <form onSubmit={handleCreate} className="flex flex-col gap-2 sm:flex-row">
              <Input
                aria-label="Nombre del grupo"
                placeholder="Ej: Casa, Cumpleaños..."
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" disabled={createGroup.isPending} className="w-full sm:w-auto">
                Crear
              </Button>
            </form>
          </Card>

          <Card>
            <h2 className="mb-3 text-sm font-semibold text-slate-700">Unirme con un código</h2>
            <form onSubmit={handleJoin} className="flex flex-col gap-2 sm:flex-row">
              <Input
                aria-label="Código de invitación"
                placeholder="Código de invitación"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" variant="secondary" disabled={joinGroup.isPending} className="w-full sm:w-auto">
                Unirme
              </Button>
            </form>
          </Card>
        </div>

        <h2 className="mb-3 text-sm font-semibold text-slate-700">Mis grupos</h2>
        {isLoading && <p className="text-sm text-slate-500">Cargando...</p>}
        {!isLoading && groups?.length === 0 && (
          <p className="text-sm text-slate-500">
            Todavía no perteneces a ningún grupo. Crea uno o únete con un código de invitación.
          </p>
        )}
        <div className="grid gap-3 sm:grid-cols-2">
          {groups?.map((group) => (
            <GroupCard key={group.id} group={group} />
          ))}
        </div>
      </main>
    </div>
  );
}
