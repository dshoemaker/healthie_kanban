export type ColumnId = 'todo' | 'doing' | 'done';

export type Task = {
  id: string;
  title: string;
  characterName: string;
  columnId: ColumnId;
};
