import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { Column } from '../src/components/Column';

test('an empty column retains its heading', () => {
  render(<Column title="Doing">{null}</Column>);
  expect(screen.getByRole('heading', { name: 'Doing' })).toBeVisible();
  expect(screen.queryByRole('article')).not.toBeInTheDocument();
});
