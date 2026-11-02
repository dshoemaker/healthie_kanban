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

test('moving a task into empty Doing changes its column and preserves its data', () => {
  const result = taskReducer([a, b], { type: 'taskMoved', taskId: 'a', columnId: 'doing', index: 0 });
  expect(order(result, 'todo')).toEqual(['b']);
  expect(order(result, 'doing')).toEqual(['a']);
  expect(result.find((task) => task.id === 'a')).toEqual({
    id: 'a', title: 'A', assigneeId: '1', columnId: 'doing',
  });
  expect(result).toHaveLength(2);
});

test('a cross-column transfer can insert before existing destination tasks', () => {
  const result = taskReducer([a, { ...b, columnId: 'doing' }, { ...c, columnId: 'doing' }],
    { type: 'taskMoved', taskId: 'a', columnId: 'doing', index: 0 });
  expect(order(result, 'todo')).toEqual([]);
  expect(order(result, 'doing')).toEqual(['a', 'b', 'c']);
});

test('a cross-column transfer can insert between destination tasks', () => {
  const result = taskReducer([a, { ...b, columnId: 'doing' }, { ...c, columnId: 'doing' }],
    { type: 'taskMoved', taskId: 'a', columnId: 'doing', index: 1 });
  expect(order(result, 'doing')).toEqual(['b', 'a', 'c']);
});

test('a cross-column transfer can append after destination tasks', () => {
  const result = taskReducer([a, { ...b, columnId: 'done' }, { ...c, columnId: 'done' }],
    { type: 'taskMoved', taskId: 'a', columnId: 'done', index: 2 });
  expect(order(result, 'done')).toEqual(['b', 'c', 'a']);
});

test('negative destination positions insert at the beginning', () => {
  const result = taskReducer([a, b, c], { type: 'taskMoved', taskId: 'c', columnId: 'todo', index: -1 });
  expect(order(result, 'todo')).toEqual(['c', 'a', 'b']);
});

test('oversized destination positions append to the end', () => {
  const result = taskReducer([a, b, c], { type: 'taskMoved', taskId: 'a', columnId: 'todo', index: 99 });
  expect(order(result, 'todo')).toEqual(['b', 'c', 'a']);
});

test('moving an unknown task preserves the board', () => {
  const before = [a, b];
  expect(taskReducer(before, { type: 'taskMoved', taskId: 'missing', columnId: 'done', index: 0 }))
    .toEqual([a, b]);
});

test('moving to the same position preserves ordering', () => {
  expect(order(taskReducer([a, b, c], {
    type: 'taskMoved', taskId: 'b', columnId: 'todo', index: 1,
  }), 'todo')).toEqual(['a', 'b', 'c']);
});

test('moving does not mutate previous tasks or reorder unrelated columns', () => {
  const before: Task[] = [a, b, { ...c, columnId: 'doing' },
    { id: 'd', title: 'D', assigneeId: '2', columnId: 'done' },
    { id: 'e', title: 'E', assigneeId: '1', columnId: 'done' }];
  const snapshot = structuredClone(before);
  before.forEach(Object.freeze);
  Object.freeze(before);
  const result = taskReducer(before, { type: 'taskMoved', taskId: 'a', columnId: 'doing', index: 0 });
  expect(before).toEqual(snapshot);
  expect(order(result, 'todo')).toEqual(['b']);
  expect(order(result, 'doing')).toEqual(['a', 'c']);
  expect(order(result, 'done')).toEqual(['d', 'e']);
  expect(result).toHaveLength(5);
});
