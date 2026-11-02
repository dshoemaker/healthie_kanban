import { AssigneePreview } from './components/AssigneePreview';
import { Board } from './components/Board';
import styles from './App.module.css';

function App() {
  return (
    <main className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.title}>Dimension Board</h1>
        <p className={styles.subtitle}>
          A little order across the multiverse.
        </p>
      </header>

      <Board tasks={[]} assignees={[]} />
      <AssigneePreview />
    </main>
  );
}

export default App;
