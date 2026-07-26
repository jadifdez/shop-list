import { useEffect } from 'react';
import { useNotificationStore } from '../store/useNotificationStore';

const STYLES = {
  success: 'bg-slate-900 text-white',
  error: 'bg-red-600 text-white',
};

function Toast({ notification, onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(notification.id), 4000);
    return () => clearTimeout(timer);
  }, [notification.id, onDismiss]);

  return (
    <div
      role="status"
      className={`rounded-lg px-4 py-2 text-sm shadow-lg ${STYLES[notification.type]}`}
    >
      {notification.message}
    </div>
  );
}

/** Renderiza los toasts globales de useNotificationStore. Se monta una vez en App.jsx. */
export function Toaster() {
  const notifications = useNotificationStore((state) => state.notifications);
  const dismiss = useNotificationStore((state) => state.dismiss);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {notifications.map((n) => (
        <Toast key={n.id} notification={n} onDismiss={dismiss} />
      ))}
    </div>
  );
}
