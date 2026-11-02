import type { Assignee, ColumnId, Task } from './types';

const titles = [
  "Recalibrate Rick's portal gun",
  "Find Morty's missing backpack",
  'Restock the Meeseeks boxes',
  'Audit Citadel portal permits',
  'Stabilize a pocket dimension',
  'Practice the Get Schwifty set',
  'Label the pickle experiments',
  'Polish the household Plumbus',
  "Repair Birdperson's communicator",
  'Find Jerry a safe side quest',
  "Rebuild Summer's laser charger",
  "Organize Beth's clinic supplies",
  'Review Council of Ricks minutes',
  "Recover Morty's science homework",
  'Replace the garage portal battery',
  "Test Rick's emergency decoy",
  'Map the dimension C-137 exits',
  "Pack Morty's off-world snack kit",
  'Archive Citadel incident reports',
  'Order more Meeseeks safety labels',
  "Reset Rick's microverse generator",
  "Catalog Summer's alien souvenirs",
  'Fix the portal gun holster',
  "Calibrate Beth's clone scanner",
];

export function createDemoTasks(assignees: Assignee[]): Task[] {
  if (assignees.length === 0) return [];
  const shuffled = [...titles];
  for (let index = shuffled.length - 1; index > 0; index--) {
    const other = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[other]] = [shuffled[other], shuffled[index]];
  }
  const columns: ColumnId[] = [
    ...Array<ColumnId>(6).fill('todo'),
    ...Array<ColumnId>(3).fill('doing'),
    'done',
  ];
  const estimates = [0, 1, 2, 3, 5, 8];
  return shuffled.slice(0, columns.length).map((title, index) => ({
    id: crypto.randomUUID(),
    title,
    description: `${title}. Check the equipment in the garage and leave notes for the next interdimensional adventure.`,
    points: estimates[Math.floor(Math.random() * estimates.length)],
    assigneeId: assignees[Math.floor(Math.random() * assignees.length)].id,
    columnId: columns[index],
  }));
}
