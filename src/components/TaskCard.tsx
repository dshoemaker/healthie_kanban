import styles from './TaskCard.module.css';

type TaskCardProps = {
  title: string;
  assigneeName: string;
};

export function TaskCard({ title, assigneeName }: TaskCardProps) {
  return (
    <article className={styles.card}>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.assignee}>{assigneeName}</p>
    </article>
  );
}
