import { useState } from 'react';
import type { ColumnId, Task } from '../types';
import { Column } from './Column';
import { TaskCard } from './TaskCard';
import styles from './Board.module.css';

const columns: { id: ColumnId; title: string }[] = [
  { id: 'todo', title: 'To Do' },
  { id: 'doing', title: 'Doing' },
  { id: 'done', title: 'Done' },
];

const initialTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Repair the portal gun',
    characterName: 'Rick Sanchez',
    columnId: 'todo',
  },
  {
    id: 'task-2',
    title: 'Pack supplies',
    characterName: 'Morty Smith',
    columnId: 'todo',
  },
  {
    id: 'task-3',
    title: 'Explore a new dimension',
    characterName: 'Summer Smith',
    columnId: 'doing',
  },
  {
    id: 'task-4',
    title: 'Return to Earth',
    characterName: 'Beth Smith',
    columnId: 'done',
  },
];

export function Board() {
  const [tasks] = useState<Task[]>(initialTasks);

  return (
    <div className={styles.board}>
      {columns.map((column) => (
        <Column key={column.id} title={column.title}>
          {tasks
            .filter((task) => task.columnId === column.id)
            .map((task) => (
              <TaskCard
                key={task.id}
                title={task.title}
                characterName={task.characterName}
              />
            ))}
        </Column>
      ))}
    </div>
  );
}
