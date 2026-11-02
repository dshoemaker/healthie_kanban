export type Assignee = {
  id: string;
  name: string;
  image: string;
};

export type ColumnId = 'todo' | 'doing' | 'done';

export type Task = {
  id: string;
  title: string;
  assigneeId: string;
  columnId: ColumnId;
};
