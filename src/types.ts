export type FrameworkType = 'playwright' | 'cypress';
export type BrowserType = 'chromium' | 'firefox' | 'webkit';
export type TestCategory = 'auth' | 'search' | 'cart' | 'checkout' | 'api' | 'visual';
export type TestStatus = 'idle' | 'running' | 'passed' | 'failed' | 'flaky' | 'skipped';

export interface TestStep {
  id: string;
  name: string;
  action: string;
  selector: string;
  selectorType: 'role' | 'label' | 'placeholder' | 'text' | 'data-testid' | 'css' | 'api';
  assertion: string;
  expectedResult: string;
  durationMs: number;
  status: TestStatus;
  screenshotUrl?: string;
  consoleLog?: string;
  networkRequest?: {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    url: string;
    status: number;
    responseTimeMs: number;
    requestBody?: any;
    responseBody?: any;
  };
}

export interface TestCase {
  id: string;
  title: string;
  requirement: string;
  category: TestCategory;
  description: string;
  pomsUsed: string[];
  playwrightCode: string;
  cypressCode: string;
  status: TestStatus;
  durationMs: number;
  steps: TestStep[];
  retryCount?: number;
  lastRun?: string;
  tags: string[];
}

export interface PageObjectFile {
  id: string;
  name: string;
  path: string;
  type: 'pom' | 'spec' | 'fixture' | 'config' | 'cicd';
  category?: TestCategory;
  playwrightContent: string;
  cypressContent: string;
  description: string;
}

export interface BookCartBook {
  bookId: number;
  title: string;
  author: string;
  category: string;
  price: number;
  coverFileName: string;
  stockQuantity: number;
}

export interface SelectorBestPractice {
  element: string;
  fragileSelector: string;
  fragileReason: string;
  recommendedSelector: string;
  recommendedType: 'Role' | 'Label' | 'Text' | 'Data-TestId' | 'Placeholder';
  explanation: string;
  playwrightSnippet: string;
  cypressSnippet: string;
}

export interface TargetStatus {
  online: boolean;
  status: number;
  latencyMs: number;
  bookCount?: number;
  error?: string;
  targetUrl: string;
}
