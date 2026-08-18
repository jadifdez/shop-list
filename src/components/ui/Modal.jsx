import { useEffect } from 'react';
import { FiX } from 'react-icons/fi';

/**
 * Modal genérico: hoja que sube desde abajo en móvil, diálogo centrado en
 * desktop. Mismo lenguaje visual que ConfirmDialog (overlay + panel blanco
 * redondeado), pero reutilizable para cualquier contenido (formularios,
 * listas...) en vez de solo confirmar/cancelar.
 */
export function Modal({ open, onClose, title, children, maxWidthClassName = 'max-w-sm' }) {
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(e) => e.stopPropagation()}
        className={`w-full ${maxWidthClassName} rounded-2xl bg-white p-5 shadow-xl`}
      >
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 id="modal-title" className="text-base font-semibold text-slate-900">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <FiX aria-hidden="true" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
