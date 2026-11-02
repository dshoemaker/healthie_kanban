import { DragDropProvider } from '@dnd-kit/react';
import { isSortable } from '@dnd-kit/react/sortable';
import type { Assignee, ColumnId, Task } from '../types';
import { Column } from './Column';
import { TaskCard } from './TaskCard';
import styles from './Board.module.css';

type BoardProps = {
  tasks: Task[];
  assignees: Assignee[];
  onMoveTask: (
    taskId: string,
    columnId: ColumnId,
    index: number,
  ) => void;
};

const columns: { id: ColumnId; title: string }[] = [
  { id: 'todo', title: 'To Do' },
  { id: 'doing', title: 'Doing' },
  { id: 'done', title: 'Done' },
];

export function Board({
  tasks,
  assignees,
  onMoveTask,
}: BoardProps) {
  return (
    <DragDropProvider
      onDragOver={(event) => {
        // React owns card placement; avoid optimistic DOM reparenting across columns.
        event.preventDefault();
      }}
      onDragEnd={(event) => {
        if (event.canceled) {
          return;
        }

        const { source, target } = event.operation;

        if (!isSortable(source) || !target) {
          return;
        }

        const taskId = String(source.id);

        const targetColumn = columns.find(
          (column) => column.id === target.id,
        );

        if (targetColumn) {
          const destinationCount = tasks.filter(
            (task) =>
              task.columnId === targetColumn.id &&
              task.id !== taskId,
          ).length;

          onMoveTask(taskId, targetColumn.id, destinationCount);
          return;
        }

        const targetTask = tasks.find((task) => task.id === target.id);

        if (!targetTask || targetTask.id === taskId) {
          return;
        }

        const destinationTasks = tasks.filter(
          (task) => task.columnId === targetTask.columnId,
        );
        const index = destinationTasks.findIndex(
          (task) => task.id === targetTask.id,
        );

        onMoveTask(taskId, targetTask.columnId, index);
      }}
    >
      <div className={styles.board}>
        {columns.map((column) => (
          <Column
            key={column.id}
            id={column.id}
            title={column.title}
          >
            {tasks
              .filter((task) => task.columnId === column.id)
              .map((task, index) => {
                const assignee = assignees.find(
                  (person) => person.id === task.assigneeId,
                );

                return (
                  <TaskCard
                    key={task.id}
                    id={task.id}
                    index={index}
                    columnId={column.id}
                    title={task.title}
                    points={task.points}
                    assigneeImage={assignee?.image}
                    assigneeName={
                      assignee?.name ?? 'Unknown assignee'
                    }
                  />
                );
              })}
          </Column>
        ))}
      </div>
    </DragDropProvider>
  );
}
