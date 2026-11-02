import { useEffect, useState } from 'react';
import { fetchAssignees } from '../api/assignees';
import type { Assignee } from '../types';

type AssigneesState =
  | { status: 'loading' }
  | { status: 'success'; assignees: Assignee[] }
  | { status: 'error'; message: string };

export function useAssignees() {
  const [state, setState] = useState<AssigneesState>({
    status: 'loading',
  });

  useEffect(() => {
    const controller = new AbortController();

    async function loadAssignees() {
      try {
        const assignees = await fetchAssignees(controller.signal);

        if (!controller.signal.aborted) {
          setState({ status: 'success', assignees });
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setState({
            status: 'error',
            message:
              error instanceof Error
                ? error.message
                : 'Unable to load assignees.',
          });
        }
      }
    }

    void loadAssignees();

    return () => controller.abort();
  }, []);

  return state;
}
