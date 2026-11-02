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
  await page.route('https://example.test/*.png', (route) => route.fulfill({
    contentType: 'image/svg+xml',
    body: '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28"><rect width="28" height="28" fill="#3454b4"/></svg>',
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

async function drag(page: Page, source: Locator, target: Locator, vertical = 0.5, cancel = false, origin?: Locator) {
  const from = await (origin ?? source).boundingBox();
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
  await expect(page.getByRole('dialog', { name: 'Task details' })).toBeHidden();
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
  const task = page.getByRole('article', { name: 'Task: A' });
  await task.focus();
  await page.keyboard.press('Space');
  await expect(page.locator('[data-dnd-dragging]')).toHaveCount(1);
  await page.keyboard.press('ArrowDown');
  await page.waitForTimeout(300);
  await page.keyboard.press('Space');
  await expect(page.locator('[data-dnd-dragging], [data-dnd-dropping]')).toHaveCount(0);
  await expect(page.getByRole('dialog', { name: 'Task details' })).toBeHidden();
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

test('dragging from the card title reorders the task', async ({ page }) => {
  const source = card(page, 'A');
  await drag(page, source, card(page, 'C'), 0.9, false,
    source.getByRole('heading', { name: 'A', exact: true }));
  await addTask(page, 'D');
  await expect(column(page, 'To Do').getByRole('heading', { level: 3 }))
    .toHaveText(['B', 'C', 'A', 'D']);
});

test('dragging from the avatar moves the task to an empty column', async ({ page }) => {
  const source = card(page, 'A');
  await drag(page, source, column(page, 'Doing'), 0.7, false, source.getByAltText(''));
  await addTask(page, 'D');
  await expect(column(page, 'Doing').getByRole('heading', { level: 3 })).toHaveText(['A']);
  await expect(column(page, 'To Do').getByRole('heading', { level: 3 })).toHaveText(['B', 'C', 'D']);
  await expect(column(page, 'Doing').getByText('Rick Sanchez')).toBeVisible();
  await expect(column(page, 'Doing').getByText('0 points')).toBeVisible();
});

test('dragging from the assignee name moves the task', async ({ page }) => {
  const source = card(page, 'A');
  await drag(page, source, column(page, 'Done'), 0.7, false, source.getByText('Rick Sanchez'));
  await addTask(page, 'D');
  await expect(column(page, 'Done').getByRole('heading', { level: 3 })).toHaveText(['A']);
  await expect(column(page, 'To Do').getByRole('heading', { level: 3 })).toHaveText(['B', 'C', 'D']);
});

test('dragging from the points badge reorders the task', async ({ page }) => {
  const source = card(page, 'A');
  await drag(page, source, card(page, 'C'), 0.9, false, source.getByText('0 points'));
  await addTask(page, 'D');
  await expect(column(page, 'To Do').getByRole('heading', { level: 3 }))
    .toHaveText(['B', 'C', 'A', 'D']);
});

test('a quick click opens details without dragging or changing placement', async ({ page }) => {
  const source = card(page, 'A');
  await source.click();
  // Wait beyond the sensor delay to catch an activation left pending after pointer-up.
  await page.waitForTimeout(250);
  await expect(page.locator('[data-dnd-dragging], [data-dnd-dropping]')).toHaveCount(0);
  const dialog = page.getByRole('dialog', { name: 'Task details' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('textbox', { name: 'Title' })).toHaveValue('A');
  await dialog.getByRole('button', { name: 'Cancel' }).click();
  await expect(column(page, 'To Do').getByRole('heading', { level: 3 }))
    .toHaveText(['A', 'B', 'C']);
});

test('a real click still opens details immediately after a completed drag', async ({ page }) => {
  await drag(page, card(page, 'A'), card(page, 'C'), 0.9);
  const moved = card(page, 'A');
  await moved.click();
  const dialog = page.getByRole('dialog', { name: 'Task details' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('textbox', { name: 'Title' })).toHaveValue('A');
});

test('saving a moved task updates its details without changing columns or other cards', async ({ page }) => {
  await drag(page, card(page, 'A'), column(page, 'Doing'), 0.7);
  await card(page, 'A').click();
  const dialog = page.getByRole('dialog', { name: 'Task details' });
  await dialog.getByRole('textbox', { name: 'Title' }).fill('Updated A');
  await dialog.getByRole('textbox', { name: 'Description' }).fill('Moved task notes.');
  await dialog.getByRole('spinbutton', { name: 'Points' }).fill('8');
  await dialog.getByRole('combobox', { name: 'Assign to' }).selectOption('2');
  await dialog.getByRole('button', { name: 'Save changes' }).click();
  await expect(dialog).toBeHidden();
  await expect(column(page, 'Doing').getByRole('heading', { level: 3 })).toHaveText(['Updated A']);
  await expect(column(page, 'To Do').getByRole('heading', { level: 3 })).toHaveText(['B', 'C']);
  await expect(page.getByRole('article')).toHaveCount(3);
  const updated = card(page, 'Updated A');
  await expect(updated).toBeFocused();
  await expect(updated.getByText('Morty Smith')).toBeVisible();
  await expect(updated.getByText('8 points')).toBeVisible();
  await updated.click();
  await expect(dialog.getByRole('textbox', { name: 'Description' })).toHaveValue('Moved task notes.');
});

test('Enter finishes a keyboard drag without opening task details', async ({ page }) => {
  const source = card(page, 'A');
  await source.focus();
  await page.keyboard.press('Space');
  await expect(page.locator('[data-dnd-dragging]')).toHaveCount(1);
  await page.keyboard.press('ArrowDown');
  await page.waitForTimeout(300);
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-dnd-dragging], [data-dnd-dropping]')).toHaveCount(0);
  await expect(page.getByRole('dialog', { name: 'Task details' })).toBeHidden();
  await expect(column(page, 'To Do').getByRole('heading', { level: 3 })).toHaveText(['B', 'A', 'C']);
  await source.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog', { name: 'Task details' })).toBeVisible();
});

test('picking up and returning a card to the same spot does not open details', async ({ page }) => {
  const source = card(page, 'A');
  const bounds = await source.boundingBox();
  const x = bounds!.x + bounds!.width / 2;
  const y = bounds!.y + bounds!.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + 12, y, { steps: 5 });
  await expect(page.locator('[data-dnd-dragging]')).toHaveCount(1);
  await page.mouse.move(x, y, { steps: 5 });
  await page.mouse.up();
  await expect(page.locator('[data-dnd-dragging], [data-dnd-dropping]')).toHaveCount(0);
  await expect(page.getByRole('dialog', { name: 'Task details' })).toBeHidden();
  await expect(column(page, 'To Do').getByRole('heading', { level: 3 })).toHaveText(['A', 'B', 'C']);
});

test('moving a task into Done celebrates its completion', async ({ page }) => {
  await expect(page.getByRole('status', { name: 'Task completed: A' })).toHaveCount(0);
  await drag(page, card(page, 'A'), column(page, 'Done'), 0.7);
  await expect(page.getByRole('status', { name: 'Task completed: A' })).toBeVisible();
  await expect(column(page, 'Done').getByRole('heading', { level: 3 })).toHaveText(['A']);
});

test('moving a completed task out of Done clears its celebration', async ({ page }) => {
  await drag(page, card(page, 'A'), column(page, 'Done'), 0.7);
  await expect(page.getByRole('status', { name: 'Task completed: A' })).toBeVisible();
  await drag(page, card(page, 'A'), column(page, 'Doing'), 0.7);
  await expect(page.getByRole('status', { name: 'Task completed: A' })).toHaveCount(0);
  await expect(column(page, 'Doing').getByRole('heading', { level: 3 })).toHaveText(['A']);
});

test('the completion celebration clears after its short animation', async ({ page }) => {
  await drag(page, card(page, 'A'), column(page, 'Done'), 0.7);
  const celebration = page.getByRole('status', { name: 'Task completed: A' });
  await expect(celebration).toBeVisible();
  await expect(celebration).toHaveCount(0, { timeout: 3000 });
  await expect(column(page, 'Done').getByRole('heading', { level: 3 })).toHaveText(['A']);
});

test('reordering within Done does not start another celebration', async ({ page }) => {
  await drag(page, card(page, 'A'), column(page, 'Done'), 0.7);
  await expect(page.getByRole('status', { name: 'Task completed: A' })).toHaveCount(0);
  await drag(page, card(page, 'B'), column(page, 'Done'), 0.7);
  await expect(page.getByRole('status', { name: 'Task completed: B' })).toHaveCount(0);
  await drag(page, card(page, 'B'), card(page, 'A'), 0.2);
  await expect(column(page, 'Done').getByRole('heading', { level: 3 })).toHaveText(['B', 'A']);
  await expect(page.getByRole('status', { name: /^Task completed:/ })).toHaveCount(0);
});

test('a task returning from Doing celebrates again', async ({ page }) => {
  await drag(page, card(page, 'A'), column(page, 'Done'), 0.7);
  await expect(page.getByRole('status', { name: 'Task completed: A' })).toHaveCount(0);
  await drag(page, card(page, 'A'), column(page, 'Doing'), 0.7);
  await expect(page.getByRole('status', { name: /^Task completed:/ })).toHaveCount(0);
  await drag(page, card(page, 'A'), column(page, 'Done'), 0.7);
  await expect(page.getByRole('status', { name: 'Task completed: A' })).toBeVisible();
});

test('the arriving card animates through a portal in Done', async ({ page }) => {
  await drag(page, card(page, 'A'), column(page, 'Done'), 0.7);
  await expect(column(page, 'Done').getByRole('status', { name: 'Task completed: A' })).toBeVisible();
  await expect.poll(() => card(page, 'A').evaluate((element) => element.getAnimations({ subtree: true }).length))
    .toBeGreaterThan(0);
});

test('reduced motion keeps completion feedback without movement', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await drag(page, card(page, 'A'), column(page, 'Done'), 0.7);
  const celebration = column(page, 'Done').getByRole('status', { name: 'Task completed: A' });
  await expect(celebration).toBeVisible();
  expect(await celebration.evaluate((element) => element.getAnimations({ subtree: true }).length)).toBe(0);
  expect(await card(page, 'A').evaluate((element) => element.getAnimations({ subtree: true }).length)).toBe(0);
  await expect(card(page, 'A')).toBeVisible();
  await expect(celebration).toHaveCount(0, { timeout: 3000 });
});

test('canceling a move into Done does not celebrate', async ({ page }) => {
  await drag(page, card(page, 'A'), column(page, 'Done'), 0.7, true);
  await expect(page.getByRole('status', { name: /^Task completed:/ })).toHaveCount(0);
  await expect(column(page, 'To Do').getByRole('heading', { level: 3 })).toHaveText(['A', 'B', 'C']);
  await expect(column(page, 'Done').getByRole('article')).toHaveCount(0);
});

test('editing a task already in Done does not replay its celebration', async ({ page }) => {
  await drag(page, card(page, 'A'), column(page, 'Done'), 0.7);
  await expect(page.getByRole('status', { name: 'Task completed: A' })).toHaveCount(0);
  await card(page, 'A').click();
  const dialog = page.getByRole('dialog', { name: 'Task details' });
  await dialog.getByRole('textbox', { name: 'Title' }).fill('Finished A');
  await dialog.getByRole('button', { name: 'Save changes' }).click();
  await expect(column(page, 'Done').getByRole('heading', { level: 3 })).toHaveText(['Finished A']);
  await expect(page.getByRole('status', { name: /^Task completed:/ })).toHaveCount(0);
});
