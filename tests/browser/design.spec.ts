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
});

test.afterEach(() => expect(errors).toEqual([]));

test('empty columns extend to the bottom of the viewport', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Add task' })).toBeVisible();
  for (const section of await page.locator('section').all()) {
    const bounds = await section.boundingBox();
    expect(bounds!.y + bounds!.height).toBeGreaterThanOrEqual(876);
  }
  expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBe(900);
});

test('assignee options show a loaded avatar to the left of each name', async ({ page }, testInfo) => {
  await page.goto('/');
  await expect(page.getByRole('status', { name: '' })).toBeHidden();
  await page.getByRole('button', { name: 'Add task' }).click();
  const picker = page.getByRole('combobox', { name: 'Assign to' });
  await picker.click();
  const option = page.getByRole('option', { name: 'Morty Smith' });
  const avatar = option.locator('img');
  await expect(avatar).toBeVisible();
  await expect.poll(() => avatar.evaluate((image) =>
    image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0,
  )).toBe(true);
  const imageBounds = await avatar.boundingBox();
  const nameBounds = await option.locator('span').boundingBox();
  expect(imageBounds!.x + imageBounds!.width).toBeLessThanOrEqual(nameBounds!.x);
  await page.screenshot({ path: testInfo.outputPath('assignee-avatar-options.png') });
  await option.click();
  await expect(picker).toHaveValue('2');
  await picker.focus();
  await page.keyboard.press('Space');
  await page.keyboard.press('Home');
  await page.keyboard.press('Enter');
  await expect(picker).toHaveValue('');
  await expect(page.getByRole('dialog')).toBeVisible();
});

test('populated columns grow beyond the viewport and demo controls can clear them', async ({ page }, testInfo) => {
  await page.goto('/?seed=true');
  await page.getByRole('button', { name: 'Seed board' }).click();
  await expect(page.getByRole('article')).toHaveCount(10);
  const bottoms: number[] = [];
  for (const section of await page.locator('section').all()) {
    const bounds = await section.boundingBox();
    const lastCard = await section.getByRole('article').last().boundingBox();
    bottoms.push(bounds!.y + bounds!.height);
    expect(bounds!.y + bounds!.height).toBeGreaterThan(900);
    expect(lastCard!.y + lastCard!.height).toBeLessThanOrEqual(bounds!.y + bounds!.height - 16);
  }
  expect(Math.max(...bottoms) - Math.min(...bottoms)).toBeLessThan(1);
  expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBeGreaterThan(900);
  await expect(page.getByRole('status', { name: /^Task completed:/ })).toHaveCount(0);
  await page.screenshot({ path: testInfo.outputPath('seeded-board-desktop.png'), fullPage: true });
  await page.setViewportSize({ width: 375, height: 700 });
  // Let Chrome paint the resized surface before capturing its pixels.
  await page.evaluate(() => new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  }));
  await expect(page.getByRole('heading', { name: 'Dimension Board', exact: true })).toHaveCount(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
  await page.screenshot({ path: testInfo.outputPath('seeded-board-mobile.png') });
  const done = page.locator('section').filter({ has: page.getByRole('heading', { name: 'Done', exact: true }) });
  await done.getByRole('article').last().scrollIntoViewIfNeeded();
  await expect(done.getByRole('article').last()).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('seeded-board-mobile-bottom.png') });
  await page.getByRole('button', { name: 'Clear board' }).click();
  await expect(page.getByRole('article')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Clear board' })).toBeDisabled();
});
