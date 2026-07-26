import { FiTrash2 } from 'react-icons/fi';

export function ListItemRow({ item, onToggle, onDelete }) {
  return (
    <li className="flex items-center gap-1 border-b border-slate-100 last:border-b-0">
      {/* <label> envuelve el checkbox: toda la fila es zona táctil, no solo la cajita */}
      <label className="flex flex-1 cursor-pointer items-center gap-3 py-3 active:bg-slate-50">
        <input
          type="checkbox"
          checked={item.is_checked}
          onChange={(e) => onToggle(item.id, e.target.checked)}
          className="h-5 w-5 shrink-0 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
          aria-label={`Marcar ${item.name} como comprado`}
        />
        <span className={`text-sm ${item.is_checked ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
          {item.name}
          {item.quantity && <span className="ml-2 text-xs text-slate-400">x{item.quantity}</span>}
        </span>
      </label>
      <button
        onClick={() => onDelete(item.id)}
        className="flex h-11 w-11 shrink-0 items-center justify-center text-slate-400 hover:text-red-600"
        aria-label={`Borrar ${item.name}`}
      >
        <FiTrash2 aria-hidden="true" />
      </button>
    </li>
  );
}
