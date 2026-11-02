import { expect, test } from '@playwright/test';

const errors: string[] = [];

test.beforeEach(async ({ page }) => {
  errors.length = 0;
  page.on('pageerror', (error) => errors.push(error.message));
  await page.route('https://rickandmortyapi.com/graphql', (route) => route.fulfill({
    json: { data: { characters: { results: [
      { id: '1', name: 'Rick Sanchez', image: 'https://example.test/rick.png' },
    ] } } },
  }));
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Add task' })).toBeVisible();
});

test.afterEach(() => {
  expect(errors).toEqual([]);
});

test('Escape closes the modal, restores focus and permits reopening', async ({ page }) => {
  const trigger = page.getByRole('button', { name: 'Add task' });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Create a task' });
  await expect(dialog.getByRole('textbox', { name: 'Title' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  await trigger.click();
  await expect(dialog).toBeVisible();
});

test('clicking the backdrop closes without creating and restores focus', async ({ page }) => {
  const trigger = page.getByRole('button', { name: 'Add task' });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Create a task' });
  await dialog.getByRole('textbox', { name: 'Title' }).fill('Discard this');
  await page.mouse.click(8, 8);
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(page.getByRole('article')).toHaveCount(0);
});

test('keyboard focus stays inside the modal and Cancel restores the trigger', async ({ page }) => {
  const trigger = page.getByRole('button', { name: 'Add task' });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Create a task' });
  const title = dialog.getByRole('textbox', { name: 'Title' });
  const cancel = dialog.getByRole('button', { name: 'Cancel' });
  await expect(title).toBeFocused();
  await cancel.focus();
  await page.keyboard.press('Tab');
  await expect(title).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(cancel).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test('keyboard submission creates one task, closes and restores focus', async ({ page }) => {
  const trigger = page.getByRole('button', { name: 'Add task' });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Create a task' });
  await dialog.getByRole('textbox', { name: 'Title' }).fill('Repair portal');
  await dialog.getByRole('textbox', { name: 'Description' }).fill('Replace the damaged power cell.');
  await dialog.getByRole('spinbutton', { name: 'Points' }).fill('5');
  await dialog.getByRole('combobox', { name: 'Assign to' }).selectOption('1');
  await dialog.getByRole('textbox', { name: 'Title' }).press('Enter');
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(page.getByRole('article')).toHaveCount(1);
  await expect(page.getByRole('heading', { name: 'Repair portal' })).toBeVisible();
  await trigger.click();
  await expect(dialog.getByRole('textbox', { name: 'Title' })).toHaveValue('');
  await expect(dialog.getByRole('textbox', { name: 'Description' })).toHaveValue('');
  await expect(dialog.getByRole('spinbutton', { name: 'Points' })).toHaveValue('0');
  await expect(dialog.getByRole('combobox', { name: 'Assign to' })).toHaveValue('');
});

test('the modal fits a narrow screen and keeps its actions reachable', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 375, height: 700 });
  await page.getByRole('button', { name: 'Add task' }).click();
  const dialog = page.getByRole('dialog', { name: 'Create a task' });
  const bounds = await dialog.boundingBox();
  expect(bounds).not.toBeNull();
  expect(bounds!.x).toBeGreaterThanOrEqual(0);
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(375);
  expect(bounds!.y).toBeGreaterThanOrEqual(0);
  expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(700);
  expect(await dialog.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
  await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeInViewport();
  await expect(dialog.getByRole('button', { name: 'Add task' })).toBeInViewport();
  await page.screenshot({ path: testInfo.outputPath('task-modal-mobile.png') });
});
