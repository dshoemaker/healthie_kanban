import { act, render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import App from '../src/App';

const rick = { id: '1', name: 'Rick Sanchez', image: 'https://example.test/rick.png' };

function respond(body: unknown, status = 200) {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status })));
}

test('a pending assignee request shows loading', () => {
  vi.stubGlobal('fetch', vi.fn(() => new Promise<Response>(() => {})));
  render(<App />);
  expect(screen.getByRole('status')).toHaveTextContent('Loading assignees');
  expect(screen.queryByRole('button', { name: 'Add task' })).not.toBeInTheDocument();
});

test('successful loading displays the returned assignees', async () => {
  respond({ data: { characters: { results: [rick] } } });
  render(<App />);
  expect(await screen.findByRole('option', { name: 'Rick Sanchez' })).toHaveTextContent('Rick Sanchez');
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
});

test('an empty success explains that no assignees were found', async () => {
  respond({ data: { characters: { results: [] } } });
  render(<App />);
  expect(await screen.findByText('No assignees are available. Tasks require an assignee.')).toBeVisible();
  expect(screen.queryByRole('button', { name: 'Add task' })).not.toBeInTheDocument();
});

test('a failed request displays the error instead of loading forever', async () => {
  respond({}, 429);
  render(<App />);
  expect(await screen.findByRole('alert')).toHaveTextContent('Too many requests. Please try again later.');
  expect(screen.queryByRole('button', { name: 'Add task' })).not.toBeInTheDocument();
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
});

test('leaving the screen aborts loading and ignores a late failure', async () => {
  let signal: AbortSignal | undefined;
  let rejectRequest: (error: Error) => void = () => {};
  vi.stubGlobal('fetch', vi.fn((_url: string, options: RequestInit) => {
    signal = options.signal ?? undefined;
    return new Promise<Response>((_resolve, reject) => { rejectRequest = reject; });
  }));
  const { unmount } = render(<App />);
  unmount();
  expect(signal?.aborted).toBe(true);
  await act(async () => rejectRequest(new DOMException('Aborted', 'AbortError')));
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});
