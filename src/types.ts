export type Assignee = {
  id: string;
  name: string;
  image: string;
};

export type ColumnId = 'todo' | 'doing' | 'done';

export type Task = {
  id: string;
  title: string;
  description: string;
  points: number;
  assigneeId: string;
  columnId: ColumnId;
};

export type NewTaskInput = Pick<
  Task,
  'title' | 'description' | 'points' | 'assigneeId'
>;
