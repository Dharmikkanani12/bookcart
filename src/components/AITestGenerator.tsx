import React, { useState } from 'react';
import { FrameworkType } from '../types';
import { 
  Sparkles, 
  Send, 
  Copy, 
  Check, 
  RefreshCw, 
  Code2, 
  AlertCircle, 
  CheckCircle2, 
  Wand2, 
  FileCode,
  Terminal
} from 'lucide-react';

interface AITestGeneratorProps {
  framework: FrameworkType;
}

export const AITestGenerator: React.FC<AITestGeneratorProps> = ({ framework }) => {
  const [promptInput, setPromptInput] = useState<string>('');
  const [selectedPomContext, setSelectedPomContext] = useState<string>('CheckoutPage.ts');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedCodeOutput, setGeneratedCodeOutput] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const presetPrompts = [
    "Write a test to verify coupon code field validation during checkout on BookCart",
    "Generate Playwright test to verify cart badge count updates when deleting books",
    "Write API test for /api/Book endpoint validating price numeric schema",
    "Fix flaky wait issue for Angular material dialog overlay on BookCart"
  ];

  const handleGenerateTest = async (promptToUse?: string) => {
    const activePrompt = promptToUse || promptInput;
    if (!activePrompt.trim()) return;

    setIsGenerating(true);
    setErrorNotice(null);

    try {
      const response = await fetch('/api/ai-generate-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: activePrompt,
          framework: framework === 'playwright' ? 'Playwright (TypeScript)' : 'Cypress (TypeScript)',
          pageObject: selectedPomContext
        })
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedCodeOutput(data.generatedCode || '// Code generated successfully');
      } else {
        const errorData = await response.json().catch(() => ({}));
        // Provide intelligent fallback code if GEMINI_API_KEY is not yet added in user secrets
        generateFallbackCode(activePrompt);
        setErrorNotice(errorData.error || "Using built-in QA heuristic generator.");
      }
    } catch {
      generateFallbackCode(activePrompt);
      setErrorNotice("Using offline template generator.");
    } finally {
      setIsGenerating(false);
    }
  };

  const generateFallbackCode = (userPrompt: string) => {
    if (framework === 'playwright') {
      setGeneratedCodeOutput(`import { test, expect } from '@playwright/test';
import { ${selectedPomContext.replace('.ts', '')} } from '../pages/${selectedPomContext}';

test.describe('Generated Spec: ${userPrompt.slice(0, 40)}...', () => {
  test('Execute test case for BookCart', async ({ page }) => {
    // 1. Initialize Page Object Model
    const pom = new ${selectedPomContext.replace('.ts', '')}(page);
    await page.goto('https://bookcart.azurewebsites.net/');

    // 2. Dynamic Wait & Action
    await page.waitForResponse(resp => resp.url().includes('/api/') && resp.status() === 200);
    
    // User-facing semantic locator (No fragile XPath)
    const actionElement = page.getByRole('button', { name: /Submit|Apply|Confirm/i });
    await expect(actionElement).toBeVisible();
    await actionElement.click();

    // 3. Robust Assertion
    await expect(page.locator('snack-bar-container, mat-error')).toBeVisible();
  });
});`);
    } else {
      setGeneratedCodeOutput(`describe('Generated Cypress Spec: ${userPrompt.slice(0, 40)}...', () => {
  it('Executes test flow on BookCart', () => {
    cy.visit('https://bookcart.azurewebsites.net/');
    cy.intercept('GET', '**/api/**').as('apiCall');
    cy.wait('@apiCall').its('response.statusCode').should('eq', 200);

    cy.contains('button', /Submit|Apply|Confirm/i).click();
    cy.get('snack-bar-container, mat-error').should('be.visible');
  });
});`);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCodeOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Title Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center text-blue-600">
            <Sparkles className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-slate-900">
                Gemini AI Test Case Generator & Flakiness Debugger
              </h2>
              <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full uppercase tracking-wider border border-amber-200">
                AI Powered
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mt-0.5">
              Describe the feature or edge case you want to test on BookCart (https://bookcart.azurewebsites.net/), and Gemini will generate production-grade Playwright/Cypress TypeScript spec files adhering strictly to POM design rules.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Input & Preset Prompts Panel */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
          
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800 block uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1 h-3.5 bg-blue-600 rounded-full"></span>
              Target Page Object Context
            </label>
            <select
              value={selectedPomContext}
              onChange={e => setSelectedPomContext(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono focus:outline-none focus:border-blue-500 shadow-xs"
            >
              <option value="LoginPage.ts">LoginPage.ts (Authentication)</option>
              <option value="HomePage.ts">HomePage.ts (Catalog & Search)</option>
              <option value="CartPage.ts">CartPage.ts (Shopping Cart)</option>
              <option value="CheckoutPage.ts">CheckoutPage.ts (Checkout Shipping)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800 block uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1 h-3.5 bg-blue-600 rounded-full"></span>
              Describe Test Scenario in English
            </label>
            <textarea
              rows={4}
              value={promptInput}
              onChange={e => setPromptInput(e.target.value)}
              placeholder="e.g. Write a Playwright test to verify user cannot proceed to checkout with an empty cart..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 font-mono leading-relaxed resize-none shadow-xs"
            />
          </div>

          <button
            onClick={() => handleGenerateTest()}
            disabled={isGenerating || !promptInput.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-full text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-200 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Generating Test Code via Gemini...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                Generate {framework.toUpperCase()} Spec Code
              </>
            )}
          </button>

          {/* Quick Preset Prompts */}
          <div className="space-y-2 pt-4 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-500 block uppercase tracking-wider">
              Popular QA Test Scenarios:
            </span>
            <div className="space-y-2">
              {presetPrompts.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setPromptInput(preset);
                    handleGenerateTest(preset);
                  }}
                  className="w-full text-left p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-400 text-[11px] text-slate-700 hover:text-blue-700 font-medium transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                  <span className="line-clamp-1">{preset}</span>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Right Output Generated Spec Code */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col">
          
          <div className="bg-slate-950 border-b border-slate-800 px-5 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
              <Code2 className="w-4 h-4 text-blue-400" />
              <span className="font-bold text-slate-100">Generated Spec Code File</span>
            </div>

            {generatedCodeOutput && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy Spec'}
              </button>
            )}
          </div>

          {errorNotice && (
            <div className="bg-blue-950/60 border-b border-blue-500/30 px-4 py-2.5 text-[11px] text-blue-200 flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
              <span>{errorNotice}</span>
            </div>
          )}

          <div className="p-5 overflow-x-auto bg-slate-900 font-mono text-xs text-slate-200 leading-relaxed custom-scrollbar min-h-[380px]">
            {generatedCodeOutput ? (
              <pre><code>{generatedCodeOutput}</code></pre>
            ) : (
              <div className="h-[340px] flex flex-col items-center justify-center text-slate-500 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-800/80 flex items-center justify-center text-slate-400">
                  <Wand2 className="w-6 h-6" />
                </div>
                <p className="text-xs">Select a prompt chip or enter a description to generate code</p>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
