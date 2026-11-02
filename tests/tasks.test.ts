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
