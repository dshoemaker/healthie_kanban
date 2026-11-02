import { useAssignees } from '../hooks/useAssignees';

export function AssigneePreview() {
  const state = useAssignees();
  if (state.status === 'error') {
    return <p role="alert">{state.message}</p>;
  }
  if (state.status === 'loading') {
    return <p role="status">Loading assignees…</p>;
  }
  return (
    <section>
      <h2>Available assignees</h2>
      {state.assignees.length === 0 && <p>No assignees found.</p>}
      <ul>
        {state.assignees.map((assignee) => (
          <li key={assignee.id}>{assignee.name}</li>
        ))}
      </ul>
    </section>
  );
}
