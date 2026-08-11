import { test, expect } from '@playwright/test';
import { LoginPage } from '../src/pages/LoginPage';
import { InventoryPage } from '../src/pages/InventoryPage';
import { CartPage } from '../src/pages/CartPage';

const PRODUCT_A = 'Sauce Labs Backpack';

test.describe('Checkout', () => {
  let inventoryPage: InventoryPage;

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('standard_user', 'secret_sauce');
    inventoryPage = new InventoryPage(page);
    await inventoryPage.addProductToCart(PRODUCT_A);
  });

  test('completes the full checkout flow end to end', async ({ page }) => {
    await inventoryPage.openCart();
    const cartPage = new CartPage(page);
    await expect(cartPage.cartItems).toHaveCount(1);

    const stepOne = await cartPage.proceedToCheckout();
    await stepOne.fillInfo('Jane', 'Doe', '12345');
    const stepTwo = await stepOne.continueToOverview();

    const items = await stepTwo.getItemNames();
    expect(items).toContain(PRODUCT_A);

    const completePage = await stepTwo.finish();
    await expect(completePage.completeHeader).toBeVisible();
    const headerText = await completePage.getHeaderText();
    expect(headerText).toBe('Thank you for your order!');
  });

  test('checkout with missing required fields shows a validation error', async ({ page }) => {
    await inventoryPage.openCart();
    const cartPage = new CartPage(page);
    const stepOne = await cartPage.proceedToCheckout();

    await stepOne.submitAndExpectError();

    await expect(stepOne.errorMessage).toBeVisible();
    const errorText = await stepOne.getErrorMessage();
    expect(errorText).toContain('Error');
    await expect(page).toHaveURL(/.*checkout-step-one\.html/);
  });
});

const PRODUCT_B = 'Sauce Labs Bike Light';

test.describe('Checkout - edge cases', () => {
  let inventoryPage: InventoryPage;

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('standard_user', 'secret_sauce');
    inventoryPage = new InventoryPage(page);
    await inventoryPage.addProductToCart(PRODUCT_A);
  });

  test('missing first name shows "First Name is required"', async ({ page }) => {
    await inventoryPage.openCart();
    const cartPage = new CartPage(page);
    const stepOne = await cartPage.proceedToCheckout();

    await stepOne.fillInfo('', 'Doe', '12345');
    await stepOne.submitAndExpectError();
    expect(await stepOne.getErrorMessage()).toContain('First Name is required');
  });

  test('missing last name shows "Last Name is required"', async ({ page }) => {
    await inventoryPage.openCart();
    const cartPage = new CartPage(page);
    const stepOne = await cartPage.proceedToCheckout();

    await stepOne.fillInfo('Jane', '', '12345');
    await stepOne.submitAndExpectError();
    expect(await stepOne.getErrorMessage()).toContain('Last Name is required');
  });

  test('missing postal code shows "Postal Code is required"', async ({ page }) => {
    await inventoryPage.openCart();
    const cartPage = new CartPage(page);
    const stepOne = await cartPage.proceedToCheckout();

    await stepOne.fillInfo('Jane', 'Doe', '');
    await stepOne.submitAndExpectError();
    expect(await stepOne.getErrorMessage()).toContain('Postal Code is required');
  });

  test('Cancel on checkout info step returns to the cart page', async ({ page }) => {
    await inventoryPage.openCart();
    const cartPage = new CartPage(page);
    const stepOne = await cartPage.proceedToCheckout();

    await stepOne.cancel();
    await expect(page).toHaveURL(/.*cart\.html/);
  });

  test('Cancel on checkout overview step returns to the inventory page', async ({ page }) => {
    await inventoryPage.openCart();
    const cartPage = new CartPage(page);
    const stepOne = await cartPage.proceedToCheckout();
    await stepOne.fillInfo('Jane', 'Doe', '12345');
    const stepTwo = await stepOne.continueToOverview();

    await stepTwo.cancel();
    await expect(page).toHaveURL(/.*inventory\.html/);
  });

  test('order overview subtotal plus tax equals the total for multiple items', async ({ page }) => {
    await inventoryPage.addProductToCart(PRODUCT_B);
    await inventoryPage.openCart();
    const cartPage = new CartPage(page);
    const stepOne = await cartPage.proceedToCheckout();
    await stepOne.fillInfo('Jane', 'Doe', '12345');
    const stepTwo = await stepOne.continueToOverview();

    const subtotal = await stepTwo.getSubtotal();
    const tax = await stepTwo.getTax();
    const total = await stepTwo.getTotal();

    expect(Math.round((subtotal + tax) * 100) / 100).toBeCloseTo(total, 2);
  });

  test('cart is emptied after order completion and Back Home returns to inventory', async ({ page }) => {
    await inventoryPage.openCart();
    const cartPage = new CartPage(page);
    const stepOne = await cartPage.proceedToCheckout();
    await stepOne.fillInfo('Jane', 'Doe', '12345');
    const stepTwo = await stepOne.continueToOverview();
    const completePage = await stepTwo.finish();

    await completePage.backHomeButton.click();

    const restoredInventory = new InventoryPage(page);
    await expect(page).toHaveURL(/.*inventory\.html/);
    await expect(restoredInventory.cartBadge).not.toBeVisible();
  });
});
