import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import { CreateTaskForm } from '../src/components/CreateTaskForm';

test('a task submission includes its description', async () => {
  const user = userEvent.setup();
  const onCreate = vi.fn();

  render(
    <CreateTaskForm
      assignees={[
        {
          id: '1',
          name: 'Rick Sanchez',
          image: 'https://example.test/rick.png',
        },
      ]}
      onCreate={onCreate}
    />,
  );

  await user.type(
    screen.getByRole('textbox', { name: 'Title' }),
    'Repair portal',
  );

  await user.type(
    screen.getByRole('textbox', { name: 'Description' }),
    'Replace the damaged power cell.',
  );

  await user.selectOptions(
    screen.getByRole('combobox', { name: 'Assign to' }),
    '1',
  );

  await user.click(
    screen.getByRole('button', { name: 'Add task' }),
  );

  expect(onCreate).toHaveBeenCalledWith(
    expect.objectContaining({
      description: 'Replace the damaged power cell.',
    }),
  );
});

test('successful submission clears the Description field', async () => {
  const user = userEvent.setup();
  const onCreate = vi.fn();

  render(
    <CreateTaskForm
      assignees={[
        {
          id: '1',
          name: 'Rick Sanchez',
          image: 'https://example.test/rick.png',
        },
      ]}
      onCreate={onCreate}
    />,
  );

  const description = screen.getByRole('textbox', {
    name: 'Description',
  });

  await user.type(
    screen.getByRole('textbox', { name: 'Title' }),
    'Repair portal',
  );

  await user.type(description, 'Replace the damaged power cell.');

  await user.selectOptions(
    screen.getByRole('combobox', { name: 'Assign to' }),
    '1',
  );

  await user.click(
    screen.getByRole('button', { name: 'Add task' }),
  );

  expect(onCreate).toHaveBeenCalledTimes(1);
  expect(description).toHaveValue('');
});
