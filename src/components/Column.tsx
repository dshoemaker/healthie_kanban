import { useDroppable } from '@dnd-kit/react';
import type { ReactNode } from 'react';
import type { ColumnId } from '../types';
import styles from './Column.module.css';

type ColumnProps = {
  id: ColumnId;
  title: string;
  children: ReactNode;
};

export function Column({ id, title, children }: ColumnProps) {
  const { ref, isDropTarget } = useDroppable({
    id,
    accept: 'task',
    // Below a card under the pointer (3), above an overlapping card (2).
    collisionPriority: 2.5,
  });

  return (
    <section
      ref={ref}
      className={styles.column}
      data-drop-target={isDropTarget}
    >
      <h2 className={styles.heading}>{title}</h2>
      <div className={styles.cards}>{children}</div>
    </section>
  );
}
