import React, { useState } from 'react';
import { SelectorBestPractice } from '../types';
import { SELECTOR_BEST_PRACTICES } from '../data/bookcartData';
import { 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  Copy, 
  Check, 
  ShieldAlert, 
  Code2, 
  Sparkles,
  Terminal,
  HelpCircle
} from 'lucide-react';

export const SelectorPlayground: React.FC = () => {
  const [selectedPracticeIndex, setSelectedPracticeIndex] = useState<number>(0);
  const [testLocatorInput, setTestLocatorInput] = useState<string>("getByRole('button', { name: 'Login' })");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const activePractice = SELECTOR_BEST_PRACTICES[selectedPracticeIndex];

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Title Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-2">
        <div className="flex items-center gap-2">
          <Search className="w-5 h-5 text-indigo-400" />
          <h2 className="text-base font-bold text-slate-100">
            BookCart Locator Strategy & Selector Resilience Engine
          </h2>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          The roadmap.sh QA specification strictly bans fragile selectors (e.g. long XPath trees or Angular CSS classes). Here is how our Playwright & Cypress suites maintain 0% flakiness using user-facing semantic locators and data attributes.
        </p>
      </div>

      {/* Selector Comparison Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Elements Selector List */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            BookCart Key UI Elements
          </h3>

          <div className="space-y-2">
            {SELECTOR_BEST_PRACTICES.map((practice, idx) => {
              const isSelected = idx === selectedPracticeIndex;

              return (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedPracticeIndex(idx);
                    setTestLocatorInput(practice.recommendedSelector);
                  }}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-indigo-950/60 border-indigo-500/60 shadow-md text-indigo-200'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-xs mb-1">
                    <span>{practice.element}</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30">
                      {practice.recommendedType}
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-cyan-400 truncate">
                    {practice.recommendedSelector}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Active Practice Deep-Dive & Comparison */}
        <div className="lg:col-span-8 space-y-6">
          
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Code2 className="w-4 h-4 text-indigo-400" />
                Locator Strategy Analysis: {activePractice.element}
              </h3>
              <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2.5 py-1 rounded font-mono font-bold">
                Recommended Type: {activePractice.recommendedType}
              </span>
            </div>

            {/* Fragile vs Recommended Dual Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Fragile Selector Warning Card */}
              <div className="bg-rose-950/30 border border-rose-500/40 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
                  <ShieldAlert className="w-4 h-4" />
                  ❌ Fragile Anti-Pattern (Banned)
                </div>
                
                <div className="bg-slate-950 p-2.5 rounded border border-rose-500/30 font-mono text-xs text-rose-300 break-all">
                  {activePractice.fragileSelector}
                </div>

                <div className="text-xs text-slate-400 space-y-1">
                  <span className="text-rose-400 font-semibold block">Why this causes flakiness:</span>
                  <p className="leading-relaxed">{activePractice.fragileReason}</p>
                </div>
              </div>

              {/* Recommended Selector Resilience Card */}
              <div className="bg-emerald-950/30 border border-emerald-500/40 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4" />
                  ✔ Recommended Resilient Selector
                </div>

                <div className="bg-slate-950 p-2.5 rounded border border-emerald-500/30 font-mono text-xs text-emerald-300 font-bold">
                  {activePractice.recommendedSelector}
                </div>

                <div className="text-xs text-slate-400 space-y-1">
                  <span className="text-emerald-400 font-semibold block">Why this is resilient:</span>
                  <p className="leading-relaxed">{activePractice.explanation}</p>
                </div>
              </div>

            </div>

            {/* Framework Snippet Code Tabs */}
            <div className="space-y-3 pt-3 border-t border-slate-800">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Production Test Snippet Code
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                
                {/* Playwright */}
                <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-emerald-400 font-bold font-mono">Playwright TypeScript</span>
                    <button
                      onClick={() => handleCopy(activePractice.playwrightSnippet)}
                      className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
                    >
                      {copiedCode === activePractice.playwrightSnippet ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                  <pre className="font-mono text-[11px] text-slate-300 bg-slate-900 p-2 rounded overflow-x-auto">
                    <code>{activePractice.playwrightSnippet}</code>
                  </pre>
                </div>

                {/* Cypress */}
                <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-cyan-400 font-bold font-mono">Cypress TypeScript</span>
                    <button
                      onClick={() => handleCopy(activePractice.cypressSnippet)}
                      className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
                    >
                      {copiedCode === activePractice.cypressSnippet ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                  <pre className="font-mono text-[11px] text-slate-300 bg-slate-900 p-2 rounded overflow-x-auto">
                    <code>{activePractice.cypressSnippet}</code>
                  </pre>
                </div>

              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
