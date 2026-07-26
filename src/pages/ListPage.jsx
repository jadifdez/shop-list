import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AppHeader } from '../components/AppHeader';
import { ListItemRow } from '../components/ListItemRow';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import {
  useAddListItem,
  useDeleteListItem,
  useListItems,
  useListItemsRealtime,
  useToggleListItem,
} from '../features/lists/hooks';
import { confirm } from '../store/useConfirmStore';
import { useNotificationStore } from '../store/useNotificationStore';

export default function ListPage() {
  const { groupId, listId } = useParams();
  const notify = useNotificationStore((state) => state.notify);

  const { data: items, isLoading } = useListItems(listId);
  useListItemsRealtime(listId); // mantiene la lista sincronizada entre dispositivos

  const addItem = useAddListItem(listId);
  const toggleItem = useToggleListItem(listId);
  const deleteItem = useDeleteListItem(listId);

  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');

  function handleAdd(e) {
    e.preventDefault();
    if (!name.trim()) return;
    addItem.mutate(
      { name: name.trim(), quantity: quantity.trim() || null },
      {
        onSuccess: () => {
          setName('');
          setQuantity('');
        },
        onError: (error) => notify(error.message, 'error'),
      }
    );
  }

  function handleToggle(id, isChecked) {
    toggleItem.mutate({ id, isChecked }, { onError: (error) => notify(error.message, 'error') });
  }

  async function handleDelete(id) {
    const item = items?.find((i) => i.id === id);
    const ok = await confirm({
      title: 'Borrar producto',
      message: `¿Borrar "${item?.name}" de la lista?`,
      confirmLabel: 'Borrar',
      danger: true,
    });
    if (!ok) return;
    deleteItem.mutate(id, { onError: (error) => notify(error.message, 'error') });
  }

  const pending = items?.filter((i) => !i.is_checked) ?? [];
  const done = items?.filter((i) => i.is_checked) ?? [];

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <AppHeader />

      {/* pb-28: deja hueco para que la barra fija de abajo no tape el final de la lista */}
      <main className="mx-auto w-full max-w-xl flex-1 px-4 py-6 pb-28 sm:py-8">
        <Link to={`/groups/${groupId}`} className="text-sm text-slate-500 hover:underline">
          ← Volver al grupo
        </Link>

        <Card className="mt-3">
          {isLoading && <p className="text-sm text-slate-500">Cargando...</p>}

          {!isLoading && items?.length === 0 && (
            <p className="text-sm text-slate-500">Lista vacía. ¡Añade lo que falte!</p>
          )}

          {pending.length > 0 && (
            <ul>
              {pending.map((item) => (
                <ListItemRow key={item.id} item={item} onToggle={handleToggle} onDelete={handleDelete} />
              ))}
            </ul>
          )}

          {done.length > 0 && (
            <>
              <h2 className="mt-4 mb-1 text-xs font-semibold uppercase text-slate-400">Comprado</h2>
              <ul>
                {done.map((item) => (
                  <ListItemRow key={item.id} item={item} onToggle={handleToggle} onDelete={handleDelete} />
                ))}
              </ul>
            </>
          )}
        </Card>
      </main>

      {/* Barra de añadir fija abajo: en móvil siempre está al alcance del pulgar,
          como el input de una app de chat. safe-area-inset cubre el "notch"
          inferior de iPhones con gesto de home. */}
      <form
        onSubmit={handleAdd}
        className="fixed inset-x-0 bottom-0 flex gap-2 border-t border-slate-200 bg-white p-3"
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
      >
        <div className="mx-auto flex w-full max-w-xl gap-2">
          <Input
            aria-label="Producto"
            placeholder="Añadir producto..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1"
          />
          <Input
            aria-label="Cantidad"
            placeholder="Cant."
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-16"
          />
          <Button type="submit" disabled={addItem.isPending} className="shrink-0">
            Añadir
          </Button>
        </div>
      </form>
    </div>
  );
}
