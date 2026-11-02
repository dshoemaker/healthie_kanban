import { DragDropProvider } from '@dnd-kit/react';
import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { TaskCard } from '../src/components/TaskCard';

test('a task card displays its title and assigned person', () => {
  render(<DragDropProvider><TaskCard id="a" index={0} columnId="todo" title="Repair portal" assigneeName="Rick Sanchez" /></DragDropProvider>);
  expect(screen.getByRole('heading', { name: 'Repair portal' })).toBeVisible();
  expect(screen.getByText('Rick Sanchez')).toBeVisible();
});
