import { Column } from './Column';
import styles from './Board.module.css';

export function Board() {
  return (
    <div className={styles.board}>
      <Column title="To Do">{null}</Column>
      <Column title="Doing">{null}</Column>
      <Column title="Done">{null}</Column>
    </div>
  );
}
