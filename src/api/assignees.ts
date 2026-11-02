import type { Assignee } from '../types';

type CharactersResponse = {
  data?: {
    characters: {
      results: (Assignee | null)[];
    } | null;
  };
  errors?: { message: string }[];
};

export async function fetchAssignees(
  signal: AbortSignal,
): Promise<Assignee[]> {
  const response = await fetch('https://rickandmortyapi.com/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: `
        query GetAssignees {
          characters(page: 1) {
            results {
              id
              name
              image
            }
          }
        }
      `,
    }),
    signal,
  });

  const result: CharactersResponse = await response.json();

  return result.data!.characters!.results.filter(
    (assignee): assignee is Assignee => assignee !== null,
  );
}
