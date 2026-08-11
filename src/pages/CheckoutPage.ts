import { Locator, Page } from '@playwright/test';

export class CheckoutStepOnePage {
  readonly page: Page;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly postalCodeInput: Locator;
  readonly continueButton: Locator;
  readonly cancelButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.firstNameInput = page.locator('[data-test="firstName"]');
    this.lastNameInput = page.locator('[data-test="lastName"]');
    this.postalCodeInput = page.locator('[data-test="postalCode"]');
    this.continueButton = page.locator('[data-test="continue"]');
    this.cancelButton = page.locator('[data-test="cancel"]');
    this.errorMessage = page.locator('[data-test="error"]');
  }

  async fillInfo(firstName: string, lastName: string, postalCode: string) {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.postalCodeInput.fill(postalCode);
  }

  async continueToOverview(): Promise<CheckoutStepTwoPage> {
    await this.continueButton.click();
    return new CheckoutStepTwoPage(this.page);
  }

  async submitAndExpectError() {
    await this.continueButton.click();
  }

  async getErrorMessage(): Promise<string> {
    return (await this.errorMessage.textContent())?.trim() ?? '';
  }

  async cancel() {
    await this.cancelButton.click();
  }
}

export class CheckoutStepTwoPage {
  readonly page: Page;
  readonly cartItems: Locator;
  readonly subtotalLabel: Locator;
  readonly taxLabel: Locator;
  readonly totalLabel: Locator;
  readonly finishButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.cartItems = page.locator('.cart_item');
    this.subtotalLabel = page.locator('.summary_subtotal_label');
    this.taxLabel = page.locator('.summary_tax_label');
    this.totalLabel = page.locator('.summary_total_label');
    this.finishButton = page.locator('[data-test="finish"]');
    this.cancelButton = page.locator('[data-test="cancel"]');
  }

  async getItemNames(): Promise<string[]> {
    return this.cartItems.locator('.inventory_item_name').allTextContents();
  }

  private async parseCurrency(locator: Locator): Promise<number> {
    const text = (await locator.textContent()) ?? '';
    const match = text.match(/(\d+\.\d+)/);
    return match ? parseFloat(match[1]) : NaN;
  }

  async getSubtotal(): Promise<number> {
    return this.parseCurrency(this.subtotalLabel);
  }

  async getTax(): Promise<number> {
    return this.parseCurrency(this.taxLabel);
  }

  async getTotal(): Promise<number> {
    return this.parseCurrency(this.totalLabel);
  }

  async cancel() {
    await this.cancelButton.click();
  }

  async finish(): Promise<CheckoutCompletePage> {
    await this.finishButton.click();
    return new CheckoutCompletePage(this.page);
  }
}

export class CheckoutCompletePage {
  readonly page: Page;
  readonly completeHeader: Locator;
  readonly completeText: Locator;
  readonly backHomeButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.completeHeader = page.locator('[data-test="complete-header"]');
    this.completeText = page.locator('[data-test="complete-text"]');
    this.backHomeButton = page.locator('[data-test="back-to-products"]');
  }

  async getHeaderText(): Promise<string> {
    return (await this.completeHeader.textContent())?.trim() ?? '';
  }
}
