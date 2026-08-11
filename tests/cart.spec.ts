import { test, expect } from '@playwright/test';
import { LoginPage } from '../src/pages/LoginPage';
import { InventoryPage } from '../src/pages/InventoryPage';
import { CartPage } from '../src/pages/CartPage';

const PRODUCT_A = 'Sauce Labs Backpack';
const PRODUCT_B = 'Sauce Labs Bike Light';

test.describe('Cart', () => {
  let inventoryPage: InventoryPage;

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('standard_user', 'secret_sauce');
    inventoryPage = new InventoryPage(page);
  });

  test('adding multiple products updates the cart badge count', async () => {
    await inventoryPage.addProductToCart(PRODUCT_A);
    expect(await inventoryPage.getCartBadgeCount()).toBe(1);

    await inventoryPage.addProductToCart(PRODUCT_B);
    expect(await inventoryPage.getCartBadgeCount()).toBe(2);
  });

  test('removing a product from the inventory page updates the cart badge', async () => {
    await inventoryPage.addProductToCart(PRODUCT_A);
    await inventoryPage.addProductToCart(PRODUCT_B);
    expect(await inventoryPage.getCartBadgeCount()).toBe(2);

    await inventoryPage.removeProductFromCart(PRODUCT_A);
    expect(await inventoryPage.getCartBadgeCount()).toBe(1);
  });

  test('cart page lists exactly the products that were added', async ({ page }) => {
    await inventoryPage.addProductToCart(PRODUCT_A);
    await inventoryPage.addProductToCart(PRODUCT_B);

    await inventoryPage.openCart();
    const cartPage = new CartPage(page);

    const names = await cartPage.getCartItemNames();
    expect(names.sort()).toEqual([PRODUCT_A, PRODUCT_B].sort());
  });
});

test.describe('Cart - edge cases', () => {
  let inventoryPage: InventoryPage;

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('standard_user', 'secret_sauce');
    inventoryPage = new InventoryPage(page);
  });

  test('cart item quantity is always shown as 1', async ({ page }) => {
    await inventoryPage.addProductToCart(PRODUCT_A);
    await inventoryPage.openCart();
    const cartPage = new CartPage(page);

    expect(await cartPage.getItemQuantity(PRODUCT_A)).toBe('1');
  });

  test('Continue Shopping button returns to the inventory page', async ({ page }) => {
    await inventoryPage.addProductToCart(PRODUCT_A);
    await inventoryPage.openCart();
    const cartPage = new CartPage(page);

    await cartPage.continueShopping();
    await expect(page).toHaveURL(/.*inventory\.html/);
  });

  test('removing an item from the cart page updates the badge on return to inventory', async ({ page }) => {
    await inventoryPage.addProductToCart(PRODUCT_A);
    await inventoryPage.addProductToCart(PRODUCT_B);
    await inventoryPage.openCart();
    const cartPage = new CartPage(page);

    await cartPage.removeItem(PRODUCT_A);
    const remainingNames = await cartPage.getCartItemNames();
    expect(remainingNames).toEqual([PRODUCT_B]);

    await cartPage.continueShopping();
    const restoredInventory = new InventoryPage(page);
    expect(await restoredInventory.getCartBadgeCount()).toBe(1);
  });
});
