import { Button } from './Button';

export default {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
  args: {
    children: 'Guardar',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'danger', 'ghost'],
    },
  },
};

export const Primary = { args: { variant: 'primary' } };
export const Secondary = { args: { variant: 'secondary' } };
export const Danger = { args: { variant: 'danger' } };
export const Ghost = { args: { variant: 'ghost' } };
export const Disabled = { args: { variant: 'primary', disabled: true } };
