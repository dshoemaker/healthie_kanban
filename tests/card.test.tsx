import { DragDropProvider } from '@dnd-kit/react';
import { fireEvent, render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { TaskCard } from '../src/components/TaskCard';

test('a task card displays its title and assigned person', () => {
  render(<DragDropProvider><TaskCard id="a" index={0} columnId="todo" title="Repair portal" points={0} assigneeName="Rick Sanchez" /></DragDropProvider>);
  expect(screen.getByRole('heading', { name: 'Repair portal' })).toBeVisible();
  expect(screen.getByText('Rick Sanchez')).toBeVisible();
});

function renderCard(assigneeImage?: string, points = 0) {
  return render(
    <DragDropProvider>
      <TaskCard
        id="a"
        index={0}
        points={points}
        columnId="todo"
        title="Repair portal"
        assigneeName="Rick Sanchez"
        assigneeImage={assigneeImage}
      />
    </DragDropProvider>,
  );
}

test('a missing avatar leaves the assignee name visible without an empty image', () => {
  renderCard();
  expect(screen.getByText('Rick Sanchez')).toBeVisible();
  expect(screen.queryByAltText('')).not.toBeInTheDocument();
});

test('a failed avatar is hidden while the assignee name remains visible', () => {
  renderCard('https://example.test/rick.png');
  fireEvent.error(screen.getByAltText(''));
  expect(screen.queryByAltText('')).not.toBeInTheDocument();
  expect(screen.getByText('Rick Sanchez')).toBeVisible();
});

test('a card displays only the numeric points value', () => {
  renderCard(undefined, 1);
  expect(screen.getByText('1', { exact: true })).toBeVisible();
  expect(screen.queryByText('1 point')).not.toBeInTheDocument();
});

test('a zero-point card still displays its points', () => {
  renderCard();
  expect(screen.getByText('0', { exact: true })).toBeVisible();
});

test('a replacement avatar can load after the previous image failed', () => {
  const { rerender } = renderCard('https://example.test/old.png');
  fireEvent.error(screen.getByAltText(''));
  rerender(
    <DragDropProvider>
      <TaskCard id="a" index={0} columnId="todo" title="Repair portal"
        assigneeName="Rick Sanchez" assigneeImage="https://example.test/new.png" points={0} />
    </DragDropProvider>,
  );
  expect(screen.getByAltText('')).toHaveAttribute('src', 'https://example.test/new.png');
});
