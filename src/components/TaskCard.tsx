import { useSortable } from '@dnd-kit/react/sortable';
import { useState } from 'react';
import type { ColumnId } from '../types';
import styles from './TaskCard.module.css';

type TaskCardProps = {
  id: string;
  index: number;
  columnId: ColumnId;
  title: string;
  assigneeName: string;
  assigneeImage?: string;
  points: number;
};

export function TaskCard({
  id,
  index,
  columnId,
  title,
  assigneeName,
  assigneeImage,
  points,
}: TaskCardProps) {
  const [failedImage, setFailedImage] = useState<string>();
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
      <div className={styles.metadata}>
        <p className={styles.assignee}>
          {assigneeImage && assigneeImage !== failedImage && (
            <img
              className={styles.avatar}
              src={assigneeImage}
              alt=""
              width={28}
              height={28}
              draggable={false}
              onError={() => setFailedImage(assigneeImage)}
            />
          )}
          {assigneeName}
        </p>
        <span className={styles.points}>
          {points} {points === 1 ? 'point' : 'points'}
        </span>
      </div>
    </article>
  );
}
