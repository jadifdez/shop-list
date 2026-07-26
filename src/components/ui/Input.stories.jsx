import { Input } from './Input';

export default {
  title: 'UI/Input',
  component: Input,
  tags: ['autodocs'],
};

export const Default = {
  args: { id: 'producto', label: 'Producto', placeholder: 'Ej: Leche' },
};

export const WithError = {
  args: { id: 'email', label: 'Email', value: 'no-es-un-email', error: 'Introduce un email válido' },
};
