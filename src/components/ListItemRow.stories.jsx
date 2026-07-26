import { ListItemRow } from './ListItemRow';

export default {
  title: 'Domain/ListItemRow',
  component: ListItemRow,
  tags: ['autodocs'],
  decorators: [(Story) => <ul className="w-80"><Story /></ul>],
  args: {
    onToggle: (id, checked) => console.log('toggle', id, checked),
    onDelete: (id) => console.log('delete', id),
  },
};

export const Pending = {
  args: { item: { id: '1', name: 'Leche', quantity: '2', is_checked: false } },
};

export const Checked = {
  args: { item: { id: '2', name: 'Pan', quantity: null, is_checked: true } },
};
