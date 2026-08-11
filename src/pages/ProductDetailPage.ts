import { Locator, Page } from '@playwright/test';

export class ProductDetailPage {
  readonly page: Page;
  readonly name: Locator;
  readonly description: Locator;
  readonly price: Locator;
  readonly addToCartButton: Locator;
  readonly backButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.name = page.locator('.inventory_details_name');
    this.description = page.locator('.inventory_details_desc');
    this.price = page.locator('.inventory_details_price');
    this.addToCartButton = page.getByRole('button', { name: 'Add to cart' });
    this.backButton = page.locator('[data-test="back-to-products"]');
  }

  async getName(): Promise<string> {
    return (await this.name.textContent())?.trim() ?? '';
  }

  async getPrice(): Promise<number> {
    const text = (await this.price.textContent()) ?? '0';
    return parseFloat(text.replace('$', ''));
  }
}
