import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { CreateTaskForm } from '../src/components/CreateTaskForm';

const assignees = [
  { id: '1', name: 'Rick Sanchez', image: 'https://example.test/rick.png' },
  { id: '2', name: 'Morty Smith', image: 'https://example.test/morty.png' },
];

describe('Description', () => {
  test('a task submission includes its description', async () => {
    const user = userEvent.setup();
    const onCreate = vi.fn();

    render(<CreateTaskForm assignees={assignees} onCreate={onCreate} />);

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

    render(<CreateTaskForm assignees={assignees} onCreate={onCreate} />);

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
});

describe('Points', () => {
  test('a task submission includes its points as a number', async () => {
    const user = userEvent.setup();
    const onCreate = vi.fn();

    render(<CreateTaskForm assignees={assignees} onCreate={onCreate} />);

    await user.type(
      screen.getByRole('textbox', { name: 'Title' }),
      'Repair portal',
    );

    const points = screen.getByRole('spinbutton', {
      name: 'Points',
    });

    await user.clear(points);
    await user.type(points, '5');

    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Assign to' }),
      '1',
    );

    await user.click(
      screen.getByRole('button', { name: 'Add task' }),
    );

    expect(onCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        points: 5,
      }),
    );
  });

  test('successful submission resets Points to zero', async () => {
    const user = userEvent.setup();
    const onCreate = vi.fn();

    render(<CreateTaskForm assignees={assignees} onCreate={onCreate} />);

    await user.type(
      screen.getByRole('textbox', { name: 'Title' }),
      'Repair portal',
    );

    const points = screen.getByRole('spinbutton', {
      name: 'Points',
    });

    await user.clear(points);
    await user.type(points, '5');

    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Assign to' }),
      '1',
    );

    await user.click(
      screen.getByRole('button', { name: 'Add task' }),
    );

    expect(onCreate).toHaveBeenCalledTimes(1);
    expect(points).toHaveValue(0);
  });
});

describe('Points validation', () => {
  test('negative points prevent task creation', async () => {
    const user = userEvent.setup();
    const onCreate = vi.fn();

    render(<CreateTaskForm assignees={assignees} onCreate={onCreate} />);

    await user.type(
      screen.getByRole('textbox', { name: 'Title' }),
      'Repair portal',
    );

    const points = screen.getByRole('spinbutton', {
      name: 'Points',
    });

    await user.clear(points);
    await user.type(points, '-1');

    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Assign to' }),
      '1',
    );

    expect(points).toHaveValue(-1);

    await user.click(
      screen.getByRole('button', { name: 'Add task' }),
    );

    expect(onCreate).not.toHaveBeenCalled();
  });

  test('fractional points prevent task creation', async () => {
    const user = userEvent.setup();
    const onCreate = vi.fn();

    render(<CreateTaskForm assignees={assignees} onCreate={onCreate} />);

    await user.type(
      screen.getByRole('textbox', { name: 'Title' }),
      'Repair portal',
    );

    const points = screen.getByRole('spinbutton', {
      name: 'Points',
    });

    await user.clear(points);
    await user.type(points, '1.5');

    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Assign to' }),
      '1',
    );

    expect(points).toHaveValue(1.5);

    await user.click(
      screen.getByRole('button', { name: 'Add task' }),
    );

    expect(onCreate).not.toHaveBeenCalled();
  });
});

describe('Assignee validation', () => {
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
});

test('the submit handler rejects negative points and preserves the draft', async () => {
  const user = userEvent.setup();
  const onCreate = vi.fn();
  render(<CreateTaskForm assignees={assignees} onCreate={onCreate} />);
  const title = screen.getByRole('textbox', { name: 'Title' });
  const description = screen.getByRole('textbox', { name: 'Description' });
  const points = screen.getByRole('spinbutton', { name: 'Points' });
  const assignee = screen.getByRole('combobox', { name: 'Assign to' });
  await user.type(title, 'Repair portal');
  await user.type(description, 'Keep this draft.');
  await user.clear(points);
  await user.type(points, '-1');
  await user.selectOptions(assignee, '1');

  // Native validation is covered above; exercise the submit handler independently.
  fireEvent.submit(title.closest('form')!);

  expect(onCreate).not.toHaveBeenCalled();
  expect(title).toHaveValue('Repair portal');
  expect(description).toHaveValue('Keep this draft.');
  expect(points).toHaveValue(-1);
  expect(assignee).toHaveValue('1');
});

test('the submit handler rejects fractional points', async () => {
  const user = userEvent.setup();
  const onCreate = vi.fn();
  render(<CreateTaskForm assignees={assignees} onCreate={onCreate} />);
  const title = screen.getByRole('textbox', { name: 'Title' });
  const points = screen.getByRole('spinbutton', { name: 'Points' });
  await user.type(title, 'Repair portal');
  await user.selectOptions(screen.getByRole('combobox', { name: 'Assign to' }), '1');
  await user.clear(points);
  await user.type(points, '1.5');
  fireEvent.submit(title.closest('form')!);
  expect(onCreate).not.toHaveBeenCalled();
  expect(points).toHaveValue(1.5);
});

test('zero points and an empty description are valid defaults', async () => {
  const user = userEvent.setup();
  const onCreate = vi.fn();
  render(<CreateTaskForm assignees={assignees} onCreate={onCreate} />);
  expect(screen.getByRole('spinbutton', { name: 'Points' })).toHaveValue(0);
  await user.type(screen.getByRole('textbox', { name: 'Title' }), 'Repair portal');
  await user.selectOptions(screen.getByRole('combobox', { name: 'Assign to' }), '1');
  await user.click(screen.getByRole('button', { name: 'Add task' }));
  expect(onCreate).toHaveBeenCalledExactlyOnceWith({
    title: 'Repair portal', description: '', points: 0, assigneeId: '1',
  });
});

test('clearing the optional Points input submits zero', async () => {
  const user = userEvent.setup();
  const onCreate = vi.fn();
  render(<CreateTaskForm assignees={assignees} onCreate={onCreate} />);
  await user.type(screen.getByRole('textbox', { name: 'Title' }), 'Repair portal');
  await user.selectOptions(screen.getByRole('combobox', { name: 'Assign to' }), '1');
  await user.clear(screen.getByRole('spinbutton', { name: 'Points' }));
  await user.click(screen.getByRole('button', { name: 'Add task' }));
  expect(onCreate).toHaveBeenCalledWith(expect.objectContaining({ points: 0 }));
  expect(screen.getByRole('spinbutton', { name: 'Points' })).toHaveValue(0);
});

test('description text preserves line breaks when submitted', async () => {
  const user = userEvent.setup();
  const onCreate = vi.fn();
  render(<CreateTaskForm assignees={assignees} onCreate={onCreate} />);
  await user.type(screen.getByRole('textbox', { name: 'Title' }), 'Repair portal');
  await user.type(screen.getByRole('textbox', { name: 'Description' }), 'Replace the power cell.\nCheck the wiring.');
  await user.selectOptions(screen.getByRole('combobox', { name: 'Assign to' }), '1');
  await user.click(screen.getByRole('button', { name: 'Add task' }));
  expect(onCreate).toHaveBeenCalledWith(expect.objectContaining({
    description: 'Replace the power cell.\nCheck the wiring.',
  }));
});
