import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiPlus } from 'react-icons/fi';
import { AppHeader } from '../components/AppHeader';
import { ListItemRow } from '../components/ListItemRow';
import { Card } from '../components/ui/Card';
import {
  useAddListItem,
  useDeleteCheckedListItems,
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
  const deleteChecked = useDeleteCheckedListItems(listId);

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

  async function handleDeleteChecked() {
    const ok = await confirm({
      title: 'Vaciar comprados',
      message: `¿Borrar los ${done.length} productos tachados de la lista?`,
      confirmLabel: 'Borrar',
      danger: true,
    });
    if (!ok) return;
    deleteChecked.mutate(undefined, { onError: (error) => notify(error.message, 'error') });
  }

  const pending = items?.filter((i) => !i.is_checked) ?? [];
  const done = items?.filter((i) => i.is_checked) ?? [];

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <AppHeader />

      {/* pb-32: deja hueco para que la bandeja flotante de abajo no tape el final de la lista */}
      <main className="mx-auto w-full max-w-xl flex-1 px-4 py-6 pb-32 sm:py-8">
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
              <div className="mt-4 mb-1 flex items-center justify-between">
                <h2 className="text-xs font-semibold uppercase text-slate-400">Comprado</h2>
                <button
                  type="button"
                  onClick={handleDeleteChecked}
                  disabled={deleteChecked.isPending}
                  className="rounded-lg bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-200 disabled:opacity-50"
                >
                  Vaciar comprados
                </button>
              </div>
              <ul>
                {done.map((item) => (
                  <ListItemRow key={item.id} item={item} onToggle={handleToggle} onDelete={handleDelete} />
                ))}
              </ul>
            </>
          )}
        </Card>
      </main>

      {/* Bandeja flotante: no pegada al borde, para que se lea como un control
          propio en vez de una franja de chat genérica. El separador punteado
          entre nombre y cantidad remite a la línea de un tique de compra.
          safe-area-inset cubre el "notch" inferior de iPhones con gesto de home. */}
      <div
        className="fixed inset-x-0 bottom-0 z-10 px-3 pb-3"
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
      >
        <form
          onSubmit={handleAdd}
          className="mx-auto flex w-full max-w-xl items-center gap-1 rounded-2xl border border-slate-200
            bg-white p-1.5 shadow-lg shadow-slate-900/10 transition-shadow
            focus-within:border-brand-300 focus-within:ring-2 focus-within:ring-brand-100"
        >
          <input
            aria-label="Producto"
            placeholder="Añadir producto..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="off"
            enterKeyHint="done"
            className="min-h-11 min-w-0 flex-1 rounded-xl bg-transparent px-3 text-base text-slate-900
              outline-none placeholder:text-slate-400"
          />
          <span className="h-6 w-px shrink-0 border-l border-dashed border-slate-300" aria-hidden="true" />
          <input
            aria-label="Cantidad"
            placeholder="Cant."
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            enterKeyHint="done"
            className="min-h-11 w-14 shrink-0 rounded-xl bg-transparent px-1 text-center text-base tabular-nums
              text-slate-900 outline-none placeholder:text-slate-400"
          />
          <button
            type="submit"
            disabled={addItem.isPending || !name.trim()}
            aria-label="Añadir producto"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white
              shadow-sm transition-all hover:bg-brand-700 active:scale-90
              disabled:scale-100 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            <FiPlus size={22} aria-hidden="true" />
          </button>
        </form>
      </div>
    </div>
  );
}
