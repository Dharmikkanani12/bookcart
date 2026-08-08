import { TestCase, PageObjectFile } from '../types';

export const PAGE_OBJECT_FILES: PageObjectFile[] = [
  {
    id: 'pom-login',
    name: 'LoginPage.ts',
    path: 'src/pages/LoginPage.ts',
    type: 'pom',
    category: 'auth',
    description: 'Page Object Model encapsulating BookCart login, registration, and user auth state methods.',
    playwrightContent: `import { Page, Locator, expect } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly registerLink: Locator;
  readonly errorMessage: Locator;
  readonly userHeaderButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.getByLabel('Username');
    this.passwordInput = page.getByLabel('Password');
    this.loginButton = page.getByRole('button', { name: 'Login' }).nth(1);
    this.registerLink = page.getByRole('button', { name: 'Register' });
    this.errorMessage = page.locator('mat-error, snack-bar-container');
    this.userHeaderButton = page.locator('app-nav-menu').getByRole('button', { name: /qatester|account/i });
  }

  async navigate() {
    await this.page.goto('/login');
    await expect(this.usernameInput).toBeVisible();
  }

  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    
    // Dynamic wait for API response before asserting redirect
    const loginResponsePromise = this.page.waitForResponse(
      (resp) => resp.url().includes('/api/Login') && resp.status() === 200,
      { timeout: 8000 }
    ).catch(() => null);

    await this.loginButton.click();
    await loginResponsePromise;
  }

  async assertLoginSuccess(username: string) {
    await expect(this.page).toHaveURL(/\\/$/);
    await expect(this.userHeaderButton).toContainText(username, { ignoreCase: true });
  }

  async assertLoginFailure() {
    await expect(this.errorMessage).toBeVisible();
  }
}`,
    cypressContent: `export class LoginPage {
  elements = {
    usernameInput: () => cy.get('input[formcontrolname="username"]'),
    passwordInput: () => cy.get('input[formcontrolname="password"]'),
    loginButton: () => cy.contains('button', 'Login'),
    registerLink: () => cy.contains('button', 'Register'),
    errorMessage: () => cy.get('mat-error, snack-bar-container'),
    userHeaderMenu: () => cy.get('app-nav-menu button')
  };

  visit() {
    cy.visit('/login');
    this.elements.usernameInput().should('be.visible');
  }

  login(username: string, password: string) {
    cy.intercept('POST', '**/api/Login').as('loginReq');
    this.elements.usernameInput().type(username);
    this.elements.passwordInput().type(password);
    this.elements.loginButton().click();
  }

  assertSuccess(username: string) {
    cy.wait('@loginReq').its('response.statusCode').should('eq', 200);
    cy.url().should('not.include', '/login');
    this.elements.userHeaderMenu().should('contain.text', username);
  }

  assertFailure() {
    this.elements.errorMessage().should('be.visible');
  }
}`
  },
  {
    id: 'pom-home',
    name: 'HomePage.ts',
    path: 'src/pages/HomePage.ts',
    type: 'pom',
    category: 'search',
    description: 'Page Object Model handling BookCart book search, filtering by category, and sorting.',
    playwrightContent: `import { Page, Locator, expect } from '@playwright/test';

export class HomePage {
  readonly page: Page;
  readonly searchInput: Locator;
  readonly categoryFilterList: Locator;
  readonly bookCards: Locator;
  readonly cartBadge: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchInput = page.getByPlaceholder('Search books or authors');
    this.categoryFilterList = page.locator('mat-list-item');
    this.bookCards = page.locator('app-book-card');
    this.cartBadge = page.locator('button[routerlink="/shopping-cart"] mat-icon[matbadge]');
  }

  async navigate() {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
  }

  async searchBook(titleOrAuthor: string) {
    await this.searchInput.fill(titleOrAuthor);
    // Dynamic wait for DOM filter render without hardcoded sleep
    await expect(this.bookCards.first()).toBeVisible();
  }

  async selectCategory(categoryName: string) {
    const categoryItem = this.categoryFilterList.filter({ hasText: categoryName });
    await categoryItem.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async addBookToCart(bookTitle: string) {
    const targetCard = this.bookCards.filter({ hasText: bookTitle });
    const addToCartBtn = targetCard.getByRole('button', { name: 'Add to Cart' });
    await addToCartBtn.click();
  }

  async assertCartBadgeCount(expectedCount: number) {
    await expect(this.cartBadge).toHaveText(expectedCount.toString());
  }
}`,
    cypressContent: `export class HomePage {
  elements = {
    searchInput: () => cy.get('input[placeholder="Search books or authors"]'),
    categoryList: () => cy.get('mat-list-item'),
    bookCards: () => cy.get('app-book-card'),
    cartBadge: () => cy.get('button[routerlink="/shopping-cart"]')
  };

  visit() {
    cy.visit('/');
  }

  search(term: string) {
    this.elements.searchInput().clear().type(term);
    this.elements.bookCards().should('have.length.at.least', 1);
  }

  selectCategory(category: string) {
    this.elements.categoryList().contains(category).click();
  }

  addBookToCart(bookTitle: string) {
    this.elements.bookCards()
      .contains(bookTitle)
      .parents('app-book-card')
      .contains('button', 'Add to Cart')
      .click();
  }

  assertCartBadge(count: number) {
    this.elements.cartBadge().should('contain', count.toString());
  }
}`
  },
  {
    id: 'pom-cart',
    name: 'CartPage.ts',
    path: 'src/pages/CartPage.ts',
    type: 'pom',
    category: 'cart',
    description: 'Page Object Model managing item list, quantity changes, price subtotal, and checkout entry.',
    playwrightContent: `import { Page, Locator, expect } from '@playwright/test';

export class CartPage {
  readonly page: Page;
  readonly cartItemsTable: Locator;
  readonly checkoutButton: Locator;
  readonly emptyCartMessage: Locator;
  readonly totalPriceText: Locator;

  constructor(page: Page) {
    this.page = page;
    this.cartItemsTable = page.locator('table.mat-table');
    this.checkoutButton = page.getByRole('button', { name: 'Checkout' });
    this.emptyCartMessage = page.getByText(/Your shopping cart is empty/i);
    this.totalPriceText = page.locator('.total-price, td:has-text("Total")');
  }

  async navigate() {
    await this.page.goto('/shopping-cart');
  }

  async updateQuantity(bookTitle: string, action: 'increment' | 'decrement') {
    const row = this.cartItemsTable.locator('tr').filter({ hasText: bookTitle });
    const btnName = action === 'increment' ? '+' : '-';
    await row.getByRole('button', { name: btnName }).click();
  }

  async removeItem(bookTitle: string) {
    const row = this.cartItemsTable.locator('tr').filter({ hasText: bookTitle });
    await row.getByRole('button', { name: 'Delete' }).click();
  }

  async proceedToCheckout() {
    await this.checkoutButton.click();
    await expect(this.page).toHaveURL(/\\/checkout/);
  }
}`,
    cypressContent: `export class CartPage {
  visit() {
    cy.visit('/shopping-cart');
  }

  updateQuantity(bookTitle: string, action: 'increment' | 'decrement') {
    const symbol = action === 'increment' ? '+' : '-';
    cy.contains('tr', bookTitle).contains('button', symbol).click();
  }

  removeItem(bookTitle: string) {
    cy.contains('tr', bookTitle).contains('button', 'Delete').click();
  }

  proceedToCheckout() {
    cy.contains('button', 'Checkout').click();
    cy.url().should('include', '/checkout');
  }
}`
  },
  {
    id: 'pom-checkout',
    name: 'CheckoutPage.ts',
    path: 'src/pages/CheckoutPage.ts',
    type: 'pom',
    category: 'checkout',
    description: 'Page Object Model for user shipping details form and order confirmation receipt.',
    playwrightContent: `import { Page, Locator, expect } from '@playwright/test';

export class CheckoutPage {
  readonly page: Page;
  readonly nameInput: Locator;
  readonly address1Input: Locator;
  readonly address2Input: Locator;
  readonly pincodeInput: Locator;
  readonly stateInput: Locator;
  readonly placeOrderButton: Locator;
  readonly orderSuccessCard: Locator;

  constructor(page: Page) {
    this.page = page;
    this.nameInput = page.getByLabel('Name');
    this.address1Input = page.getByLabel('Address Line 1');
    this.address2Input = page.getByLabel('Address Line 2');
    this.pincodeInput = page.getByLabel('Pincode');
    this.stateInput = page.getByLabel('State');
    this.placeOrderButton = page.getByRole('button', { name: 'Place Order' });
    this.orderSuccessCard = page.locator('app-order-details, .order-success-card');
  }

  async fillShippingDetails(details: {
    name: string;
    addressLine1: string;
    addressLine2: string;
    pincode: string;
    state: string;
  }) {
    await this.nameInput.fill(details.name);
    await this.address1Input.fill(details.addressLine1);
    await this.address2Input.fill(details.addressLine2);
    await this.pincodeInput.fill(details.pincode);
    await this.stateInput.fill(details.state);
  }

  async placeOrder() {
    const checkoutApi = this.page.waitForResponse(
      (resp) => resp.url().includes('/api/CheckOut') && resp.status() === 200,
      { timeout: 10000 }
    );
    await this.placeOrderButton.click();
    await checkoutApi;
  }

  async assertOrderConfirmation() {
    await expect(this.page).toHaveURL(/\\/myorders/);
  }
}`,
    cypressContent: `export class CheckoutPage {
  fillShippingDetails(details: any) {
    cy.get('input[formcontrolname="name"]').clear().type(details.name);
    cy.get('input[formcontrolname="addressLine1"]').clear().type(details.addressLine1);
    cy.get('input[formcontrolname="addressLine2"]').clear().type(details.addressLine2);
    cy.get('input[formcontrolname="pincode"]').clear().type(details.pincode);
    cy.get('input[formcontrolname="state"]').clear().type(details.state);
  }

  placeOrder() {
    cy.intercept('POST', '**/api/CheckOut/**').as('checkoutReq');
    cy.contains('button', 'Place Order').click();
    cy.wait('@checkoutReq').its('response.statusCode').should('eq', 200);
  }

  assertOrderConfirmation() {
    cy.url().should('include', '/myorders');
  }
}`
  },
  {
    id: 'config-playwright',
    name: 'playwright.config.ts',
    path: 'playwright.config.ts',
    type: 'config',
    description: 'Production Playwright configuration with multi-browser matrix, parallel execution, and html reporter.',
    playwrightContent: `import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 2 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['allure-playwright'],
    ['list']
  ],
  use: {
    baseURL: 'https://bookcart.azurewebsites.net',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10000,
    navigationTimeout: 15000,
  },
  projects: [
    {
      name: 'Chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'WebKit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});`,
    cypressContent: `import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'https://bookcart.azurewebsites.net',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    retries: {
      runMode: 2,
      openMode: 0,
    },
    setupNodeEvents(on, config) {
      // Allure or HTML reporter setup
    },
  },
});`
  }
];

