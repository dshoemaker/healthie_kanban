import { CreateTaskForm } from '../src/components/CreateTaskForm';
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import App from '../src/App';

const assignees = [
  { id: '1', name: 'Rick Sanchez', image: 'https://example.test/rick.png' },
  { id: '2', name: 'Morty Smith', image: 'https://example.test/morty.png' },
];

function loadAssignees() {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
    data: { characters: { results: assignees } },
  }))));
}

function column(name: string) {
  return within(screen.getByRole('heading', { name, level: 2 }).closest('section')!);
}

test('a valid submission creates a task in To Do with its selected assignee', async () => {
  loadAssignees();
  const user = userEvent.setup();
  render(<App />);
  await user.type(await screen.findByRole('textbox', { name: 'Title' }), 'Repair portal');
  await user.selectOptions(screen.getByRole('combobox', { name: 'Assign to' }), '2');
  await user.click(screen.getByRole('button', { name: 'Add task' }));
  expect(column('To Do').getByRole('heading', { name: 'Repair portal' })).toBeVisible();
  expect(column('To Do').getByText('Morty Smith')).toBeVisible();
  expect(screen.getAllByRole('article')).toHaveLength(1);
});

test('a successful submission clears the title and assignee fields', async () => {
  loadAssignees();
  const user = userEvent.setup();
  render(<App />);
  const title = await screen.findByRole('textbox', { name: 'Title' });
  const assignee = screen.getByRole('combobox', { name: 'Assign to' });
  await user.type(title, 'Repair portal');
  await user.selectOptions(assignee, '1');
  await user.click(screen.getByRole('button', { name: 'Add task' }));
  expect(title).toHaveValue('');
  expect(assignee).toHaveValue('');
});

test('a whitespace-only title cannot create a task', async () => {
  loadAssignees();
  const user = userEvent.setup();
  render(<App />);
  await user.type(await screen.findByRole('textbox', { name: 'Title' }), '   ');
  await user.selectOptions(screen.getByRole('combobox', { name: 'Assign to' }), '1');
  await user.click(screen.getByRole('button', { name: 'Add task' }));
  expect(screen.queryByRole('article')).not.toBeInTheDocument();
});

test('accepted titles have leading and trailing whitespace removed', async () => {
  loadAssignees();
  const user = userEvent.setup();
  render(<App />);
  await user.type(await screen.findByRole('textbox', { name: 'Title' }), '  Repair portal  ');
  await user.selectOptions(screen.getByRole('combobox', { name: 'Assign to' }), '1');
  await user.click(screen.getByRole('button', { name: 'Add task' }));
  expect(column('To Do').getByRole('heading', { level: 3 }).textContent).toBe('Repair portal');
});

test('missing title prevents creation', async () => {
  loadAssignees();
  const user = userEvent.setup();
  render(<App />);
  await user.selectOptions(await screen.findByRole('combobox', { name: 'Assign to' }), '1');
  await user.click(screen.getByRole('button', { name: 'Add task' }));
  expect(screen.queryByRole('article')).not.toBeInTheDocument();
});

test('missing assignee prevents creation', async () => {
  loadAssignees();
  const user = userEvent.setup();
  render(<App />);
  await user.type(await screen.findByRole('textbox', { name: 'Title' }), 'Repair portal');
  await user.click(screen.getByRole('button', { name: 'Add task' }));
  expect(screen.queryByRole('article')).not.toBeInTheDocument();
});

test('multiple tasks retain creation order even with identical titles', async () => {
  loadAssignees();
  const user = userEvent.setup();
  render(<App />);
  for (const id of ['1', '2']) {
    await user.type(await screen.findByRole('textbox', { name: 'Title' }), 'Repair portal');
    await user.selectOptions(screen.getByRole('combobox', { name: 'Assign to' }), id);
    await user.click(screen.getByRole('button', { name: 'Add task' }));
  }
  const cards = column('To Do').getAllByRole('article');
  expect(cards).toHaveLength(2);
  expect(within(cards[0]).getByText('Rick Sanchez')).toBeVisible();
  expect(within(cards[1]).getByText('Morty Smith')).toBeVisible();
});

test('a fresh board has three empty columns', async () => {
  loadAssignees();
  render(<App />);
  await screen.findByRole('button', { name: 'Add task' });
  expect(column('To Do').queryByRole('article')).not.toBeInTheDocument();
  expect(column('Doing').queryByRole('article')).not.toBeInTheDocument();
  expect(column('Done').queryByRole('article')).not.toBeInTheDocument();
});

test('a removed assignee cannot be submitted through a stale selection', async () => {
  const user = userEvent.setup();
  const onCreate = vi.fn();
  const { rerender } = render(<CreateTaskForm assignees={assignees} onCreate={onCreate} />);
  await user.type(screen.getByRole('textbox', { name: 'Title' }), 'Repair portal');
  await user.selectOptions(screen.getByRole('combobox', { name: 'Assign to' }), '2');
  rerender(<CreateTaskForm assignees={[assignees[0]]} onCreate={onCreate} />);
  await user.click(screen.getByRole('button', { name: 'Add task' }));
  expect(onCreate).not.toHaveBeenCalled();
});

test('form submission rejects an assignee that is no longer available', async () => {
  const user = userEvent.setup();
  const onCreate = vi.fn();
  const { rerender } = render(<CreateTaskForm assignees={assignees} onCreate={onCreate} />);
  const title = screen.getByRole('textbox', { name: 'Title' });
  await user.type(title, 'Repair portal');
  await user.selectOptions(screen.getByRole('combobox', { name: 'Assign to' }), '2');
  rerender(<CreateTaskForm assignees={[assignees[0]]} onCreate={onCreate} />);
  // Exercise the form's submit boundary independently of native constraint validation.
  fireEvent.submit(title.closest('form')!);
  expect(onCreate).not.toHaveBeenCalled();
});
