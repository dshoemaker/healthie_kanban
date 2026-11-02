import styles from './DoneCelebration.module.css';

export const DONE_CELEBRATION_DURATION_MS = 1600;

export function DoneCelebration({ title }: { title: string }) {
  return (
    <div
      role="status"
      aria-label={`Task completed: ${title}`}
      className={styles.portal}
      style={{ animationDuration: `${DONE_CELEBRATION_DURATION_MS}ms` }}
    >
      <span className={styles.rim} aria-hidden="true" />
      <span className={styles.swirl} aria-hidden="true" />
      <span className={styles.core} aria-hidden="true" />
      <span className={styles.announcement}>Task completed: {title}</span>
    </div>
  );
}
