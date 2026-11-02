import type { ColumnId, NewTaskInput, Task } from './types';

type TaskAction =
  | {
      type: 'taskAdded';
      task: Task;
    }
  | {
      type: 'taskUpdated';
      taskId: string;
      changes: NewTaskInput;
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

    case 'taskUpdated':
      return tasks.map((task) => {
        if (task.id !== action.taskId) return task;
        return {
          ...task,
          title: action.changes.title,
          description: action.changes.description,
          points: action.changes.points,
          assigneeId: action.changes.assigneeId,
        };
      });

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

      const index = Math.max(
        0,
        Math.min(action.index, destinationTasks.length),
      );

      destinationTasks.splice(index, 0, {
        ...task,
        columnId: action.columnId,
      });

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