export const TEST_CASES: TestCase[] = [
  {
    id: 'TC-AUTH-01',
    title: 'User Registration & Form Validation',
    requirement: 'User Authentication',
    category: 'auth',
    description: 'Verify new user can successfully register with valid details and password criteria.',
    pomsUsed: ['LoginPage.ts'],
    tags: ['Critical', 'Smoke', 'Auth'],
    status: 'passed',
    durationMs: 1420,
    playwrightCode: `import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test.describe('Authentication - Registration', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.navigate();
  });

  test('User can navigate to registration and register new account', async ({ page }) => {
    await loginPage.registerLink.click();
    await expect(page).toHaveURL(/\\/user-registration/);

    const uniqueUser = \`qa_user_\${Date.now()}\`;
    await page.getByLabel('First Name').fill('QA');
    await page.getByLabel('Last Name').fill('Engineer');
    await page.getByLabel('Username').fill(uniqueUser);
    await page.getByLabel('Password').fill('Password123!');
    await page.getByLabel('Confirm Password').fill('Password123!');
    await page.getByRole('radio', { name: 'Male' }).check();

    const registerApi = page.waitForResponse(
      resp => resp.url().includes('/api/User') && resp.status() === 200
    );
    await page.getByRole('button', { name: 'Register' }).click();
    await registerApi;

    await expect(page).toHaveURL(/\\/login/);
  });
});`,
    cypressCode: `describe('Authentication - Registration', () => {
  it('User can register new account', () => {
    cy.visit('/login');
    cy.contains('button', 'Register').click();
    cy.url().should('include', '/user-registration');

    const username = \`qa_user_\${Date.now()}\`;
    cy.get('input[formcontrolname="firstname"]').type('QA');
    cy.get('input[formcontrolname="lastname"]').type('Engineer');
    cy.get('input[formcontrolname="username"]').type(username);
    cy.get('input[formcontrolname="password"]').type('Password123!');
    cy.get('input[formcontrolname="confirmPassword"]').type('Password123!');
    cy.get('mat-radio-button[value="Male"]').click();

    cy.intercept('POST', '**/api/User').as('regReq');
    cy.contains('button', 'Register').click();
    cy.wait('@regReq').its('response.statusCode').should('eq', 200);
    cy.url().should('include', '/login');
  });
});`,
    steps: [
      {
        id: 's1',
        name: 'Navigate to BookCart Login Page',
        action: 'page.goto("/login")',
        selector: 'getByLabel("Username")',
        selectorType: 'label',
        assertion: 'expect(usernameInput).toBeVisible()',
        expectedResult: 'Login page rendered cleanly',
        durationMs: 320,
        status: 'passed',
        consoleLog: '[Info] Navigation to https://bookcart.azurewebsites.net/login completed in 320ms'
      },
      {
        id: 's2',
        name: 'Click Register Link',
        action: 'registerLink.click()',
        selector: 'getByRole("button", { name: "Register" })',
        selectorType: 'role',
        assertion: 'expect(page).toHaveURL(/\\/user-registration/)',
        expectedResult: 'Redirected to user registration form',
        durationMs: 210,
        status: 'passed'
      },
      {
        id: 's3',
        name: 'Fill Registration Fields & Submit',
        action: 'fill(uniqueUser)',
        selector: 'getByLabel("First Name"), getByLabel("Username")',
        selectorType: 'label',
        assertion: 'waitForResponse("/api/User") status == 200',
        expectedResult: 'HTTP 200 User Created API Response',
        durationMs: 890,
        status: 'passed',
        networkRequest: {
          method: 'POST',
          url: 'https://bookcart.azurewebsites.net/api/User',
          status: 200,
          responseTimeMs: 240,
          responseBody: { message: "User registered successfully" }
        }
      }
    ]
  },
  {
    id: 'TC-AUTH-02',
    title: 'Login with Valid Credentials & State Persistence',
    requirement: 'User Authentication',
    category: 'auth',
    description: 'Verify existing user can authenticate successfully and session token persists in storage.',
    pomsUsed: ['LoginPage.ts'],
    tags: ['Critical', 'Sanity', 'Auth'],
    status: 'passed',
    durationMs: 1180,
    playwrightCode: `import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test('Login with valid credentials successfully', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.navigate();
  await loginPage.login('qatester_e2e', 'Password123!');
  await loginPage.assertLoginSuccess('qatester_e2e');
  
  // Storage verification assertion
  const token = await page.evaluate(() => localStorage.getItem('authToken'));
  expect(token).not.toBeNull();
});`,
    cypressCode: `import { LoginPage } from '../pages/LoginPage';

describe('Login Test', () => {
  it('Login with valid credentials', () => {
    const loginPage = new LoginPage();
    loginPage.visit();
    loginPage.login('qatester_e2e', 'Password123!');
    loginPage.assertSuccess('qatester_e2e');
  });
});`,
    steps: [
      {
        id: 's1',
        name: 'Navigate to Login Page',
        action: 'loginPage.navigate()',
        selector: 'getByLabel("Username")',
        selectorType: 'label',
        assertion: 'expect(usernameInput).toBeVisible()',
        expectedResult: 'Username field ready for input',
        durationMs: 280,
        status: 'passed'
      },
      {
        id: 's2',
        name: 'Submit Login Credentials',
        action: 'loginPage.login("qatester_e2e", "*****")',
        selector: 'getByRole("button", { name: "Login" })',
        selectorType: 'role',
        assertion: 'waitForResponse("/api/Login") == 200',
        expectedResult: 'Auth token generated and saved',
        durationMs: 610,
        status: 'passed',
        networkRequest: {
          method: 'POST',
          url: 'https://bookcart.azurewebsites.net/api/Login',
          status: 200,
          responseTimeMs: 310,
          responseBody: { token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", user: { userId: 1204, username: "qatester_e2e" } }
        }
      },
      {
        id: 's3',
        name: 'Verify Header User Account Button',
        action: 'assertLoginSuccess("qatester_e2e")',
        selector: 'locator("app-nav-menu button")',
        selectorType: 'text',
        assertion: 'expect(userHeaderButton).toContainText("qatester_e2e")',
        expectedResult: 'Logged in user state visible in nav header',
        durationMs: 290,
        status: 'passed'
      }
    ]
  },
  {
    id: 'TC-AUTH-03',
    title: 'Invalid Password Handling & Error Assertions',
    requirement: 'User Authentication',
    category: 'auth',
    description: 'Ensure system rejects incorrect passwords with user-friendly error message.',
    pomsUsed: ['LoginPage.ts'],
    tags: ['Regression', 'Negative', 'Auth'],
    status: 'passed',
    durationMs: 980,
    playwrightCode: `import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test('Invalid password displays error alert', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.navigate();
  await loginPage.login('qatester_e2e', 'WrongPassword999');
  await loginPage.assertLoginFailure();
});`,
    cypressCode: `import { LoginPage } from '../pages/LoginPage';

it('Displays error on invalid login', () => {
  const loginPage = new LoginPage();
  loginPage.visit();
  loginPage.login('qatester_e2e', 'WrongPassword999');
  loginPage.assertFailure();
});`,
    steps: [
      {
        id: 's1',
        name: 'Submit Incorrect Password',
        action: 'loginPage.login("qatester_e2e", "WrongPassword")',
        selector: 'getByLabel("Password")',
        selectorType: 'label',
        assertion: 'waitForResponse("/api/Login") == 401',
        expectedResult: 'HTTP 401 Unauthorized API Response',
        durationMs: 540,
        status: 'passed',
        networkRequest: {
          method: 'POST',
          url: 'https://bookcart.azurewebsites.net/api/Login',
          status: 401,
          responseTimeMs: 180,
          responseBody: { message: "Username or Password is incorrect" }
        }
      },
      {
        id: 's2',
        name: 'Assert Error Alert Visibility',
        action: 'expect(errorMessage).toBeVisible()',
        selector: 'locator("mat-error")',
        selectorType: 'css',
        assertion: 'expect(errorMessage).toContainText("incorrect")',
        expectedResult: 'Error message visible on interface',
        durationMs: 440,
        status: 'passed'
      }
    ]
  },
  {
    id: 'TC-SRCH-01',
    title: 'Search Books by Title & Author Keyword',
    requirement: 'Product Search & Navigation',
    category: 'search',
    description: 'Verify live dynamic search filtering works for book titles and author names.',
    pomsUsed: ['HomePage.ts'],
    tags: ['Smoke', 'Search'],
    status: 'passed',
    durationMs: 1250,
    playwrightCode: `import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';

test('Search book by title returns filtered cards', async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.navigate();
  await homePage.searchBook('Roomies');
  
  await expect(homePage.bookCards).toHaveCount(1);
  await expect(homePage.bookCards.first()).toContainText('Roomies');
  await expect(homePage.bookCards.first()).toContainText('Christina Lauren');
});`,
    cypressCode: `import { HomePage } from '../pages/HomePage';

it('Searches for book by title', () => {
  const homePage = new HomePage();
  homePage.visit();
  homePage.search('Roomies');
  homePage.elements.bookCards().should('have.length', 1);
  homePage.elements.bookCards().first().should('contain', 'Roomies');
});`,
    steps: [
      {
        id: 's1',
        name: 'Navigate to Home Catalog Page',
        action: 'homePage.navigate()',
        selector: 'getByPlaceholder("Search books or authors")',
        selectorType: 'placeholder',
        assertion: 'expect(searchInput).toBeVisible()',
        expectedResult: 'Home catalog loaded with 6+ books',
        durationMs: 410,
        status: 'passed'
      },
      {
        id: 's2',
        name: 'Type "Roomies" in Search Field',
        action: 'searchInput.fill("Roomies")',
        selector: 'getByPlaceholder("Search books or authors")',
        selectorType: 'placeholder',
        assertion: 'expect(bookCards).toHaveCount(1)',
        expectedResult: 'Catalog updates dynamically showing only Roomies',
        durationMs: 840,
        status: 'passed'
      }
    ]
  },
  {
    id: 'TC-SRCH-02',
    title: 'Category Filter Navigation (Biography, Fantasy, Fiction)',
    requirement: 'Product Search & Navigation',
    category: 'search',
    description: 'Test clicking category list items filters books accurately based on category taxonomy.',
    pomsUsed: ['HomePage.ts'],
    tags: ['Regression', 'Search'],
    status: 'passed',
    durationMs: 1340,
    playwrightCode: `import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';

test('Filtering by category Mystery displays correct books', async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.navigate();
  await homePage.selectCategory('Mystery');
  
  const mysteryCard = homePage.bookCards.first();
  await expect(mysteryCard).toBeVisible();
  await expect(mysteryCard).toContainText('HP2');
});`,
    cypressCode: `import { HomePage } from '../pages/HomePage';

it('Filters catalog by category', () => {
  const homePage = new HomePage();
  homePage.visit();
  homePage.selectCategory('Mystery');
  homePage.elements.bookCards().should('be.visible');
});`,
    steps: [
      {
        id: 's1',
        name: 'Select "Mystery" Category from Sidebar',
        action: 'selectCategory("Mystery")',
        selector: 'locator("mat-list-item").filter({ hasText: "Mystery" })',
        selectorType: 'text',
        assertion: 'expect(bookCards.first()).toBeVisible()',
        expectedResult: 'Filtered catalog displays Mystery category books',
        durationMs: 650,
        status: 'passed'
      },
      {
        id: 's2',
        name: 'Verify Filtered Book Details',
        action: 'expect(bookCards.first()).toContainText("HP2")',
        selector: 'locator("app-book-card")',
        selectorType: 'css',
        assertion: 'Contains HP2 Chamber of Secrets',
        expectedResult: 'Matched book title correctly',
        durationMs: 690,
        status: 'passed'
      }
    ]
  },
  {
    id: 'TC-CART-01',
    title: 'Add Book to Shopping Cart & Badge Increment',
    requirement: 'Shopping Cart Management',
    category: 'cart',
    description: 'Verify clicking "Add to Cart" updates the cart item count badge instantly.',
    pomsUsed: ['HomePage.ts', 'CartPage.ts'],
    tags: ['Critical', 'Cart'],
    status: 'passed',
    durationMs: 1560,
    playwrightCode: `import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';

test('Add book to cart increments badge count', async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.navigate();
  await homePage.addBookToCart('Roomies');
  await homePage.assertCartBadgeCount(1);
});`,
    cypressCode: `import { HomePage } from '../pages/HomePage';

it('Adds item to cart', () => {
  const homePage = new HomePage();
  homePage.visit();
  homePage.addBookToCart('Roomies');
  homePage.assertCartBadge(1);
});`,
    steps: [
      {
        id: 's1',
        name: 'Locate "Roomies" Book Card and Click Add to Cart',
        action: 'addBookToCart("Roomies")',
        selector: 'locator("app-book-card").filter({ hasText: "Roomies" }).getByRole("button", { name: "Add to Cart" })',
        selectorType: 'role',
        assertion: 'waitForResponse("/api/ShoppingCart/AddToCart") == 200',
        expectedResult: 'Cart endpoint succeeds with 200 OK',
        durationMs: 820,
        status: 'passed',
        networkRequest: {
          method: 'POST',
          url: 'https://bookcart.azurewebsites.net/api/ShoppingCart/AddToCart/1204/53',
          status: 200,
          responseTimeMs: 290,
          responseBody: { cartCount: 1 }
        }
      },
      {
        id: 's2',
        name: 'Assert Cart Badge Count Header Equals 1',
        action: 'assertCartBadgeCount(1)',
        selector: 'locator("button[routerlink=\\"/shopping-cart\\"]")',
        selectorType: 'css',
        assertion: 'expect(cartBadge).toHaveText("1")',
        expectedResult: 'Badge counter displays 1 item',
        durationMs: 740,
        status: 'passed'
      }
    ]
  },
  {
    id: 'TC-CART-02',
    title: 'Update Cart Quantity & Recalculate Subtotal',
    requirement: 'Shopping Cart Management',
    category: 'cart',
    description: 'Ensure incrementing/decrementing item quantity in cart table dynamically re-calculates subtotals.',
    pomsUsed: ['CartPage.ts'],
    tags: ['Regression', 'Cart'],
    status: 'passed',
    durationMs: 1680,
    playwrightCode: `import { test, expect } from '@playwright/test';
import { CartPage } from '../pages/CartPage';

test('Updating item quantity recalculates total price', async ({ page }) => {
  const cartPage = new CartPage(page);
  await cartPage.navigate();
  await cartPage.updateQuantity('Roomies', 'increment');
  
  // Verify dynamic table cell price update
  const row = cartPage.cartItemsTable.locator('tr').filter({ hasText: 'Roomies' });
  await expect(row.locator('td.quantity')).toContainText('2');
});`,
    cypressCode: `import { CartPage } from '../pages/CartPage';

it('Increments quantity in cart', () => {
  const cartPage = new CartPage();
  cartPage.visit();
  cartPage.updateQuantity('Roomies', 'increment');
  cy.contains('tr', 'Roomies').should('contain', '2');
});`,
    steps: [
      {
        id: 's1',
        name: 'Navigate to Cart Page',
        action: 'cartPage.navigate()',
        selector: 'locator("table.mat-table")',
        selectorType: 'css',
        assertion: 'expect(cartItemsTable).toBeVisible()',
        expectedResult: 'Cart table displayed with items',
        durationMs: 420,
        status: 'passed'
      },
      {
        id: 's2',
        name: 'Click "+" Button on Roomies Row',
        action: 'updateQuantity("Roomies", "increment")',
        selector: 'getByRole("button", { name: "+" })',
        selectorType: 'role',
        assertion: 'expect(quantityCell).toHaveText("2")',
        expectedResult: 'Quantity updated to 2 and subtotal updated to ₹998.00',
        durationMs: 1260,
        status: 'passed'
      }
    ]
  },
  {
    id: 'TC-CART-03',
    title: 'Remove Item & Verify Cart Empty State',
    requirement: 'Shopping Cart Management',
    category: 'cart',
    description: 'Verify removing the final item from cart renders the empty cart placeholder card.',
    pomsUsed: ['CartPage.ts'],
    tags: ['Cart', 'Regression'],
    status: 'passed',
    durationMs: 1210,
    playwrightCode: `import { test, expect } from '@playwright/test';
import { CartPage } from '../pages/CartPage';

test('Removing item clears cart and shows empty state', async ({ page }) => {
  const cartPage = new CartPage(page);
  await cartPage.navigate();
  await cartPage.removeItem('Roomies');
  await expect(cartPage.emptyCartMessage).toBeVisible();
});`,
    cypressCode: `import { CartPage } from '../pages/CartPage';

it('Removes item from cart', () => {
  const cartPage = new CartPage();
  cartPage.visit();
  cartPage.removeItem('Roomies');
  cy.contains('Your shopping cart is empty').should('be.visible');
});`,
    steps: [
      {
        id: 's1',
        name: 'Click "Delete" Button on Item Row',
        action: 'removeItem("Roomies")',
        selector: 'getByRole("button", { name: "Delete" })',
        selectorType: 'role',
        assertion: 'waitForResponse("/api/ShoppingCart/1204/53") == 200',
        expectedResult: 'Item deleted from backend cart',
        durationMs: 610,
        status: 'passed'
      },
      {
        id: 's2',
        name: 'Assert Empty Cart Message Component',
        action: 'expect(emptyCartMessage).toBeVisible()',
        selector: 'getByText(/Your shopping cart is empty/i)',
        selectorType: 'text',
        assertion: 'Message displayed cleanly',
        expectedResult: 'Empty cart placeholder view visible',
        durationMs: 600,
        status: 'passed'
      }
    ]
  },
  {
    id: 'TC-CHKO-01',
    title: 'E2E Complete Purchase Flow & Shipping Address Entry',
    requirement: 'Checkout Process',
    category: 'checkout',
    description: 'Full E2E user journey: Login -> Add Book -> Cart Checkout -> Fill Address -> Place Order.',
    pomsUsed: ['LoginPage.ts', 'HomePage.ts', 'CartPage.ts', 'CheckoutPage.ts'],
    tags: ['Critical', 'E2E', 'Checkout'],
    status: 'passed',
    durationMs: 2840,
    playwrightCode: `import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { HomePage } from '../pages/HomePage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';

test('Complete e2e checkout order flow', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const homePage = new HomePage(page);
  const cartPage = new CartPage(page);
  const checkoutPage = new CheckoutPage(page);

  // 1. Auth Login
  await loginPage.navigate();
  await loginPage.login('qatester_e2e', 'Password123!');

  // 2. Select Book
  await homePage.addBookToCart('Roomies');

  // 3. Go to Cart
  await cartPage.navigate();
  await cartPage.proceedToCheckout();

  // 4. Fill Address & Place Order
  await checkoutPage.fillShippingDetails({
    name: 'Alex Automation',
    addressLine1: '100 QA Test Blvd',
    addressLine2: 'Suite 404',
    pincode: '10001',
    state: 'New York'
  });

  await checkoutPage.placeOrder();
  await checkoutPage.assertOrderConfirmation();
});`,
    cypressCode: `import { LoginPage } from '../pages/LoginPage';
import { HomePage } from '../pages/HomePage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';

it('Completes end-to-end checkout flow', () => {
  const loginPage = new LoginPage();
  const homePage = new HomePage();
  const cartPage = new CartPage();
  const checkoutPage = new CheckoutPage();

  loginPage.visit();
  loginPage.login('qatester_e2e', 'Password123!');
  
  homePage.addBookToCart('Roomies');
  cartPage.visit();
  cartPage.proceedToCheckout();

  checkoutPage.fillShippingDetails({
    name: 'Alex Automation',
    addressLine1: '100 QA Test Blvd',
    addressLine2: 'Suite 404',
    pincode: '10001',
    state: 'New York'
  });

  checkoutPage.placeOrder();
  checkoutPage.assertOrderConfirmation();
});`,
    steps: [
      {
        id: 's1',
        name: 'Authenticate User & Add Book "Roomies"',
        action: 'login() -> addBookToCart()',
        selector: 'getByRole("button", { name: "Add to Cart" })',
        selectorType: 'role',
        assertion: 'Cart badge equals 1',
        expectedResult: 'User logged in and book added to session cart',
        durationMs: 910,
        status: 'passed'
      },
      {
        id: 's2',
        name: 'Proceed to Checkout Page',
        action: 'cartPage.proceedToCheckout()',
        selector: 'getByRole("button", { name: "Checkout" })',
        selectorType: 'role',
        assertion: 'expect(page).toHaveURL(/\\/checkout/)',
        expectedResult: 'Checkout shipping form loaded',
        durationMs: 430,
        status: 'passed'
      },
      {
        id: 's3',
        name: 'Fill Shipping Address Form Fields',
        action: 'fillShippingDetails(...)',
        selector: 'getByLabel("Name"), getByLabel("Address Line 1")',
        selectorType: 'label',
        assertion: 'All inputs valid',
        expectedResult: 'Form completed with clean user attributes',
        durationMs: 620,
        status: 'passed'
      },
      {
        id: 's4',
        name: 'Submit Order & Confirm Receipt',
        action: 'placeOrder()',
        selector: 'getByRole("button", { name: "Place Order" })',
        selectorType: 'role',
        assertion: 'waitForResponse("/api/CheckOut") == 200',
        expectedResult: 'Order placed, redirected to /myorders page',
        durationMs: 880,
        status: 'passed',
        networkRequest: {
          method: 'POST',
          url: 'https://bookcart.azurewebsites.net/api/CheckOut/1204',
          status: 200,
          responseTimeMs: 340,
          responseBody: { orderId: "ORD-2026-88912", status: "Success", amount: 499.00 }
        }
      }
    ]
  },
  {
    id: 'TC-API-01',
    title: 'Direct API Integration Suite: /api/Book & /api/Login',
    requirement: 'API Testing Layer',
    category: 'api',
    description: 'Fast backend API verification of endpoints directly without browser UI layer overhead.',
    pomsUsed: ['ApiHelper.ts'],
    tags: ['API', 'Fast', 'Sanity'],
    status: 'passed',
    durationMs: 490,
    playwrightCode: `import { test, expect } from '@playwright/test';

test.describe('BookCart Backend API Suite', () => {
  test('GET /api/Book returns JSON array of books with schema validation', async ({ request }) => {
    const response = await request.get('/api/Book');
    expect(response.status()).toBe(200);
    
    const books = await response.json();
    expect(Array.isArray(books)).toBe(true);
    expect(books.length).toBeGreaterThan(0);
    
    // Schema checks
    const firstBook = books[0];
    expect(firstBook).toHaveProperty('bookId');
    expect(firstBook).toHaveProperty('title');
    expect(firstBook).toHaveProperty('price');
  });

  test('POST /api/Login with valid credentials yields JWT Token', async ({ request }) => {
    const response = await request.post('/api/Login', {
      data: {
        username: 'qatester_e2e',
        password: 'Password123!'
      }
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.token).toBeTruthy();
  });
});`,
    cypressCode: `describe('BookCart API Suite', () => {
  it('GET /api/Book schema validation', () => {
    cy.request('GET', '/api/Book').then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('array');
      expect(response.body[0]).to.have.property('title');
    });
  });
});`,
    steps: [
      {
        id: 's1',
        name: 'Execute GET /api/Book Request',
        action: 'request.get("/api/Book")',
        selector: 'Endpoint',
        selectorType: 'api',
        assertion: 'status == 200 && Array.isArray(books)',
        expectedResult: 'Returned 45+ books schema payload',
        durationMs: 220,
        status: 'passed',
        networkRequest: {
          method: 'GET',
          url: 'https://bookcart.azurewebsites.net/api/Book',
          status: 200,
          responseTimeMs: 220
        }
      },
      {
        id: 's2',
        name: 'Execute POST /api/Login Request',
        action: 'request.post("/api/Login")',
        selector: 'Endpoint',
        selectorType: 'api',
        assertion: 'status == 200 && token exists',
        expectedResult: 'JWT Auth token generated in 270ms',
        durationMs: 270,
        status: 'passed',
        networkRequest: {
          method: 'POST',
          url: 'https://bookcart.azurewebsites.net/api/Login',
          status: 200,
          responseTimeMs: 270
        }
      }
    ]
  },
  {
    id: 'TC-VIS-01',
    title: 'Visual Regression Snapshot: Home Catalog Layout',
    requirement: 'Visual Regression Testing',
    category: 'visual',
    description: 'Visual diff comparison to detect unexpected layout shift or CSS regressions in book cards grid.',
    pomsUsed: ['HomePage.ts'],
    tags: ['Visual', 'Regression'],
    status: 'passed',
    durationMs: 1820,
    playwrightCode: `import { test, expect } from '@playwright/test';

test('Home page matches visual baseline screenshot', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  
  // Mask dynamic elements before snapshot
  await expect(page).toHaveScreenshot('home-catalog-baseline.png', {
    maxDiffPixelRatio: 0.02,
    mask: [page.locator('.user-clock, .live-banner')]
  });
});`,
    cypressCode: `describe('Visual Testing', () => {
  it('Matches visual baseline', () => {
    cy.visit('/');
    cy.matchImageSnapshot('home-catalog');
  });
});`,
    steps: [
      {
        id: 's1',
        name: 'Render Full Page & Capture Snapshot',
        action: 'toHaveScreenshot()',
        selector: 'page',
        selectorType: 'css',
        assertion: 'maxDiffPixelRatio < 0.02',
        expectedResult: 'Visual snapshot matches baseline image 100%',
        durationMs: 1820,
        status: 'passed'
      }
    ]
  }
];
