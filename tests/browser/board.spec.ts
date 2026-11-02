import { expect, test } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';

const assignees = [
  { id: '1', name: 'Rick Sanchez', image: 'https://example.test/rick.png' },
  { id: '2', name: 'Morty Smith', image: 'https://example.test/morty.png' },
];

const pageErrors: string[] = [];

test.afterEach(() => {
  expect(pageErrors).toEqual([]);
});

test.beforeEach(async ({ page }) => {
  pageErrors.length = 0;
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await page.route('https://rickandmortyapi.com/graphql', (route) => route.fulfill({
    json: { data: { characters: { results: assignees } } },
  }));
  await page.goto('/');
  for (const title of ['A', 'B', 'C']) {
    await addTask(page, title);
  }
});

function column(page: Page, name: string) {
  return page.locator('section').filter({ has: page.getByRole('heading', { name, exact: true }) });
}

function card(page: Page, title: string) {
  return page.getByRole('article').filter({ has: page.getByRole('heading', { name: title, exact: true }) });
}

async function addTask(page: Page, title: string) {
  await page.getByRole('button', { name: 'Add task' }).click();
  const dialog = page.getByRole('dialog', { name: 'Create a task' });
  await dialog.getByRole('textbox', { name: 'Title' }).fill(title);
  await dialog.getByRole('combobox', { name: 'Assign to' }).selectOption('1');
  await dialog.getByRole('button', { name: 'Add task' }).click();
  await expect(dialog).toBeHidden();
}

async function drag(page: Page, source: Locator, target: Locator, vertical = 0.5, cancel = false) {
  const from = await source.getByRole('button').boundingBox();
  const to = await target.boundingBox();
  if (!from || !to) throw new Error('Drag endpoints must be visible');
  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
  await page.mouse.down();
  await page.mouse.move(from.x + from.width / 2 + 12, from.y + from.height / 2, { steps: 5 });
  await page.mouse.move(to.x + to.width / 2, to.y + to.height * vertical, { steps: 20 });
  // Let the drag preview and collision detection settle before releasing.
  await page.waitForTimeout(250);
  if (cancel) await page.keyboard.press('Escape');
  await page.mouse.up();
  // Wait for dnd-kit's drop animation before starting another interaction.
  await expect(page.locator('[data-dnd-dragging], [data-dnd-dropping]')).toHaveCount(0);
}

test('pointer dragging reorders a card from first to last', async ({ page }) => {
  await drag(page, card(page, 'A'), card(page, 'C'), 0.9);
  await addTask(page, 'D');
  await expect(column(page, 'To Do').getByRole('heading', { level: 3 })).toHaveText(['B', 'C', 'A', 'D']);
});

test('pointer dragging reorders a card from last to first', async ({ page }) => {
  await drag(page, card(page, 'C'), card(page, 'A'), 0.1);
  await addTask(page, 'D');
  await expect(column(page, 'To Do').getByRole('heading', { level: 3 })).toHaveText(['C', 'A', 'B', 'D']);
});

test('a card can move into an empty column', async ({ page }) => {
  await drag(page, card(page, 'A'), column(page, 'Doing'), 0.7);
  await addTask(page, 'D');
  await expect(column(page, 'Doing').getByRole('heading', { level: 3 })).toHaveText(['A']);
  await expect(column(page, 'To Do').getByRole('heading', { level: 3 })).toHaveText(['B', 'C', 'D']);
});

test('a task can transfer between cards in a populated column', async ({ page }) => {
  await drag(page, card(page, 'A'), column(page, 'Doing'), 0.7);
  await drag(page, card(page, 'C'), column(page, 'Doing'), 0.9);
  await expect(column(page, 'Doing').getByRole('heading', { level: 3 })).toHaveText(['A', 'C']);
  await drag(page, card(page, 'B'), card(page, 'C'), 0.1);
  await addTask(page, 'D');
  await expect(column(page, 'Doing').getByRole('heading', { level: 3 })).toHaveText(['A', 'B', 'C']);
  await expect(column(page, 'To Do').getByRole('heading', { level: 3 })).toHaveText(['D']);
});

test('Escape cancels a drag without changing task order', async ({ page }) => {
  await drag(page, card(page, 'A'), card(page, 'C'), 0.9, true);
  await addTask(page, 'D');
  await expect(column(page, 'To Do').getByRole('heading', { level: 3 })).toHaveText(['A', 'B', 'C', 'D']);
});

test('dropping outside the board preserves task placement', async ({ page }) => {
  await drag(page, card(page, 'A'), page.getByRole('heading', { name: 'Dimension Board' }));
  await addTask(page, 'D');
  await expect(column(page, 'To Do').getByRole('heading', { level: 3 })).toHaveText(['A', 'B', 'C', 'D']);
  await expect(column(page, 'Doing').getByRole('article')).toHaveCount(0);
  await expect(column(page, 'Done').getByRole('article')).toHaveCount(0);
});

test('keyboard users can pick up, reorder and drop a task', async ({ page }) => {
  const handle = card(page, 'A').getByRole('button', { name: 'Move task: A' });
  await handle.focus();
  await page.keyboard.press('Space');
  await expect(page.locator('[data-dnd-dragging]')).toHaveCount(1);
  await page.keyboard.press('ArrowDown');
  await page.waitForTimeout(300);
  await page.keyboard.press('Space');
  await expect(page.locator('[data-dnd-dragging], [data-dnd-dropping]')).toHaveCount(0);
  await addTask(page, 'D');
  await expect(column(page, 'To Do').getByRole('heading', { level: 3 })).toHaveText(['B', 'A', 'C', 'D']);
});

test('moving the only card out of a column leaves it empty', async ({ page }) => {
  await drag(page, card(page, 'A'), column(page, 'Doing'), 0.7);
  await drag(page, card(page, 'A'), column(page, 'Done'), 0.7);
  await addTask(page, 'D');
  await expect(column(page, 'Doing').getByRole('article')).toHaveCount(0);
  await expect(column(page, 'Done').getByRole('heading', { level: 3 })).toHaveText(['A']);
  await expect(column(page, 'To Do').getByRole('heading', { level: 3 })).toHaveText(['B', 'C', 'D']);
});
