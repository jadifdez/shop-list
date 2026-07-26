import { MemoryRouter } from 'react-router-dom';
import { GroupCard } from './GroupCard';

export default {
  title: 'Domain/GroupCard',
  component: GroupCard,
  tags: ['autodocs'],
  // GroupCard usa <Link>, así que necesita un Router alrededor para poder renderizar.
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
};

export const Default = {
  args: {
    group: { id: 'g1', name: 'Casa', invite_code: 'ab12cd34' },
  },
};
