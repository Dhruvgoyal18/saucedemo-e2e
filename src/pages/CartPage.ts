import { Locator, Page } from '@playwright/test';
import { CheckoutStepOnePage } from './CheckoutPage';

export class CartPage {
  readonly page: Page;
  readonly cartItems: Locator;
  readonly checkoutButton: Locator;
  readonly continueShoppingButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.cartItems = page.locator('.cart_item');
    this.checkoutButton = page.locator('[data-test="checkout"]');
    this.continueShoppingButton = page.locator('[data-test="continue-shopping"]');
  }

  async getCartItemNames(): Promise<string[]> {
    return this.cartItems.locator('.inventory_item_name').allTextContents();
  }

  async removeItem(name: string) {
    const item = this.cartItems.filter({ has: this.page.locator('.inventory_item_name', { hasText: name }) });
    await item.getByRole('button', { name: 'Remove' }).click();
  }

  async getItemQuantity(name: string): Promise<string> {
    const item = this.cartItems.filter({ has: this.page.locator('.inventory_item_name', { hasText: name }) });
    return (await item.locator('.cart_quantity').textContent())?.trim() ?? '';
  }

  async continueShopping() {
    await this.continueShoppingButton.click();
  }

  async proceedToCheckout(): Promise<CheckoutStepOnePage> {
    await this.checkoutButton.click();
    return new CheckoutStepOnePage(this.page);
  }
}
