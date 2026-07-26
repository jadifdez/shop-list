import { create } from 'zustand';

/**
 * Tercer store de zustand (junto a useAuthStore y useNotificationStore):
 * mismo patrón que useNotificationStore, pero aquí guardamos también la
 * función `resolve` de una Promise para poder "esperar" la respuesta del
 * usuario, igual que hace window.confirm pero sin bloquear el hilo ni usar
 * el diálogo feo del navegador.
 */
export const useConfirmStore = create(() => ({
  request: null, // { title, message, confirmLabel, cancelLabel, danger, resolve }
}));

/**
 * Sustituto de `window.confirm(msg)`. Se usa igual: `if (!(await confirm(...))) return;`
 * pero renderiza nuestro <ConfirmDialog/> (montado una vez en App.jsx) en
 * vez del diálogo nativo del navegador.
 */
export function confirm({ title, message, confirmLabel = 'Confirmar', cancelLabel = 'Cancelar', danger = false } = {}) {
  return new Promise((resolve) => {
    useConfirmStore.setState({ request: { title, message, confirmLabel, cancelLabel, danger, resolve } });
  });
}
