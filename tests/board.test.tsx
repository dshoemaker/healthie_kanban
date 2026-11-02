import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import App from '../src/App';

test('board presents To Do, Doing, and Done in order', () => {
  render(<App />);
  expect(screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent))
    .toEqual(['To Do', 'Doing', 'Done']);
});
