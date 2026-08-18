import { useState } from 'react';
import { FiHash, FiPlus } from 'react-icons/fi';
import { AppHeader } from '../components/AppHeader';
import { GroupCard } from '../components/GroupCard';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { useCreateGroup, useGroups, useJoinGroup } from '../features/groups/hooks';
import { useCurrentUser } from '../store/useAuthStore';
import { useNotificationStore } from '../store/useNotificationStore';

export default function GroupsPage() {
  const user = useCurrentUser();
  const { data: groups, isLoading } = useGroups();
  const createGroup = useCreateGroup();
  const joinGroup = useJoinGroup();
  const notify = useNotificationStore((state) => state.notify);

  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);
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
          setCreateOpen(false);
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
        setJoinOpen(false);
        notify('Te has unido al grupo');
      },
      onError: (error) => notify(error.message, 'error'),
    });
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader />

      <main className="mx-auto max-w-3xl px-4 py-8">
        {/* Dos entradas de acción compactas en vez de dos formularios siempre
            abiertos: cada una ocupa una fila y despliega su formulario en un
            modal, dejando "Mis grupos" como protagonista de la página. */}
        <div className="mb-8 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-300
              bg-white px-3 py-4 text-sm font-medium text-slate-700 transition-colors
              hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700"
          >
            <FiPlus size={18} aria-hidden="true" />
            Crear grupo
          </button>
          <button
            type="button"
            onClick={() => setJoinOpen(true)}
            className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-300
              bg-white px-3 py-4 text-sm font-medium text-slate-700 transition-colors
              hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700"
          >
            <FiHash size={18} aria-hidden="true" />
            Unirme con código
          </button>
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

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Crear un grupo">
        <form onSubmit={handleCreate} className="flex flex-col gap-3">
          <Input
            aria-label="Nombre del grupo"
            placeholder="Ej: Casa, Cumpleaños..."
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            autoFocus
          />
          <Button type="submit" disabled={createGroup.isPending}>
            Crear
          </Button>
        </form>
      </Modal>

      <Modal open={joinOpen} onClose={() => setJoinOpen(false)} title="Unirme con un código">
        <form onSubmit={handleJoin} className="flex flex-col gap-3">
          <Input
            aria-label="Código de invitación"
            placeholder="Código de invitación"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            autoFocus
          />
          <Button type="submit" variant="secondary" disabled={joinGroup.isPending}>
            Unirme
          </Button>
        </form>
      </Modal>
    </div>
  );
}
