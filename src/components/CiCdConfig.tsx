import React, { useState } from 'react';
import { GitBranch, Terminal, Copy, Check, Download, Layers, ShieldCheck, Box } from 'lucide-react';

export const CiCdConfig: React.FC = () => {
  const [copiedFile, setCopiedFile] = useState<string | null>(null);

  const githubActionYml = `name: Playwright BookCart E2E Tests

on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]
  schedule:
    - cron: '0 6 * * *' # Daily regression run at 6 AM UTC

jobs:
  test-e2e:
    timeout-minutes: 15
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        browser: [chromium, firefox, webkit]

    steps:
      - name: Checkout Code Repository
        uses: actions/checkout@v4

      - name: Setup Node.js 20.x
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install Node Dependencies
        run: npm ci

      - name: Cache Playwright Browsers
        uses: actions/cache@v4
        id: playwright-cache
        with:
          path: ~/.cache/ms-playwright
          key: \${{ runner.os }}-playwright-\${{ hashFiles('package-lock.json') }}

      - name: Install Playwright Browsers
        if: steps.playwright-cache.outputs.cache-hit != 'true'
        run: npx playwright install --with-deps

      - name: Execute Playwright E2E Suite against BookCart
        run: npx playwright test --project=\${{ matrix.browser }}
        env:
          BASE_URL: 'https://bookcart.azurewebsites.net'

      - name: Upload Allure & HTML Test Report Artifacts
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report-\${{ matrix.browser }}
          path: playwright-report/
          retention-days: 14`;

  const dockerfileConfig = `FROM mcr.microsoft.com/playwright:v1.48.0-focal

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

CMD ["npx", "playwright", "test"]`;

  const handleCopy = (content: string, key: string) => {
    navigator.clipboard.writeText(content);
    setCopiedFile(key);
    setTimeout(() => setCopiedFile(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Title Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center text-blue-600">
            <GitBranch className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">
              CI/CD Pipeline & Cross-Browser Execution Configuration
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed mt-0.5">
              Automate your BookCart E2E suite on GitHub Actions with parallel matrix strategy across Chromium, Firefox, and WebKit browsers.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left GitHub Actions YML Viewer */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col">
          
          <div className="bg-slate-950 border-b border-slate-800 px-5 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
              <GitBranch className="w-4 h-4 text-blue-400" />
              <span className="font-bold text-slate-100">.github/workflows/e2e-tests.yml</span>
            </div>

            <button
              onClick={() => handleCopy(githubActionYml, 'gh')}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              {copiedFile === 'gh' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedFile === 'gh' ? 'Copied YML' : 'Copy YML'}
            </button>
          </div>

          <pre className="p-5 overflow-x-auto bg-slate-900 font-mono text-xs text-slate-300 leading-relaxed custom-scrollbar">
            <code>{githubActionYml}</code>
          </pre>

        </div>

        {/* Right Docker & Terminal Execution Cheatsheet */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* CLI Execution Cheat Sheet */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <span className="w-1 h-3.5 bg-blue-600 rounded-full"></span>
              <Terminal className="w-4 h-4 text-blue-600" />
              Local Command Line Execution
            </h3>

            <div className="space-y-2.5 text-xs font-mono">
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-slate-200">
                <span className="text-slate-400 block text-[10px] mb-1 font-sans"># Run all Playwright E2E tests:</span>
                <span className="text-emerald-400 font-bold">npx playwright test</span>
              </div>

              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-slate-200">
                <span className="text-slate-400 block text-[10px] mb-1 font-sans"># Run specific Auth suite in Chromium:</span>
                <span className="text-blue-400 font-bold">npx playwright test auth.spec.ts --project=chromium --headed</span>
              </div>

              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-slate-200">
                <span className="text-slate-400 block text-[10px] mb-1 font-sans"># Generate & open HTML Allure report:</span>
                <span className="text-amber-400 font-bold">npx playwright show-report</span>
              </div>
            </div>
          </div>

          {/* Docker Environment */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <span className="w-1 h-3.5 bg-blue-600 rounded-full"></span>
                <Box className="w-4 h-4 text-blue-600" />
                Containerization (Dockerfile)
              </h3>
              <button
                onClick={() => handleCopy(dockerfileConfig, 'docker')}
                className="text-slate-500 hover:text-blue-600 text-xs cursor-pointer"
              >
                {copiedFile === 'docker' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <pre className="bg-slate-900 p-4 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto">
              <code>{dockerfileConfig}</code>
            </pre>
          </div>

        </div>

      </div>

    </div>
  );
};
