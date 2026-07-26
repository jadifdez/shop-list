import { useEffect } from 'react';
import { Button } from './ui/Button';
import { useConfirmStore } from '../store/useConfirmStore';

/**
 * Host global del modal de confirmación. Se monta UNA vez en App.jsx (igual
 * que <Toaster/>) y solo pinta algo cuando useConfirmStore.request no es null.
 * Cualquier componente pide una confirmación llamando a confirm({...}) desde
 * useConfirmStore.js, sin tener que renderizar nada ellos mismos.
 */
export function ConfirmDialog() {
  const request = useConfirmStore((state) => state.request);

  useEffect(() => {
    if (!request) return;
    function handleKeyDown(e) {
      if (e.key === 'Escape') resolveWith(false);
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request]);

  if (!request) return null;

  function resolveWith(result) {
    request.resolve(result);
    useConfirmStore.setState({ request: null });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-4 sm:items-center"
      onClick={() => resolveWith(false)}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl"
      >
        {request.title && (
          <h2 id="confirm-dialog-title" className="mb-1 text-base font-semibold text-slate-900">
            {request.title}
          </h2>
        )}
        <p id="confirm-dialog-message" className="mb-5 text-sm text-slate-600">
          {request.message}
        </p>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={() => resolveWith(false)} className="w-full sm:w-auto">
            {request.cancelLabel}
          </Button>
          <Button
            variant={request.danger ? 'danger' : 'primary'}
            onClick={() => resolveWith(true)}
            autoFocus
            className="w-full sm:w-auto"
          >
            {request.confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
