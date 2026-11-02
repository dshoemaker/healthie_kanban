import type { Task } from '../src/types';
import { render, screen, within } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { Board } from '../src/components/Board';

const assignees = [
  { id: '1', name: 'Rick Sanchez', image: '' },
  { id: '2', name: 'Morty Smith', image: '' },
  { id: '3', name: 'Summer Smith', image: '' },
  { id: '4', name: 'Beth Smith', image: '' },
];
const tasks: Task[] = [
  { id: 'a', title: 'Repair the portal gun', description: '', points: 0, assigneeId: '1', columnId: 'todo' },
  { id: 'b', title: 'Pack supplies', description: '', points: 0, assigneeId: '2', columnId: 'todo' },
  { id: 'c', title: 'Explore a new dimension', description: '', points: 0, assigneeId: '3', columnId: 'doing' },
  { id: 'd', title: 'Return to Earth', description: '', points: 0, assigneeId: '4', columnId: 'done' },
];

test('board presents To Do, Doing, and Done in order', () => {
  render(<Board tasks={tasks} assignees={assignees} onMoveTask={vi.fn()} />);
  expect(screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent))
    .toEqual(['To Do', 'Doing', 'Done']);
});

test('sample tasks appear in their assigned columns and order', () => {
  render(<Board tasks={tasks} assignees={assignees} onMoveTask={vi.fn()} />);
  const todo = screen.getByRole('heading', { name: 'To Do' }).closest('section')!;
  const doing = screen.getByRole('heading', { name: 'Doing' }).closest('section')!;
  const done = screen.getByRole('heading', { name: 'Done' }).closest('section')!;
  expect(within(todo).getAllByRole('heading', { level: 3 }).map((heading) => heading.textContent))
    .toEqual(['Repair the portal gun', 'Pack supplies']);
  expect(within(doing).getByRole('heading', { level: 3 })).toHaveTextContent('Explore a new dimension');
  expect(within(done).getByRole('heading', { level: 3 })).toHaveTextContent('Return to Earth');
});
