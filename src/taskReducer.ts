import type { Task } from './types';

type TaskAction = {
  type: 'taskAdded';
  task: Task;
};

export function taskReducer(
  tasks: Task[],
  action: TaskAction,
): Task[] {
  switch (action.type) {
    case 'taskAdded':
      return [...tasks, action.task];

    default:
      return tasks;
  }
}
