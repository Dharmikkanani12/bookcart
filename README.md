# BookCart End-to-End (E2E) Test Suite Studio

[![roadmap.sh Project](https://img.shields.io/badge/roadmap.sh-E2E%20Test%20Cases%20for%20E--Commerce%20App-blue?style=flat-square&logo=roadmapdotsh)](https://roadmap.sh/projects/e2e-test-ecommerce-app)

A production-grade, full-featured End-to-End (E2E) Automation Test Suite Studio built with **TypeScript**, **Playwright**, **Cypress**, and **React**. Designed specifically to fulfill the requirements of the [roadmap.sh E2E Test Cases for an E-Commerce App Project](https://roadmap.sh/projects/e2e-test-ecommerce-app), targeting the [BookCart E-Commerce Demo Application](https://bookcart.azurewebsites.net/) using industry-standard Quality Assurance (QA) practices.

---

## 📌 roadmap.sh Project Overview & Requirements

This project fulfills the full scope of the **[roadmap.sh E2E Testing Project](https://roadmap.sh/projects/e2e-test-ecommerce-app)**:

* **Target Application**: [https://bookcart.azurewebsites.net/](https://bookcart.azurewebsites.net/)
* **Core Requirements**:
  1. **User Authentication**: Automated specs for Login, Logout, and User Registration with form validations.
  2. **Product Search & Filtering**: Verification of title search, category navigation (Biography, Fiction, Drama, Mystery), and price filter bounds.
  3. **Shopping Cart Management**: Validation of adding books to cart, updating item quantities, badge count updates, and item deletion.
  4. **End-to-End Checkout Flow**: Full user journey from cart review to shipping address entry and order placement confirmation.
* **Best Practices & Constraints**:
  - **Page Object Model (POM)**: Strict separation of locators and actions into clean Page Classes (`LoginPage.ts`, `HomePage.ts`, `CartPage.ts`, `CheckoutPage.ts`).
  - **User-Facing Locators**: Prioritizing resilient selectors (`getByRole`, `getByText`, `getByLabel`) over fragile XPaths or generated CSS classes.
  - **Zero Flakiness**: Dynamic waiting using response interceptions (`page.waitForResponse` or `cy.intercept`) instead of fixed sleep timeouts (`page.waitForTimeout`).
  - **Cross-Browser & CI/CD Matrix**: Parallel headless test runs across Chromium, Firefox, and WebKit on GitHub Actions.

---

## 🌟 Key Features & Capabilities

### 1. 🚀 Interactive Live Test Runner
* **Real-time Spec Execution**: Run individual test specs or execute full regression suites dynamically with live visual execution states.
* **Page Object Model (POM) Step Log**: Detailed step-by-step reporting showing exact locators, actions (`click`, `type`, `intercept`), and assertion statuses (`passed`, `failed`, `running`).
* **Embedded App Sandbox**: Visual frame simulating real browser interactions on `https://bookcart.azurewebsites.net/`.

### 2. 📁 Page Object Model (POM) & Spec Code Explorer
* **Modular Spec Architecture**: Clean separation between Page Objects (`LoginPage.ts`, `HomePage.ts`, `CartPage.ts`, `CheckoutPage.ts`) and Spec files (`auth.spec.ts`, `cart.spec.ts`, `checkout.spec.ts`).
* **Dual Framework Toggle**: Switch between **Playwright (TypeScript)** and **Cypress (TypeScript)** spec implementations in real time.
* **Syntax Highlighting & Copy**: Read, inspect, or copy production-grade test files for local repository setup.

### 3. 📊 Allure & HTML Test Report Analytics
* **Executive QA Summary Cards**: High-level execution stats (Pass Rate %, Total Tests, Total Duration, Flakiness Index).
* **Category Breakdown Chart**: Visual distribution of test coverage across Authentication, Catalog Search, Shopping Cart, and Checkout flows.
* **Detailed Execution History**: Searchable test run log with duration metrics, error stack traces, and framework tag filters.

### 4. 🎯 Selector Strategy & Flakiness Debugger Playground
* **Selector Health Matrix**: Compares **User-Facing Locators** (`getByRole`, `getByText`, `getByLabel`) vs **Fragile Selectors** (Deep XPaths, dynamic CSS classes).
* **Dynamic Wait Simulator**: Interactive demonstration of avoiding fixed timeouts (`page.waitForTimeout`) in favor of network response intercepts (`page.waitForResponse` or `cy.intercept`).
* **Live Selector Tester**: Test selectors against real BookCart DOM elements with instant validation feedback.

### 5. 👁️ Visual Regression Diffing Tool
* **Snapshot Comparison Engine**: Compare Baseline vs Actual UI screenshots during automated visual testing.
* **Interactive Difference Modes**:
  - Side-by-Side Comparison
  - Highlighted Pixel Difference Overlay
  - Interactive Before/After Image Slider

### 6. ✨ Gemini AI Spec Generator & Debugger
* **Natural Language to Code**: Describe any QA test case scenario in plain English to generate Playwright/Cypress POM spec code.
* **Pre-loaded QA Scenarios**: Quick-start prompts for common e-commerce test flows (coupon validation, cart badge updates, API schema checks).
* **Flakiness Resolver**: Automatic application of dynamic waiting strategies to fix flaky element interactions.

### 7. ⚙️ CI/CD Pipeline & Cross-Browser Configuration
* **GitHub Actions Matrix**: Ready-to-use `.github/workflows/e2e-tests.yml` with parallel cross-browser execution across Chromium, Firefox, and WebKit.
* **Containerization**: Included Dockerfile based on official Microsoft Playwright images (`mcr.microsoft.com/playwright`).
* **Local CLI Cheatsheet**: Copyable terminal commands for headless execution, single spec filtering, and HTML report generation.

---

## 🛠️ Technology Stack

* **Frontend UI**: React 18, TypeScript, Tailwind CSS
* **Icons**: Lucide React
* **Testing Frameworks**: Playwright, Cypress (TypeScript)
* **Target Application**: [BookCart E-Commerce Web App](https://bookcart.azurewebsites.net/)
* **Build System**: Vite, Esbuild, Node.js

---

## 🚀 Quick Start Guide

### Prerequisites
* Node.js (v18 or higher)
* npm (v9 or higher)

### 1. Clone & Install Dependencies
```bash
git clone <repository-url>
cd e2e-test-suite-studio
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
The application will launch on `http://localhost:3000`.

### 3. Build for Production
```bash
npm run build
npm start
```

---

## 📂 Project Directory Structure

```text
├── src/
│   ├── components/            # UI Module Views
│   │   ├── Header.tsx         # Sleek Top Navigation Bar
│   │   ├── TestRunner.tsx     # Live Test Execution & Log Console
│   │   ├── CodeExplorer.tsx   # POM & Spec Code File Viewer
│   │   ├── ReportDashboard.tsx# Test Analytics & Allure Reports
│   │   ├── SelectorPlayground.tsx # Selector Strategy Matrix
│   │   ├── VisualRegression.tsx   # Snapshot Diffing Tool
│   │   ├── AITestGenerator.tsx   # AI Spec Generator powered by Gemini
│   │   └── CiCdConfig.tsx        # GitHub Actions & Docker Workflows
│   ├── data/
│   │   ├── testSuites.ts      # Test Case Definitions & Steps
│   │   └── pomFiles.ts        # Page Object Model Source Code
│   ├── types.ts               # Global TypeScript Interfaces
│   ├── App.tsx                # Main Application Layout Container
│   └── main.tsx               # React Entry Point
├── .github/
│   └── workflows/             # CI/CD Workflows
├── Dockerfile                 # Playwright Docker Container Setup
├── package.json               # Dependencies & Scripts
├── tsconfig.json              # TypeScript Configuration
└── README.md                  # Project Documentation
```

---

## 🧪 Local Command Line Execution (Playwright)

Run tests locally using the Playwright CLI:

```bash
# Run all E2E specs headlessly
npx playwright test

# Run tests in headed browser mode
npx playwright test --headed

# Run specific browser project (Chromium, Firefox, or WebKit)
npx playwright test --project=chromium

# Open interactive Playwright UI mode
npx playwright test --ui

# View generated HTML test report
npx playwright show-report
```

---

## 📄 License
This project is open-source and available under the **MIT License**.
