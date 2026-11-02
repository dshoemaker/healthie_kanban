import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { TaskCard } from '../src/components/TaskCard';

test('a task card displays its title and assigned person', () => {
  render(<TaskCard title="Repair portal" characterName="Rick Sanchez" />);
  expect(screen.getByRole('heading', { name: 'Repair portal' })).toBeVisible();
  expect(screen.getByText('Rick Sanchez')).toBeVisible();
});
