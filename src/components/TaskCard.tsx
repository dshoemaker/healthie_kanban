import styles from './TaskCard.module.css';

type TaskCardProps = {
  title: string;
  characterName: string;
};

export function TaskCard({ title, characterName }: TaskCardProps) {
  return (
    <article className={styles.card}>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.character}>{characterName}</p>
    </article>
  );
}
