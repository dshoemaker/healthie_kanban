import { expect, test } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';

const assignees = [
  { id: '1', name: 'Rick Sanchez', image: 'https://example.test/rick.png' },
  { id: '2', name: 'Morty Smith', image: 'https://example.test/morty.png' },
];

test.beforeEach(async ({ page }) => {
  await page.route('https://rickandmortyapi.com/graphql', (route) => route.fulfill({
    json: { data: { characters: { results: assignees } } },
  }));
  await page.goto('/');
  for (const title of ['A', 'B', 'C']) {
    await page.getByRole('textbox', { name: 'Title' }).fill(title);
    await page.getByRole('combobox', { name: 'Assign to' }).selectOption('1');
    await page.getByRole('button', { name: 'Add task' }).click();
  }
});

function column(page: Page, name: string) {
  return page.locator('section').filter({ has: page.getByRole('heading', { name, exact: true }) });
}

function card(page: Page, title: string) {
  return page.getByRole('article').filter({ has: page.getByRole('heading', { name: title, exact: true }) });
}

async function addTask(page: Page, title: string) {
  await page.getByRole('textbox', { name: 'Title' }).fill(title);
  await page.getByRole('combobox', { name: 'Assign to' }).selectOption('1');
  await page.getByRole('button', { name: 'Add task' }).click();
}

async function drag(page: Page, source: Locator, target: Locator, vertical = 0.5) {
  const from = await source.getByRole('button').boundingBox();
  const to = await target.boundingBox();
  if (!from || !to) throw new Error('Drag endpoints must be visible');
  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
  await page.mouse.down();
  await page.mouse.move(from.x + from.width / 2 + 12, from.y + from.height / 2, { steps: 5 });
  await page.mouse.move(to.x + to.width / 2, to.y + to.height * vertical, { steps: 20 });
  // Let the drag preview and collision detection settle before releasing.
  await page.waitForTimeout(250);
  await page.mouse.up();
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
