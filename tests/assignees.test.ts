import { expect, test, vi } from 'vitest';
import { fetchAssignees } from '../src/api/assignees';

const rick = { id: '1', name: 'Rick Sanchez', image: 'https://example.test/rick.png' };

function respond(body: unknown, status = 200, headers?: HeadersInit) {
  const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status, headers }));
  vi.stubGlobal('fetch', fetch);
  return fetch;
}

test('fetches assignees through the GraphQL endpoint', async () => {
  const fetch = respond({ data: { characters: { results: [rick] } } });
  const signal = new AbortController().signal;
  expect(await fetchAssignees(signal)).toEqual([rick]);
  expect(fetch).toHaveBeenCalledWith('https://rickandmortyapi.com/graphql', expect.objectContaining({
    method: 'POST', signal, headers: { 'Content-Type': 'application/json' },
  }));
  const request = fetch.mock.calls[0][1];
  expect(JSON.parse(request.body).query).toMatch(/characters\(page: 1\)/);
});

test('an empty response produces no assignees', async () => {
  respond({ data: { characters: { results: [] } } });
  expect(await fetchAssignees(new AbortController().signal)).toEqual([]);
});

test('null entries do not become blank assignees', async () => {
  respond({ data: { characters: { results: [null, rick, null] } } });
  expect(await fetchAssignees(new AbortController().signal)).toEqual([rick]);
});

test('HTTP failures reject with the response status', async () => {
  respond({}, 503);
  await expect(fetchAssignees(new AbortController().signal))
    .rejects.toThrow('Assignee request failed (503).');
});

test('GraphQL errors are failures even with HTTP 200', async () => {
  respond({ errors: [{ message: 'Query unavailable' }] });
  await expect(fetchAssignees(new AbortController().signal))
    .rejects.toThrow('Query unavailable');
});

test('missing assignee data produces a useful failure', async () => {
  respond({ data: { characters: null } });
  await expect(fetchAssignees(new AbortController().signal))
    .rejects.toThrow('The response did not contain assignee data.');
});

test('network failures propagate to the caller', async () => {
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Network offline')));
  await expect(fetchAssignees(new AbortController().signal)).rejects.toThrow('Network offline');
});
