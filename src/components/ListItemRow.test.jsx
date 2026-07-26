import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ListItemRow } from './ListItemRow';

const item = { id: '1', name: 'Leche', quantity: '2', is_checked: false };

test('toggling the checkbox calls onToggle with the item id and new value', async () => {
  const onToggle = jest.fn();
  render(<ListItemRow item={item} onToggle={onToggle} onDelete={() => {}} />);

  await userEvent.click(screen.getByRole('checkbox'));

  expect(onToggle).toHaveBeenCalledWith('1', true);
});

test('clicking "Borrar" calls onDelete with the item id', async () => {
  const onDelete = jest.fn();
  render(<ListItemRow item={item} onToggle={() => {}} onDelete={onDelete} />);

  await userEvent.click(screen.getByRole('button', { name: /borrar leche/i }));

  expect(onDelete).toHaveBeenCalledWith('1');
});

test('checked items render with strikethrough styling', () => {
  render(<ListItemRow item={{ ...item, is_checked: true }} onToggle={() => {}} onDelete={() => {}} />);

  expect(screen.getByText('Leche')).toHaveClass('line-through');
});
