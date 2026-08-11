import { test, expect } from '@playwright/test';
import { LoginPage } from '../src/pages/LoginPage';
import { InventoryPage } from '../src/pages/InventoryPage';

const EXPECTED_PRODUCT_COUNT = 6;

test.describe('Inventory', () => {
  let inventoryPage: InventoryPage;

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('standard_user', 'secret_sauce');
    inventoryPage = new InventoryPage(page);
  });

  test('all products are displayed on the inventory page', async () => {
    await expect(inventoryPage.inventoryItems).toHaveCount(EXPECTED_PRODUCT_COUNT);
    const names = await inventoryPage.getProductNames();
    expect(names).toHaveLength(EXPECTED_PRODUCT_COUNT);
    names.forEach((name) => expect(name.trim().length).toBeGreaterThan(0));
  });

  test('sorting products by name (A to Z) orders them alphabetically', async () => {
    await inventoryPage.sortBy('az');
    const names = await inventoryPage.getProductNames();
    const sorted = [...names].sort((a, b) => a.localeCompare(b));
    expect(names).toEqual(sorted);
  });

  test('sorting products by price (low to high) orders them ascending', async () => {
    await inventoryPage.sortBy('lohi');
    const prices = await inventoryPage.getProductPrices();
    const sorted = [...prices].sort((a, b) => a - b);
    expect(prices).toEqual(sorted);
  });

  test('clicking a product opens the detail page with matching info', async () => {
    const names = await inventoryPage.getProductNames();
    const prices = await inventoryPage.getProductPrices();
    const targetName = names[0];
    const targetPrice = prices[0];

    const detailPage = await inventoryPage.openProduct(targetName);

    await expect(detailPage.name).toHaveText(targetName);
    const detailPrice = await detailPage.getPrice();
    expect(detailPrice).toBe(targetPrice);
    await expect(detailPage.description).not.toBeEmpty();
  });
});

const PRODUCT_A = 'Sauce Labs Backpack';

test.describe('Inventory - edge cases', () => {
  let inventoryPage: InventoryPage;

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('standard_user', 'secret_sauce');
    inventoryPage = new InventoryPage(page);
  });

  test('sorting products by name (Z to A) orders them reverse-alphabetically', async () => {
    await inventoryPage.sortBy('za');
    const names = await inventoryPage.getProductNames();
    const sorted = [...names].sort((a, b) => b.localeCompare(a));
    expect(names).toEqual(sorted);
  });

  test('sorting products by price (high to low) orders them descending', async () => {
    await inventoryPage.sortBy('hilo');
    const prices = await inventoryPage.getProductPrices();
    const sorted = [...prices].sort((a, b) => b - a);
    expect(prices).toEqual(sorted);
  });

  test('cart badge is absent when the cart is empty', async () => {
    await expect(inventoryPage.cartBadge).not.toBeVisible();
    expect(await inventoryPage.getCartBadgeCount()).toBe(0);
  });

  test('add-to-cart button toggles to Remove and back after add/remove', async () => {
    expect(await inventoryPage.isProductInCart(PRODUCT_A)).toBe(false);

    await inventoryPage.addProductToCart(PRODUCT_A);
    expect(await inventoryPage.isProductInCart(PRODUCT_A)).toBe(true);

    await inventoryPage.removeProductFromCart(PRODUCT_A);
    expect(await inventoryPage.isProductInCart(PRODUCT_A)).toBe(false);
  });

  test('removing the only item in the cart clears the badge entirely', async () => {
    await inventoryPage.addProductToCart(PRODUCT_A);
    expect(await inventoryPage.getCartBadgeCount()).toBe(1);

    await inventoryPage.removeProductFromCart(PRODUCT_A);
    await expect(inventoryPage.cartBadge).not.toBeVisible();
  });

  test('navigating back from product detail returns to the full inventory list', async ({ page }) => {
    const detailPage = await inventoryPage.openProduct(PRODUCT_A);
    await detailPage.backButton.click();

    const restoredInventory = new InventoryPage(page);
    await expect(restoredInventory.inventoryItems).toHaveCount(EXPECTED_PRODUCT_COUNT);
  });
});
