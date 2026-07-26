import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

test('renders its label and fires onClick', async () => {
  const onClick = jest.fn();
  render(<Button onClick={onClick}>Guardar</Button>);

  await userEvent.click(screen.getByRole('button', { name: 'Guardar' }));

  expect(onClick).toHaveBeenCalledTimes(1);
});

test('disabled button does not fire onClick', async () => {
  const onClick = jest.fn();
  render(
    <Button onClick={onClick} disabled>
      Guardar
    </Button>
  );

  await userEvent.click(screen.getByRole('button', { name: 'Guardar' }));

  expect(onClick).not.toHaveBeenCalled();
});
