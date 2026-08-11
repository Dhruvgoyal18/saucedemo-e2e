import { Locator, Page } from '@playwright/test';
import { ProductDetailPage } from './ProductDetailPage';

export type SortOption = 'az' | 'za' | 'lohi' | 'hilo';

const SORT_VALUES: Record<SortOption, string> = {
  az: 'az',
  za: 'za',
  lohi: 'lohi',
  hilo: 'hilo',
};

export class InventoryPage {
  readonly page: Page;
  readonly inventoryItems: Locator;
  readonly sortDropdown: Locator;
  readonly cartBadge: Locator;
  readonly cartLink: Locator;
  readonly inventoryTitle: Locator;

  constructor(page: Page) {
    this.page = page;
    this.inventoryItems = page.locator('.inventory_item');
    this.sortDropdown = page.locator('[data-test="product-sort-container"]');
    this.cartBadge = page.locator('[data-test="shopping-cart-badge"]');
    this.cartLink = page.locator('[data-test="shopping-cart-link"]');
    this.inventoryTitle = page.locator('.title');
  }

  private itemByName(name: string): Locator {
    return this.inventoryItems.filter({ has: this.page.locator('.inventory_item_name', { hasText: name }) });
  }

  async getProductNames(): Promise<string[]> {
    return this.inventoryItems.locator('.inventory_item_name').allTextContents();
  }

  async getProductPrices(): Promise<number[]> {
    const priceTexts = await this.inventoryItems.locator('.inventory_item_price').allTextContents();
    return priceTexts.map((p) => parseFloat(p.replace('$', '')));
  }

  async sortBy(option: SortOption) {
    await this.sortDropdown.selectOption(SORT_VALUES[option]);
  }

  async addProductToCart(name: string) {
    await this.itemByName(name).getByRole('button', { name: 'Add to cart' }).click();
  }

  async removeProductFromCart(name: string) {
    await this.itemByName(name).getByRole('button', { name: 'Remove' }).click();
  }

  async isProductInCart(name: string): Promise<boolean> {
    return this.itemByName(name).getByRole('button', { name: 'Remove' }).isVisible();
  }

  async getCartBadgeCount(): Promise<number> {
    if (!(await this.cartBadge.isVisible())) return 0;
    return parseInt((await this.cartBadge.textContent()) ?? '0', 10);
  }

  async openCart() {
    await this.cartLink.click();
  }

  async openProduct(name: string): Promise<ProductDetailPage> {
    await this.itemByName(name).locator('.inventory_item_name').click();
    return new ProductDetailPage(this.page);
  }
}
