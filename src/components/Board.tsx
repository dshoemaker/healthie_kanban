import { Column } from './Column';
import { TaskCard } from './TaskCard';
import styles from './Board.module.css';

export function Board() {
  return (
    <div className={styles.board}>
      <Column title="To Do">
        <TaskCard
          title="Repair the portal gun"
          characterName="Rick Sanchez"
        />
        <TaskCard
          title="Pack supplies"
          characterName="Morty Smith"
        />
      </Column>

      <Column title="Doing">
        <TaskCard
          title="Explore a new dimension"
          characterName="Summer Smith"
        />
      </Column>

      <Column title="Done">
        <TaskCard
          title="Return to Earth"
          characterName="Beth Smith"
        />
      </Column>
    </div>
  );
}
