import { expect, test } from 'vitest';
import { taskReducer } from '../src/taskReducer';
import type { Task } from '../src/types';

const a: Task = { id: 'a', title: 'A', assigneeId: '1', columnId: 'todo' };
const b: Task = { id: 'b', title: 'B', assigneeId: '2', columnId: 'todo' };

test('adding a task appends it without mutating previous state', () => {
  const before = [a];
  Object.freeze(a);
  Object.freeze(before);
  expect(taskReducer(before, { type: 'taskAdded', task: b })).toEqual([a, b]);
  expect(before).toEqual([a]);
});

const c: Task = { id: 'c', title: 'C', assigneeId: '1', columnId: 'todo' };

function order(tasks: Task[], columnId: Task['columnId']) {
  return tasks.filter((task) => task.columnId === columnId).map((task) => task.id);
}

test('moving A from first to last produces B C A', () => {
  const result = taskReducer([a, b, c], { type: 'taskMoved', taskId: 'a', columnId: 'todo', index: 2 });
  expect(order(result, 'todo')).toEqual(['b', 'c', 'a']);
});

test('moving C from last to first produces C A B', () => {
  const result = taskReducer([a, b, c], { type: 'taskMoved', taskId: 'c', columnId: 'todo', index: 0 });
  expect(order(result, 'todo')).toEqual(['c', 'a', 'b']);
});
