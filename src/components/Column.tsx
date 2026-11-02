import type { ReactNode } from 'react';
import styles from './Column.module.css';

type ColumnProps = {
  title: string;
  children: ReactNode;
};

export function Column({ title, children }: ColumnProps) {
  return (
    <section className={styles.column}>
      <h2 className={styles.heading}>{title}</h2>
      <div className={styles.cards}>{children}</div>
    </section>
  );
}
