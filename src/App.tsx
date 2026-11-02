import { useEffect, useReducer, useState } from 'react';
import { Board } from './components/Board';
import { CreateTaskModal } from './components/CreateTaskModal';
import { TaskDetailsModal } from './components/TaskDetailsModal';
import { DONE_CELEBRATION_DURATION_MS } from './components/DoneCelebration';
import { useAssignees } from './hooks/useAssignees';
import { taskReducer } from './taskReducer';
import { createDemoTasks } from './demoTasks';
import type { ColumnId, NewTaskInput, Task } from './types';
import styles from './App.module.css';

function App() {
  const [tasks, dispatch] = useReducer(taskReducer, []);
  const assigneesState = useAssignees();
  const assignees = assigneesState.status === 'success' ? assigneesState.assignees : [];
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const selectedTask = tasks.find((task) => task.id === selectedTaskId);
  const [completedTask, setCompletedTask] = useState<Pick<Task, 'id' | 'title'> | null>(null);
  const showDemoControls = new URLSearchParams(window.location.search).get('seed') === 'true';

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

  function replaceTasks(nextTasks: Task[]) {
    dispatch({ type: 'tasksReplaced', tasks: nextTasks });
    setSelectedTaskId(null);
    setCompletedTask(null);
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

      <div className={styles.toolbar}>
        {assigneesState.status === 'success' && (
          assignees.length > 0
            ? <CreateTaskModal assignees={assignees} onCreate={handleCreateTask} />
            : <p>No assignees are available. Tasks require an assignee.</p>
        )}
        {showDemoControls && (
          <>
            <button
              className={styles.demoButton}
              type="button"
              disabled={assignees.length === 0}
              onClick={() => replaceTasks(createDemoTasks(assignees))}
            >
              Seed board
            </button>
            <button
              className={styles.demoButton}
              type="button"
              disabled={tasks.length === 0}
              onClick={() => replaceTasks([])}
            >
              Clear board
            </button>
            <span className={styles.demoHint}>Seed replaces all tickets. Clear removes them.</span>
          </>
        )}
      </div>

      <Board
        tasks={tasks}
        assignees={assignees}
        onMoveTask={handleMoveTask}
        onOpenTask={setSelectedTaskId}
        completedTask={completedTask}
      />
      {selectedTask && assigneesState.status === 'success' && (
        <TaskDetailsModal
          task={selectedTask}
          assignees={assignees}
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
