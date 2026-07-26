import { useEffect } from 'react';
import { ConfirmDialog } from './ConfirmDialog';
import { useConfirmStore } from '../store/useConfirmStore';

// ConfirmDialog no recibe props: lee su contenido de useConfirmStore.request.
// Para poder verlo en Storybook, esta plantilla mete un `request` de ejemplo
// en el store (vía useEffect, no en el render) y lo limpia al desmontar.
function Template({ title, message, confirmLabel, cancelLabel, danger }) {
  useEffect(() => {
    useConfirmStore.setState({
      request: { title, message, confirmLabel, cancelLabel, danger, resolve: () => {} },
    });
    return () => useConfirmStore.setState({ request: null });
  }, [title, message, confirmLabel, cancelLabel, danger]);

  return <ConfirmDialog />;
}

export default {
  title: 'Domain/ConfirmDialog',
  component: Template,
  tags: ['autodocs'],
  args: {
    confirmLabel: 'Confirmar',
    cancelLabel: 'Cancelar',
    danger: false,
  },
};

export const Danger = {
  args: {
    title: 'Borrar lista',
    message: '¿Borrar la lista "Compra semanal"? Se perderán todos sus productos.',
    confirmLabel: 'Borrar',
    danger: true,
  },
};

export const Neutral = {
  args: {
    title: 'Salir del grupo',
    message: '¿Seguro que quieres salir de este grupo?',
    confirmLabel: 'Salir',
    danger: false,
  },
};
