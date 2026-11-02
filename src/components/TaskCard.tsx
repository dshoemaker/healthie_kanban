import { useSortable } from '@dnd-kit/react/sortable';
import type { ColumnId } from '../types';
import styles from './TaskCard.module.css';

type TaskCardProps = {
  id: string;
  index: number;
  columnId: ColumnId;
  title: string;
  assigneeName: string;
};

export function TaskCard({
  id,
  index,
  columnId,
  title,
  assigneeName,
}: TaskCardProps) {
  const { ref, handleRef } = useSortable({
    id,
    index,
    group: columnId,
    type: 'task',
    accept: 'task',
  });

  return (
    <article ref={ref} className={styles.card}>
      <button
        ref={handleRef}
        className={styles.handle}
        type="button"
        aria-label={`Move task: ${title}`}
      >
        ⠿
      </button>

      <h3 className={styles.title}>{title}</h3>
      <p className={styles.assignee}>{assigneeName}</p>
    </article>
  );
}
