import { expect, test, type Page } from '@playwright/test'

/** 从首页绑定 A08 桌台并进入点餐视图（menu）。 */
async function enterMenu(page: Page) {
  await page.goto('/')
  await page.getByRole('button', { name: /A08/ }).first().click()
  await page.getByRole('button', { name: /进入点餐|Enter/ }).click()
}

test.describe('多货币显示', () => {
  test('REQ-001: 顶栏提供人民币、美元、欧元、日元和港币的显示货币选择', async ({ page }) => {
    await enterMenu(page)

    const currencySelector = page.getByRole('combobox', { name: '显示货币' })
    await expect(currencySelector).toHaveValue('CNY')
    await expect(currencySelector).toHaveText(/人民币 \(CNY\).*美元 \(USD\).*欧元 \(EUR\).*日元 \(JPY\).*港币 \(HKD\)/)
  })

  test('REQ-002: 切换货币后菜单、购物车、订单和结账金额同步更新', async ({ page }) => {
    await enterMenu(page)

    const currencySelector = page.getByRole('combobox', { name: '显示货币' })
    const productCard = page.locator('article').filter({ has: page.getByRole('heading', { name: '鎏金番茄鸳鸯锅' }) })

    await currencySelector.selectOption('USD')
    await expect(productCard).toContainText('US$9.52')

    await productCard.getByRole('button').click()
    await page.getByRole('button', { name: '加入本桌购物车' }).click()

    const cartPanel = page.locator('aside section').filter({ hasText: '本桌购物车' })
    await expect(cartPanel).toContainText('US$9.52')
    await page.getByRole('button', { name: '确认并提交订单' }).click()

    await expect(page).toHaveURL(/#\/order$/)
    await expect(page.getByText('US$9.52').first()).toBeVisible()
    await page.getByRole('button', { name: '去结账' }).click()

    await expect(page).toHaveURL(/#\/checkout$/)
    await expect(page.getByText('US$9.52').first()).toBeVisible()

    await currencySelector.selectOption('EUR')
    await expect(page.getByText('€8.84').first()).toBeVisible()
  })

  test('REQ-003: 切换为港币后菜单、购物车、订单和结账金额同步显示港币', async ({ page }) => {
    await enterMenu(page)

    const currencySelector = page.getByRole('combobox', { name: '显示货币' })
    const productCard = page.locator('article').filter({ has: page.getByRole('heading', { name: '鎏金番茄鸳鸯锅' }) })

    await expect(currencySelector).toContainText('港币 (HKD)')
    await currencySelector.selectOption('HKD')
    await expect(productCard).toContainText('HK$73.44')

    await productCard.getByRole('button').click()
    await page.getByRole('button', { name: '加入本桌购物车' }).click()

    const cartPanel = page.locator('aside section').filter({ hasText: '本桌购物车' })
    await expect(cartPanel).toContainText('HK$73.44')
    await page.getByRole('button', { name: '确认并提交订单' }).click()

    await expect(page).toHaveURL(/#\/order$/)
    await expect(page.getByText('HK$73.44').first()).toBeVisible()
    await page.getByRole('button', { name: '去结账' }).click()

    await expect(page).toHaveURL(/#\/checkout$/)
    await expect(page.getByText('HK$73.44').first()).toBeVisible()
  })

  test('NFR-001: 窄屏下货币和语言控件完整显示在视口内', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await enterMenu(page)

    const currencySelector = page.getByRole('combobox', { name: '显示货币' })
    await currencySelector.selectOption('HKD')
    await expect(currencySelector).toHaveValue('HKD')

    const controls = [
      currencySelector,
      page.getByRole('button', { name: '切换语言' }),
    ]

    for (const control of controls) {
      await expect(control).toBeVisible()
      const box = await control.boundingBox()
      expect(box).not.toBeNull()
      expect(box!.x).toBeGreaterThanOrEqual(0)
      expect(box!.x + box!.width).toBeLessThanOrEqual(390)
    }
  })
})
