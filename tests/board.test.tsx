import { render, screen, within } from '@testing-library/react';
import { expect, test } from 'vitest';
import { Board } from '../src/components/Board';

test('board presents To Do, Doing, and Done in order', () => {
  render(<Board />);
  expect(screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent))
    .toEqual(['To Do', 'Doing', 'Done']);
});

test('sample tasks appear in their assigned columns and order', () => {
  render(<Board />);
  const todo = screen.getByRole('heading', { name: 'To Do' }).closest('section')!;
  const doing = screen.getByRole('heading', { name: 'Doing' }).closest('section')!;
  const done = screen.getByRole('heading', { name: 'Done' }).closest('section')!;
  expect(within(todo).getAllByRole('heading', { level: 3 }).map((heading) => heading.textContent))
    .toEqual(['Repair the portal gun', 'Pack supplies']);
  expect(within(doing).getByRole('heading', { level: 3 })).toHaveTextContent('Explore a new dimension');
  expect(within(done).getByRole('heading', { level: 3 })).toHaveTextContent('Return to Earth');
});
