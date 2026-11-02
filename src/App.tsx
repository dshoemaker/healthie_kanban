import { useEffect, useReducer, useState } from 'react';
import { Board } from './components/Board';
import { CreateTaskModal } from './components/CreateTaskModal';
import { TaskDetailsModal } from './components/TaskDetailsModal';
import { DONE_CELEBRATION_DURATION_MS } from './components/DoneCelebration';
import { useAssignees } from './hooks/useAssignees';
import { taskReducer } from './taskReducer';
import type { ColumnId, NewTaskInput, Task } from './types';
import styles from './App.module.css';

function App() {
  const [tasks, dispatch] = useReducer(taskReducer, []);
  const assigneesState = useAssignees();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const selectedTask = tasks.find((task) => task.id === selectedTaskId);
  const [completedTask, setCompletedTask] = useState<Pick<Task, 'id' | 'title'> | null>(null);

  useEffect(() => {
    if (!completedTask) return;
    const timer = window.setTimeout(() => setCompletedTask(null), DONE_CELEBRATION_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [completedTask]);

  function handleCreateTask(input: NewTaskInput) {
    dispatch({
      type: 'taskAdded',
      task: {
        id: crypto.randomUUID(),
        title: input.title,
        description: input.description,
        points: input.points,
        assigneeId: input.assigneeId,
        columnId: 'todo',
      },
    });
  }

  function handleMoveTask(
    taskId: string,
    columnId: ColumnId,
    index: number,
  ) {
    const task = tasks.find((item) => item.id === taskId);
    if (task && task.columnId !== 'done' && columnId === 'done') {
      setCompletedTask({ id: task.id, title: task.title });
    } else if (columnId !== 'done') {
      setCompletedTask((current) => current?.id === taskId ? null : current);
    }
    dispatch({
      type: 'taskMoved',
      taskId,
      columnId,
      index,
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
          <CreateTaskModal
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
        onMoveTask={handleMoveTask}
        onOpenTask={setSelectedTaskId}
        completedTask={completedTask}
      />
      {selectedTask && assigneesState.status === 'success' && (
        <TaskDetailsModal
          task={selectedTask}
          assignees={assigneesState.assignees}
          onClose={() => setSelectedTaskId(null)}
          onSave={(changes) => dispatch({
            type: 'taskUpdated', taskId: selectedTask.id, changes,
          })}
        />
      )}
    </main>
  );
}

export default App;
