import { useReducer } from 'react';
import { Board } from './components/Board';
import { CreateTaskForm } from './components/CreateTaskForm';
import { useAssignees } from './hooks/useAssignees';
import { taskReducer } from './taskReducer';
import type { NewTaskInput } from './types';
import styles from './App.module.css';

function App() {
  const [tasks, dispatch] = useReducer(taskReducer, []);
  const assigneesState = useAssignees();

  function handleCreateTask(input: NewTaskInput) {
    dispatch({
      type: 'taskAdded',
      task: {
        id: crypto.randomUUID(),
        title: input.title,
        assigneeId: input.assigneeId,
        columnId: 'todo',
      },
    });
  }

  return (
    <main className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.title}>Dimension Board</h1>
        <p className={styles.subtitle}>
          A little order across the multiverse.
        </p>
      </header>

      {assigneesState.status === 'loading' && (
        <p role="status">Loading assignees…</p>
      )}

      {assigneesState.status === 'error' && (
        <p role="alert">{assigneesState.message}</p>
      )}

      {assigneesState.status === 'success' && (
        assigneesState.assignees.length > 0 ? (
          <CreateTaskForm
            assignees={assigneesState.assignees}
            onCreate={handleCreateTask}
          />
        ) : (
          <p>No assignees are available. Tasks require an assignee.</p>
        )
      )}

      <Board
        tasks={tasks}
        assignees={
          assigneesState.status === 'success'
            ? assigneesState.assignees
            : []
        }
      />
    </main>
  );
}

export default App;
