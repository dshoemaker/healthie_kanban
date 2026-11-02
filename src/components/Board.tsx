import type { Assignee, ColumnId, Task } from '../types';
import { Column } from './Column';
import { TaskCard } from './TaskCard';
import styles from './Board.module.css';

type BoardProps = {
  tasks: Task[];
  assignees: Assignee[];
};

const columns: { id: ColumnId; title: string }[] = [
  { id: 'todo', title: 'To Do' },
  { id: 'doing', title: 'Doing' },
  { id: 'done', title: 'Done' },
];

export function Board({ tasks, assignees }: BoardProps) {
  return (
    <div className={styles.board}>
      {columns.map((column) => (
        <Column key={column.id} title={column.title}>
          {tasks
            .filter((task) => task.columnId === column.id)
            .map((task) => {
              const assignee = assignees.find(
                (person) => person.id === task.assigneeId,
              );

              return (
                <TaskCard
                  key={task.id}
                  title={task.title}
                  assigneeName={assignee?.name ?? 'Unknown assignee'}
                />
              );
            })}
        </Column>
      ))}
    </div>
  );
}
