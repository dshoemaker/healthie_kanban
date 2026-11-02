import { expect, test } from '@playwright/test';

const errors: string[] = [];

test.beforeEach(async ({ page }) => {
  errors.length = 0;
  page.on('pageerror', (error) => errors.push(error.message));
  await page.route('https://rickandmortyapi.com/graphql', (route) => route.fulfill({
    json: { data: { characters: { results: [
      { id: '1', name: 'Rick Sanchez', image: 'https://example.test/rick.png' },
      { id: '2', name: 'Morty Smith', image: 'https://example.test/morty.png' },
    ] } } },
  }));
  await page.route('https://example.test/*.png', (route) => route.fulfill({
    contentType: 'image/svg+xml',
    body: '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28"><rect width="28" height="28" fill="#3454b4"/></svg>',
  }));
  await page.goto('/');
  await page.getByRole('button', { name: 'Add task' }).click();
  const form = page.getByRole('dialog', { name: 'Create a task' });
  await form.getByRole('textbox', { name: 'Title' }).fill('Repair portal');
  await form.getByRole('textbox', { name: 'Description' }).fill('Replace the power cell.');
  await form.getByRole('spinbutton', { name: 'Points' }).fill('5');
  await form.getByRole('combobox', { name: 'Assign to' }).selectOption('1');
  await form.getByRole('button', { name: 'Add task' }).click();
});

test.afterEach(() => expect(errors).toEqual([]));

test('Enter opens task details without starting a keyboard drag', async ({ page }) => {
  const card = page.getByRole('article');
  await card.focus();
  await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog', { name: 'Task details' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('textbox', { name: 'Title' })).toBeFocused();
  await expect(page.locator('[data-dnd-dragging], [data-dnd-dropping]')).toHaveCount(0);
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(card).toBeFocused();
});

test('Escape and backdrop dismissal discard drafts and restore card focus', async ({ page }) => {
  const card = page.getByRole('article');
  await card.click();
  const dialog = page.getByRole('dialog', { name: 'Task details' });
  await dialog.getByRole('textbox', { name: 'Description' }).fill('Unsaved draft');
  await page.keyboard.press('Escape');
  await expect(card).toBeFocused();
  await card.click();
  await expect(dialog.getByRole('textbox', { name: 'Description' })).toHaveValue('Replace the power cell.');
  await dialog.getByRole('textbox', { name: 'Title' }).fill('Another unsaved draft');
  await page.mouse.click(8, 8);
  await expect(dialog).toBeHidden();
  await expect(card).toBeFocused();
  await card.click();
  await expect(dialog.getByRole('textbox', { name: 'Title' })).toHaveValue('Repair portal');
});

test('the expanded detail dialog contains keyboard focus and shows a large editor', async ({ page }, testInfo) => {
  const card = page.getByRole('article');
  await card.click();
  const dialog = page.getByRole('dialog', { name: 'Task details' });
  const bounds = await dialog.boundingBox();
  expect(bounds!.width).toBeGreaterThanOrEqual(800);
  expect(bounds!.height).toBeGreaterThanOrEqual(500);
  const title = dialog.getByRole('textbox', { name: 'Title' });
  const save = dialog.getByRole('button', { name: 'Save changes' });
  await save.focus();
  await page.keyboard.press('Tab');
  await expect(title).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(save).toBeFocused();
  await title.focus();
  await page.screenshot({ path: testInfo.outputPath('task-details-desktop.png') });
  await dialog.getByRole('button', { name: 'Cancel' }).click();
  await expect(card).toBeFocused();
});

test('the detail editor remains usable on a narrow screen', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 375, height: 700 });
  await page.getByRole('article').click();
  const dialog = page.getByRole('dialog', { name: 'Task details' });
  const bounds = await dialog.boundingBox();
  expect(bounds!.x).toBeGreaterThanOrEqual(0);
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(375);
  expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(700);
  expect(await dialog.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
  await dialog.getByRole('button', { name: 'Save changes' }).scrollIntoViewIfNeeded();
  await expect(dialog.getByRole('button', { name: 'Save changes' })).toBeInViewport();
  await page.screenshot({ path: testInfo.outputPath('task-details-mobile.png') });
  await dialog.getByRole('button', { name: 'Cancel' }).click();
  await expect(dialog).toBeHidden();
});
