import { test, expect } from '@playwright/test';
import { LoginPage } from '../src/pages/LoginPage';

test.describe('Login', () => {
  test('successful login redirects to inventory page', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('standard_user', 'secret_sauce');

    await expect(page).toHaveURL(/.*inventory\.html/);
    await expect(page.locator('.title')).toHaveText('Products');
  });

  test('failed login with invalid credentials shows error message', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('invalid_user', 'wrong_password');

    await expect(loginPage.errorMessage).toBeVisible();
    const errorText = await loginPage.getErrorMessage();
    expect(errorText).toContain('Username and password do not match any user in this service');
    await expect(page).not.toHaveURL(/.*inventory\.html/);
  });
});

test.describe('Login - edge cases', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('missing username shows a "Username is required" error', async () => {
    await loginPage.login('', 'secret_sauce');
    expect(await loginPage.getErrorMessage()).toContain('Username is required');
  });

  test('missing password shows a "Password is required" error', async () => {
    await loginPage.login('standard_user', '');
    expect(await loginPage.getErrorMessage()).toContain('Password is required');
  });

  test('missing both fields shows a "Username is required" error', async () => {
    await loginPage.login('', '');
    expect(await loginPage.getErrorMessage()).toContain('Username is required');
  });

  test('locked out user is denied access with a specific error', async () => {
    await loginPage.login('locked_out_user', 'secret_sauce');
    expect(await loginPage.getErrorMessage()).toContain('Sorry, this user has been locked out');
  });

  test('username is case-sensitive', async ({ page }) => {
    await loginPage.login('Standard_User', 'secret_sauce');
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(page).not.toHaveURL(/.*inventory\.html/);
  });

  test('error banner can be dismissed', async () => {
    await loginPage.login('invalid_user', 'wrong_password');
    await expect(loginPage.errorMessage).toBeVisible();
    await loginPage.dismissError();
    await expect(loginPage.errorMessage).not.toBeVisible();
  });

  test('direct navigation to inventory page without logging in is blocked', async ({ page }) => {
    await page.goto('/inventory.html');
    await expect(loginPage.errorMessage).toBeVisible();
    expect(await loginPage.getErrorMessage()).toContain('You can only access');
    await expect(loginPage.loginButton).toBeVisible();
  });
});
