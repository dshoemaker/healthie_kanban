import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import App from '../src/App';

function loadAssignees() {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
    data: { characters: { results: [
      { id: '1', name: 'Rick Sanchez', image: 'https://example.test/rick.png' },
    ] } },
  }))));
}

test('Add task opens a named modal containing the previously hidden form', async () => {
  loadAssignees();
  const user = userEvent.setup();
  render(<App />);
  const trigger = await screen.findByRole('button', { name: 'Add task' });
  expect(screen.queryByRole('textbox', { name: 'Title' })).not.toBeInTheDocument();
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  await user.click(trigger);
  const dialog = screen.getByRole('dialog', { name: 'Create a task' });
  expect(within(dialog).getByRole('textbox', { name: 'Title' })).toBeVisible();
  expect(within(dialog).getByRole('textbox', { name: 'Description' })).toBeVisible();
  expect(within(dialog).getByRole('spinbutton', { name: 'Points' })).toBeVisible();
  expect(within(dialog).getByRole('combobox', { name: 'Assign to' })).toBeVisible();
});

test('Cancel closes the modal without creating a task and reopening starts fresh', async () => {
  loadAssignees();
  const user = userEvent.setup();
  render(<App />);
  const trigger = await screen.findByRole('button', { name: 'Add task' });
  await user.click(trigger);
  await user.type(screen.getByRole('textbox', { name: 'Title' }), 'Discard this');
  await user.type(screen.getByRole('textbox', { name: 'Description' }), 'Draft description');
  const points = screen.getByRole('spinbutton', { name: 'Points' });
  await user.clear(points);
  await user.type(points, '5');
  await user.click(screen.getByRole('button', { name: 'Cancel' }));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(screen.queryByRole('article')).not.toBeInTheDocument();
  await user.click(trigger);
  expect(screen.getByRole('textbox', { name: 'Title' })).toHaveValue('');
  expect(screen.getByRole('textbox', { name: 'Description' })).toHaveValue('');
  expect(screen.getByRole('spinbutton', { name: 'Points' })).toHaveValue(0);
  expect(screen.getByRole('combobox', { name: 'Assign to' })).toHaveValue('');
});

test('a valid submission creates one task, closes the modal and resets on reopening', async () => {
  loadAssignees();
  const user = userEvent.setup();
  render(<App />);
  const trigger = await screen.findByRole('button', { name: 'Add task' });
  await user.click(trigger);
  const dialog = screen.getByRole('dialog', { name: 'Create a task' });
  await user.type(within(dialog).getByRole('textbox', { name: 'Title' }), 'Repair portal');
  await user.selectOptions(within(dialog).getByRole('combobox', { name: 'Assign to' }), '1');
  await user.click(within(dialog).getByRole('button', { name: 'Add task' }));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(screen.getAllByRole('article')).toHaveLength(1);
  expect(screen.getByRole('heading', { name: 'Repair portal' })).toBeVisible();
  await user.click(trigger);
  expect(screen.getByRole('textbox', { name: 'Title' })).toHaveValue('');
});

test('invalid input keeps the modal open and preserves the draft', async () => {
  loadAssignees();
  const user = userEvent.setup();
  render(<App />);
  await user.click(await screen.findByRole('button', { name: 'Add task' }));
  const dialog = screen.getByRole('dialog', { name: 'Create a task' });
  await user.type(within(dialog).getByRole('textbox', { name: 'Title' }), 'Repair portal');
  await user.type(within(dialog).getByRole('textbox', { name: 'Description' }), 'Keep this draft');
  await user.selectOptions(within(dialog).getByRole('combobox', { name: 'Assign to' }), '1');
  const points = within(dialog).getByRole('spinbutton', { name: 'Points' });
  await user.clear(points);
  await user.type(points, '-1');
  await user.click(within(dialog).getByRole('button', { name: 'Add task' }));
  expect(dialog).toBeVisible();
  expect(within(dialog).getByRole('textbox', { name: 'Title' })).toHaveValue('Repair portal');
  expect(within(dialog).getByRole('textbox', { name: 'Description' })).toHaveValue('Keep this draft');
  expect(points).toHaveValue(-1);
  expect(screen.queryByRole('article')).not.toBeInTheDocument();
});
