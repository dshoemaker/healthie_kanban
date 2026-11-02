import { expect, test } from '@playwright/test';

test('a new card loads its selected avatar and displays its points', async ({ page }, testInfo) => {
  await page.route('https://rickandmortyapi.com/graphql', (route) => route.fulfill({
    json: { data: { characters: { results: [
      { id: '1', name: 'Rick Sanchez', image: 'https://example.test/rick.png' },
      { id: '2', name: 'Morty Smith', image: 'https://example.test/morty.png' },
    ] } } },
  }));
  await page.route('https://example.test/*.png', (route) => route.fulfill({
    contentType: 'image/svg+xml',
    body: '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28"><rect width="28" height="28" fill="#3454b4"/><text x="14" y="19" text-anchor="middle" font-size="16" fill="white">M</text></svg>',
  }));
  await page.goto('/');
  await page.getByRole('button', { name: 'Add task' }).click();
  const dialog = page.getByRole('dialog', { name: 'Create a task' });
  await dialog.getByRole('textbox', { name: 'Title' }).fill('Repair portal');
  await dialog.getByRole('spinbutton', { name: 'Points' }).fill('5');
  await dialog.getByRole('combobox', { name: 'Assign to' }).selectOption('2');
  await dialog.getByRole('button', { name: 'Add task' }).click();
  const card = page.getByRole('article');
  const avatar = card.getByAltText('');
  await expect(avatar).toHaveAttribute('src', 'https://example.test/morty.png');
  await expect.poll(() => avatar.evaluate((image) =>
    image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0,
  )).toBe(true);
  await expect(card.getByText('Morty Smith')).toBeVisible();
  await expect(card.getByText('5', { exact: true })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('card-avatar-points.png') });
});
