import { create } from 'zustand';

/**
 * Segundo store de zustand, deliberadamente pequeño: demuestra que puedes
 * tener varios stores independientes en vez de uno gigante ("un store por
 * dominio", igual que harías con varios reducers). Este guarda los toasts
 * globales (errores de red, "item añadido", etc.) para que cualquier
 * componente pueda disparar uno sin pasar callbacks por props.
 */
export const useNotificationStore = create((set) => ({
  notifications: [], // { id, message, type: 'success' | 'error' }

  notify: (message, type = 'success') =>
    set((state) => ({
      notifications: [...state.notifications, { id: crypto.randomUUID(), message, type }],
    })),

  dismiss: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
}));
