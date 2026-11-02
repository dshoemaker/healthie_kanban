import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, test, vi } from 'vitest';
import App from '../src/App';

const originalUrl = window.location.href;
afterEach(() => window.history.replaceState({}, '', originalUrl));

function loadAssignees() {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
    data: { characters: { results: [
      { id: '1', name: 'Rick Sanchez', image: 'https://example.test/rick.png' },
      { id: '2', name: 'Morty Smith', image: 'https://example.test/morty.png' },
    ] } },
  }))));
}

function column(name: string) {
  return within(screen.getByRole('heading', { name, level: 2 }).closest('section')!);
}

test('seed=true exposes seed and clear controls without automatically populating the board', async () => {
  window.history.replaceState({}, '', '/?seed=true');
  loadAssignees();
  render(<App />);
  expect(await screen.findByRole('button', { name: 'Seed board' })).toBeVisible();
  expect(screen.getByRole('button', { name: 'Clear board' })).toBeDisabled();
  expect(screen.queryByRole('article')).not.toBeInTheDocument();
});

test('Seed board populates all three columns with themed tickets and API assignees', async () => {
  window.history.replaceState({}, '', '/?seed=true');
  loadAssignees();
  const user = userEvent.setup();
  render(<App />);
  await waitFor(() => expect(screen.queryByText('Loading assignees…')).not.toBeInTheDocument());
  await waitFor(() => expect(screen.getByRole('button', { name: 'Seed board' })).toBeEnabled());
  await user.click(screen.getByRole('button', { name: 'Seed board' }));
  expect(screen.getAllByRole('article')).toHaveLength(18);
  for (const name of ['To Do', 'Doing', 'Done']) {
    expect(column(name).getAllByRole('article')).toHaveLength(6);
  }
  for (const card of screen.getAllByRole('article')) {
    expect(within(card).getByText(/Rick Sanchez|Morty Smith/)).toBeVisible();
    expect(within(card).getByRole('heading')).toHaveTextContent(/portal|Rick|Morty|Meeseeks|Citadel|dimension|Schwifty|pickle|Plumbus|Birdperson|Jerry|Summer|Beth|Council/i);
  }
  expect(screen.queryByRole('status', { name: /^Task completed:/ })).not.toBeInTheDocument();
});

test('Clear board removes seeded and manually created tasks', async () => {
  window.history.replaceState({}, '', '/?seed=true');
  loadAssignees();
  const user = userEvent.setup();
  render(<App />);
  await waitFor(() => expect(screen.getByRole('button', { name: 'Seed board' })).toBeEnabled());
  await user.click(screen.getByRole('button', { name: 'Seed board' }));
  await user.click(await screen.findByRole('button', { name: 'Add task' }));
  await user.type(screen.getByRole('textbox', { name: 'Title' }), 'My own ticket');
  await user.selectOptions(screen.getByRole('combobox', { name: 'Assign to' }), '1');
  await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Add task' }));
  expect(screen.getAllByRole('article')).toHaveLength(19);
  await user.click(screen.getByRole('button', { name: 'Clear board' }));
  expect(screen.queryByRole('article')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Clear board' })).toBeDisabled();
});

test('reseeding replaces existing tickets with another randomized board', async () => {
  window.history.replaceState({}, '', '/?seed=true');
  loadAssignees();
  const random = vi.spyOn(Math, 'random').mockReturnValue(0);
  const user = userEvent.setup();
  render(<App />);
  await user.click(await screen.findByRole('button', { name: 'Add task' }));
  await user.type(screen.getByRole('textbox', { name: 'Title' }), 'Replace this ticket');
  await user.selectOptions(screen.getByRole('combobox', { name: 'Assign to' }), '1');
  await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Add task' }));
  await waitFor(() => expect(screen.getByRole('button', { name: 'Seed board' })).toBeEnabled());
  await user.click(screen.getByRole('button', { name: 'Seed board' }));
  expect(screen.queryByRole('heading', { name: 'Replace this ticket' })).not.toBeInTheDocument();
  const firstTitles = screen.getAllByRole('heading', { level: 3 }).map((heading) => heading.textContent);
  random.mockReturnValue(0.999);
  await waitFor(() => expect(screen.getByRole('button', { name: 'Seed board' })).toBeEnabled());
  await user.click(screen.getByRole('button', { name: 'Seed board' }));
  expect(screen.getAllByRole('article')).toHaveLength(18);
  const secondTitles = screen.getAllByRole('heading', { level: 3 }).map((heading) => heading.textContent);
  expect(secondTitles).not.toEqual(firstTitles);
});

test.each(['/', '/?seed=false', '/?seed=TRUE', '/?seed=', '/?other=true'])(
  'demo controls stay hidden at %s', (url) => {
    window.history.replaceState({}, '', url);
    loadAssignees();
    render(<App />);
    expect(screen.queryByRole('button', { name: 'Seed board' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Clear board' })).not.toBeInTheDocument();
  },
);

test('seeding stays disabled when no assignees are available', async () => {
  window.history.replaceState({}, '', '/?seed=true');
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
    data: { characters: { results: [] } },
  }))));
  const user = userEvent.setup();
  render(<App />);
  await screen.findByText('No assignees are available. Tasks require an assignee.');
  const seed = screen.getByRole('button', { name: 'Seed board' });
  expect(seed).toBeDisabled();
  await user.click(seed);
  expect(screen.queryByRole('article')).not.toBeInTheDocument();
});
