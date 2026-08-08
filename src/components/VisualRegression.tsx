import React, { useState } from 'react';
import { Eye, Sliders, AlertTriangle, CheckCircle2, Layers, RefreshCw, Code2, Copy, Check } from 'lucide-react';

export const VisualRegression: React.FC = () => {
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [showDiffHighlight, setShowDiffHighlight] = useState<boolean>(false);
  const [selectedView, setSelectedView] = useState<'home' | 'cart' | 'checkout'>('home');
  const [copied, setCopied] = useState<boolean>(false);

  const viewData = {
    home: {
      title: 'Home Book Catalog Grid',
      baselineUrl: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1000&auto=format&fit=crop&q=80',
      diffPixelRatio: '0.00%',
      status: 'passed',
      explanation: 'No unexpected layout shift or CSS regression detected in catalog card grid.'
    },
    cart: {
      title: 'Shopping Cart Table & Subtotals',
      baselineUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=1000&auto=format&fit=crop&q=80',
      diffPixelRatio: '0.01%',
      status: 'passed',
      explanation: 'Table column padding and subtotal font styling match baseline.'
    },
    checkout: {
      title: 'Checkout Shipping Form & Place Order Modal',
      baselineUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=1000&auto=format&fit=crop&q=80',
      diffPixelRatio: '0.00%',
      status: 'passed',
      explanation: 'Angular Material input field heights match baseline snapshot.'
    }
  }[selectedView];

  const playwrightVisualCode = `import { test, expect } from '@playwright/test';

test('Visual Regression - ${viewData.title}', async ({ page }) => {
  await page.goto('https://bookcart.azurewebsites.net/');
  await page.waitForLoadState('networkidle');

  // Mask dynamic clocks or notification banners before snapshot comparison
  await expect(page).toHaveScreenshot('${selectedView}-baseline.png', {
    maxDiffPixelRatio: 0.02,
    threshold: 0.1,
    animations: 'disabled'
  });
});`;

  const handleCopy = () => {
    navigator.clipboard.writeText(playwrightVisualCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Title Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Eye className="w-5 h-5 text-indigo-400" />
            Visual Regression & Screenshot Comparison Studio
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Compare visual baseline build screenshots against current test run to catch unexpected UI layout shifts.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          {(['home', 'cart', 'checkout'] as const).map(view => (
            <button
              key={view}
              onClick={() => setSelectedView(view)}
              className={`px-3 py-1.5 rounded-lg font-bold capitalize transition-all ${
                selectedView === view
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {view} Page
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Visual Comparison Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Stage Visual Canvas */}
        <div className="lg:col-span-8 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl space-y-3 p-4">
          
          <div className="flex items-center justify-between text-xs text-slate-300 font-mono">
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 font-bold">● Baseline Build</span>
              <span className="text-slate-600">vs</span>
              <span className="text-indigo-400 font-bold">● Current Build</span>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-slate-400 flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showDiffHighlight}
                  onChange={e => setShowDiffHighlight(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-rose-500 focus:ring-0"
                />
                Show Red Diff Mask
              </label>
            </div>
          </div>

          {/* Interactive Image Split Canvas Slider */}
          <div className="relative h-[380px] rounded-xl overflow-hidden border border-slate-800 select-none bg-slate-900">
            {/* Baseline Image */}
            <img 
              src={viewData.baselineUrl} 
              alt="Baseline Snapshot" 
              className="absolute inset-0 w-full h-full object-cover filter brightness-95" 
            />

            {/* Current Image Overlay clipped by Slider */}
            <div 
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${sliderPosition}%` }}
            >
              <img 
                src={viewData.baselineUrl} 
                alt="Current Run Snapshot" 
                className={`w-full h-full object-cover ${
                  showDiffHighlight ? 'hue-rotate-180 contrast-125' : ''
                }`} 
              />
            </div>

            {/* Visual Splitter Line Handle */}
            <div 
              className="absolute top-0 bottom-0 w-1 bg-indigo-500 cursor-ew-resize flex items-center justify-center shadow-2xl"
              style={{ left: `${sliderPosition}%` }}
            >
              <div className="w-7 h-7 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-xl border border-indigo-300 text-[10px] font-bold">
                ◄►
              </div>
            </div>

            {/* Slider Range Control Input */}
            <input
              type="range"
              min="0"
              max="100"
              value={sliderPosition}
              onChange={e => setSliderPosition(Number(e.target.value))}
              className="absolute inset-0 opacity-0 cursor-ew-resize w-full h-full"
            />
          </div>

          {/* Slider Position Indicator */}
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Slider Split Position: {sliderPosition}%</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Diff Ratio: {viewData.diffPixelRatio} (Passed)
            </span>
          </div>

        </div>

        {/* Right Info & Playwright Code Snippet */}
        <div className="lg:col-span-4 space-y-4">
          
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 shadow-xl text-xs">
            <h3 className="font-bold text-slate-100 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-400" />
              Visual Regression Results
            </h3>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2 font-mono">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Target Snapshot:</span>
                <span className="text-indigo-300 font-bold">{selectedView}-baseline.png</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Allowed Threshold:</span>
                <span className="text-slate-200">0.02 (2% max)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Actual Diff:</span>
                <span className="text-emerald-400 font-bold">{viewData.diffPixelRatio}</span>
              </div>
            </div>

            <p className="text-slate-400 leading-relaxed">
              {viewData.explanation}
            </p>
          </div>

          {/* Playwright Visual Code */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 shadow-xl">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-200 flex items-center gap-1.5 font-mono">
                <Code2 className="w-4 h-4 text-emerald-400" />
                Playwright Visual Spec Code
              </span>
              <button
                onClick={handleCopy}
                className="text-slate-400 hover:text-white transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <pre className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto">
              <code>{playwrightVisualCode}</code>
            </pre>
          </div>

        </div>

      </div>

    </div>
  );
};
