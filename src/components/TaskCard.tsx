import { useSortable } from '@dnd-kit/react/sortable';
import { useId, useState } from 'react';
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
  onOpen?: () => void;
};

export function TaskCard({
  id,
  index,
  columnId,
  title,
  assigneeName,
  assigneeImage,
  points,
  onOpen,
}: TaskCardProps) {
  const [failedImage, setFailedImage] = useState<string>();
  const instructionsId = useId();
  const { ref, isDragging } = useSortable({
    id,
    index,
    group: columnId,
    type: 'task',
    accept: 'task',
  });

  return (
    <article
      ref={ref}
      className={styles.card}
      role="article"
      tabIndex={0}
      aria-label={`Task: ${title}`}
      aria-describedby={instructionsId}
      onKeyDownCapture={(event) => {
        if (event.key === 'Enter' && !isDragging) {
          // Handle edit before dnd-kit's native keyboard listener sees Enter.
          event.preventDefault();
          event.stopPropagation();
          onOpen?.();
        }
      }}
      onClick={(event) => {
        if (isDragging) return;
        event.currentTarget.focus();
        onOpen?.();
      }}
    >
      <span id={instructionsId} className={styles.instructions}>
        Press Enter to edit. Press Space to pick up, arrow keys to move, and Space to drop. Press Escape to cancel a move.
      </span>
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
