import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import App from '../src/App';

async function createTask() {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
    data: { characters: { results: [
      { id: '1', name: 'Rick Sanchez', image: 'https://example.test/rick.png' },
      { id: '2', name: 'Morty Smith', image: 'https://example.test/morty.png' },
    ] } },
  }))));
  const user = userEvent.setup();
  render(<App />);
  await user.click(await screen.findByRole('button', { name: 'Add task' }));
  const form = within(screen.getByRole('dialog', { name: 'Create a task' }));
  await user.type(form.getByRole('textbox', { name: 'Title' }), 'Repair portal');
  await user.type(form.getByRole('textbox', { name: 'Description' }), 'Replace the power cell.');
  const points = form.getByRole('spinbutton', { name: 'Points' });
  await user.clear(points);
  await user.type(points, '5');
  await user.selectOptions(form.getByRole('combobox', { name: 'Assign to' }), '1');
  await user.click(form.getByRole('button', { name: 'Add task' }));
  return user;
}

test('clicking a card opens an editable dialog with its saved details', async () => {
  const user = await createTask();
  await user.click(screen.getByRole('article'));
  const dialog = within(screen.getByRole('dialog', { name: 'Task details' }));
  expect(dialog.getByRole('textbox', { name: 'Title' })).toHaveValue('Repair portal');
  expect(dialog.getByRole('textbox', { name: 'Description' })).toHaveValue('Replace the power cell.');
  expect(dialog.getByRole('spinbutton', { name: 'Points' })).toHaveValue(5);
  expect(dialog.getByRole('combobox', { name: 'Assign to' })).toHaveValue('1');
  expect(dialog.getByRole('button', { name: 'Save changes' })).toBeVisible();
});

test('Save changes updates the existing card and retains the edited details', async () => {
  const user = await createTask();
  await user.click(screen.getByRole('article'));
  const dialog = within(screen.getByRole('dialog', { name: 'Task details' }));
  const title = dialog.getByRole('textbox', { name: 'Title' });
  const description = dialog.getByRole('textbox', { name: 'Description' });
  const points = dialog.getByRole('spinbutton', { name: 'Points' });
  await user.clear(title);
  await user.type(title, 'Calibrate portal');
  await user.clear(description);
  await user.type(description, 'Test the new power cell.');
  await user.clear(points);
  await user.type(points, '8');
  await user.selectOptions(dialog.getByRole('combobox', { name: 'Assign to' }), '2');
  await user.click(dialog.getByRole('button', { name: 'Save changes' }));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(screen.getAllByRole('article')).toHaveLength(1);
  const card = within(screen.getByRole('article'));
  expect(card.getByRole('heading', { name: 'Calibrate portal' })).toBeVisible();
  expect(card.getByText('8 points')).toBeVisible();
  expect(card.getByText('Morty Smith')).toBeVisible();
  expect(card.getByAltText('')).toHaveAttribute('src', 'https://example.test/morty.png');
  await user.click(screen.getByRole('article'));
  const reopened = within(screen.getByRole('dialog', { name: 'Task details' }));
  expect(reopened.getByRole('textbox', { name: 'Description' })).toHaveValue('Test the new power cell.');
  expect(reopened.getByRole('spinbutton', { name: 'Points' })).toHaveValue(8);
  expect(reopened.getByRole('combobox', { name: 'Assign to' })).toHaveValue('2');
});

test('Cancel discards edits and reopening shows the saved values', async () => {
  const user = await createTask();
  await user.click(screen.getByRole('article'));
  const dialog = within(screen.getByRole('dialog', { name: 'Task details' }));
  const title = dialog.getByRole('textbox', { name: 'Title' });
  await user.clear(title);
  await user.type(title, 'Unsaved title');
  await user.click(dialog.getByRole('button', { name: 'Cancel' }));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Repair portal' })).toBeVisible();
  await user.click(screen.getByRole('article'));
  expect(within(screen.getByRole('dialog')).getByRole('textbox', { name: 'Title' }))
    .toHaveValue('Repair portal');
});

test('invalid edits keep the dialog open without updating the saved task', async () => {
  const user = await createTask();
  await user.click(screen.getByRole('article'));
  const dialog = within(screen.getByRole('dialog', { name: 'Task details' }));
  const points = dialog.getByRole('spinbutton', { name: 'Points' });
  await user.clear(points);
  await user.type(points, '-1');
  await user.click(dialog.getByRole('button', { name: 'Save changes' }));
  expect(screen.getByRole('dialog', { name: 'Task details' })).toBeVisible();
  expect(points).toHaveValue(-1);
  await user.click(dialog.getByRole('button', { name: 'Cancel' }));
  expect(within(screen.getByRole('article')).getByText('5 points')).toBeVisible();
});
