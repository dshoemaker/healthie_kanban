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

  if (response.status === 429) {
    throw new Error('Too many requests. Please try again later.');
  }

  if (!response.ok) {
    throw new Error(`Assignee request failed (${response.status}).`);
  }

  const result: CharactersResponse = await response.json();

  if (result.errors?.length) {
    throw new Error(result.errors[0].message);
  }

  if (!result.data?.characters) {
    throw new Error('The response did not contain assignee data.');
  }

  return result.data.characters.results.filter(
    (assignee): assignee is Assignee => assignee !== null,
  );
}
