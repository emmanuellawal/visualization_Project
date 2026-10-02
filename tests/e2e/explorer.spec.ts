import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile } from 'node:fs/promises';

test('renders a responsive explorer without runtime errors', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: 'Every generation.', exact: false }),
  ).toBeVisible();
  await expect(page.locator('.metric-card')).toHaveCount(4);
  await expect(page.locator('.metric-card').first()).toContainText('5.9%');
  await expect(
    page.getByRole('img', { name: 'unemployment by generation', exact: false }),
  ).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await page.screenshot({ path: `artifacts/cohort-${testInfo.project.name}.png`, fullPage: true });
  expect(errors).toEqual([]);
});
test('changes metrics, inflation adjustment, date range, and table values', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Weekly earnings', exact: true }).click();
  await page.getByLabel('End year', { exact: true }).selectOption('2020');
  await expect(page.locator('.metric-card').first()).toContainText('$567');
  await page.getByRole('checkbox', { name: 'Adjust for inflation' }).check();
  await expect(page.locator('.metric-card').first()).toContainText('$648');
  await page.getByRole('button', { name: 'Table view' }).click();
  await expect(page.getByRole('table')).toContainText('$648');
  await page.reload();
  await expect(page.getByRole('checkbox', { name: 'Adjust for inflation' })).toBeChecked();
  await expect(page.getByLabel('End year', { exact: true })).toHaveValue('2020');
  await page.getByRole('button', { name: 'Reset filters' }).click();
  await expect(page.getByRole('button', { name: 'Unemployment', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(page.getByLabel('End year', { exact: true })).toHaveValue('2023');
});
test('handles a missing period and keeps at least one generation selected', async ({ page }) => {
  await page.goto('/?generations=Gen+Z&from=2000&to=2005');
  await expect(page.locator('.metric-card')).toHaveCount(1);
  await expect(page.locator('.metric-card')).toContainText('No data');
  await expect(page.getByRole('button', { name: 'Gen Z', exact: true })).toHaveAttribute(
    'aria-disabled',
    'true',
  );
  await page.getByRole('button', { name: 'Table view' }).click();
  await expect(page.getByRole('table')).toContainText('—');
  await expect(page.getByRole('table')).not.toContainText('0.0%');
});
test('supports keyboard year selection and independent industry controls', async ({ page }) => {
  await page.goto('/');
  const year = page.getByRole('button', { name: '2010', exact: true });
  await year.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('complementary', { name: 'Selected year values' })).toContainText(
    '18.3%',
  );
  await page.getByLabel('Industry generation').selectOption('Boomers');
  await expect(page.locator('.industry-row').first()).toContainText('Healthcare');
  await expect(page.locator('.industry-row').first()).toContainText('18.9%');
  await page.getByRole('button', { name: 'View all 12 industries' }).click();
  await expect(page.locator('.industry-row')).toHaveCount(12);
});
test('downloads filtered CSV and provides sharing fallback', async ({ page }) => {
  await page.goto('/?generations=Gen+Z&from=2020');
  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export CSV' }).click();
  const download = await downloadEvent;
  const contents = await readFile((await download.path())!, 'utf8');
  expect(contents).toContain('2023,Gen Z,unemployment,5.9');
  expect(contents).not.toContain('Boomers');
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: () => Promise.reject(new Error('Clipboard unavailable')) },
    });
  });
  await page.getByRole('button', { name: 'Share view' }).click();
  await expect(page.getByLabel('Shareable link')).toHaveValue(/generations=Gen\+Z/);
});
test('recovers from failed data requests', async ({ page }) => {
  await page.route('**/employment_by_generation.csv', (route) =>
    route.fulfill({ status: 503, body: 'Unavailable' }),
  );
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'The data couldn’t be loaded.' })).toBeVisible();
  await page.unroute('**/employment_by_generation.csv');
  await page.getByRole('button', { name: 'Try again' }).click();
  await expect(page.locator('.metric-card')).toHaveCount(4);
});
test('passes automated WCAG checks in chart and table modes', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.metric-card')).toHaveCount(4);
  const chart = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(
    chart.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => ({ target: n.target, issue: n.failureSummary })),
    })),
  ).toEqual([]);
  await page.getByRole('button', { name: 'Table view' }).click();
  const table = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(
    table.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => ({ target: n.target, issue: n.failureSummary })),
    })),
  ).toEqual([]);
});

test('keeps controls and charts within a narrow viewport', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto('/');
  await expect(page.locator('.metric-card')).toHaveCount(4);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await page.getByRole('button', { name: 'Weekly earnings', exact: true }).click();
  await page.getByRole('checkbox', { name: 'Adjust for inflation' }).check();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await page.getByRole('button', { name: 'Table view' }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
});

test('updates generation comparisons and copies the selected view', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Boomers', exact: true }).click();
  await expect(page.locator('.metric-card')).toHaveCount(3);
  await page.getByRole('button', { name: 'Participation', exact: true }).click();
  await expect(page.locator('.metric-card').first()).toContainText('81.7%');
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: (text: string) => {
          document.documentElement.dataset.copiedLink = text;
          return Promise.resolve();
        },
      },
    });
  });
  await page.getByRole('button', { name: 'Share view' }).click();
  await expect(page.getByRole('status')).toContainText('Link copied');
  const copied = new URL((await page.locator('html').getAttribute('data-copied-link'))!);
  expect(copied.searchParams.get('generations')).not.toContain('Boomers');
  expect(copied.searchParams.get('metric')).toBe('participation');
  await page.reload();
  await expect(page.locator('.metric-card')).toHaveCount(3);
});
