import { BookCartBook, SelectorBestPractice } from '../types';

export const BOOKCART_BOOKS: BookCartBook[] = [
  {
    bookId: 2,
    title: "HP2 - Harry Potter and the Chamber of Secrets",
    author: "J.K. Rowling",
    category: "Mystery",
    price: 236.00,
    coverFileName: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80",
    stockQuantity: 45,
  },
  {
    bookId: 3,
    title: "HP3 - Harry Potter and the Prisoner of Azkaban",
    author: "J.K. Rowling",
    category: "Fantasy",
    price: 312.00,
    coverFileName: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&auto=format&fit=crop&q=80",
    stockQuantity: 30,
  },
  {
    bookId: 53,
    title: "Roomies",
    author: "Christina Lauren",
    category: "Romance",
    price: 499.00,
    coverFileName: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&auto=format&fit=crop&q=80",
    stockQuantity: 18,
  },
  {
    bookId: 54,
    title: "Slayer",
    author: "Kiersten White",
    category: "Fantasy",
    price: 388.00,
    coverFileName: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&auto=format&fit=crop&q=80",
    stockQuantity: 22,
  },
  {
    bookId: 82,
    title: "Rot & Ruin",
    author: "Jonathan Maberry",
    category: "Horror",
    price: 215.00,
    coverFileName: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&auto=format&fit=crop&q=80",
    stockQuantity: 12,
  },
  {
    bookId: 87,
    title: "The White Tiger",
    author: "Aravind Adiga",
    category: "Fiction",
    price: 190.00,
    coverFileName: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&auto=format&fit=crop&q=80",
    stockQuantity: 50,
  }
];

export const TEST_CREDENTIALS = {
  validUser: {
    username: "qatester_e2e",
    password: "Password123!",
    firstName: "Alex",
    lastName: "Automation",
    gender: "Male"
  },
  invalidUser: {
    username: "non_existent_user",
    password: "WrongPassword!"
  },
  shippingAddress: {
    name: "Alex Automation",
    addressLine1: "100 QA Test Boulevard",
    addressLine2: "Suite 404, Tech Park",
    pincode: "10001",
    state: "New York"
  }
};

export const SELECTOR_BEST_PRACTICES: SelectorBestPractice[] = [
  {
    element: "Login Button",
    fragileSelector: "html > body > app-root > div > app-nav-menu > mat-toolbar > button.mat-raised-button.mat-primary:nth-child(2)",
    fragileReason: "Extremely fragile long DOM tree path and framework CSS class dependencies that break whenever Angular material layout changes.",
    recommendedSelector: "getByRole('button', { name: 'Login' })",
    recommendedType: "Role",
    explanation: "Tests exact accessibility role and visible label that real users click. Resilient to structural DOM updates.",
    playwrightSnippet: "page.getByRole('button', { name: 'Login' }).click();",
    cypressSnippet: "cy.contains('button', 'Login').click();"
  },
  {
    element: "Search Input Field",
    fragileSelector: "input.mat-input-element.cdk-text-field-autofill-monitored",
    fragileReason: "Relies on dynamic Angular material directive utility classes.",
    recommendedSelector: "getByPlaceholder('Search books or authors')",
    recommendedType: "Placeholder",
    explanation: "Targets the placeholder text user sees directly when searching for books.",
    playwrightSnippet: "page.getByPlaceholder('Search books or authors').fill('HP2');",
    cypressSnippet: "cy.get('input[placeholder=\"Search books or authors\"]').type('HP2');"
  },
  {
    element: "Add to Cart Button",
    fragileSelector: ".mat-card:nth-child(1) > .mat-card-actions > button:nth-child(1)",
    fragileReason: "Hardcodes positional nth-child indices that break when book sorting changes or new books are added.",
    recommendedSelector: "getByRole('card', { name: 'Roomies' }).getByRole('button', { name: 'Add to Cart' })",
    recommendedType: "Role",
    explanation: "Scopes the button to a specific parent element matching the book title, ensuring exact card targeting.",
    playwrightSnippet: "page.locator('app-book-card').filter({ hasText: 'Roomies' }).getByRole('button', { name: 'Add to Cart' }).click();",
    cypressSnippet: "cy.contains('app-book-card', 'Roomies').contains('button', 'Add to Cart').click();"
  },
  {
    element: "Username Input Field",
    fragileSelector: "form > div:nth-child(1) > mat-form-field > div > div > input",
    fragileReason: "Positional form input locator fragile to layout tweaks.",
    recommendedSelector: "getByLabel('Username')",
    recommendedType: "Label",
    explanation: "Uses associated form label element which satisfies WCAG accessibility standards.",
    playwrightSnippet: "page.getByLabel('Username').fill('qatester_e2e');",
    cypressSnippet: "cy.get('input[formcontrolname=\"username\"]').type('qatester_e2e');"
  },
  {
    element: "Cart Quantity Count Badge",
    fragileSelector: "#mat-badge-content-0",
    fragileReason: "Angular material auto-increments badge numbers (#mat-badge-content-0, -1, -2) on re-renders.",
    recommendedSelector: "locator('[data-testid=\"cart-badge\"]')",
    recommendedType: "Data-TestId",
    explanation: "Ideal for dynamic counters or isolated test hooks where aria role or label isn't sufficient.",
    playwrightSnippet: "expect(page.getByTestId('cart-badge')).toHaveText('1');",
    cypressSnippet: "cy.get('[data-testid=\"cart-badge\"]').should('contain', '1');"
  }
];
