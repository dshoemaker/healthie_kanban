import type { ColumnId, Task } from './types';

type TaskAction =
  | {
      type: 'taskAdded';
      task: Task;
    }
  | {
      type: 'taskMoved';
      taskId: string;
      columnId: ColumnId;
      index: number;
    };

export function taskReducer(
  tasks: Task[],
  action: TaskAction,
): Task[] {
  switch (action.type) {
    case 'taskAdded':
      return [...tasks, action.task];

    case 'taskMoved': {
      const task = tasks.find((item) => item.id === action.taskId);

      if (!task) {
        return tasks;
      }

      const remainingTasks = tasks.filter(
        (item) => item.id !== action.taskId,
      );

      const destinationTasks = remainingTasks.filter(
        (item) => item.columnId === action.columnId,
      );

      destinationTasks.splice(action.index, 0, { ...task, columnId: action.columnId });

      return [
        ...remainingTasks.filter(
          (item) => item.columnId !== action.columnId,
        ),
        ...destinationTasks,
      ];
    }

    default:
      return tasks;
  }
}
