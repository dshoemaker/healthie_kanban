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
      onDragEnd={(event) => {
        if (event.canceled) {
          return;
        }

        const { source, target } = event.operation;

        if (!isSortable(source) || !target) {
          return;
        }

        const taskId = String(source.id);

        const destinationColumn = columns.find(
          (column) => column.id === source.group,
        );

        if (!destinationColumn) {
          return;
        }

        if (
          source.initialGroup === source.group &&
          source.initialIndex === source.index
        ) {
          return;
        }

        onMoveTask(taskId, destinationColumn.id, source.index);
      }}
    >
      <div className={styles.board}>
        {columns.map((column) => (
          <Column
            key={column.id}
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
